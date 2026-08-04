import { PrismaClient, ExecutionStatus, Prisma } from '@prisma/client';
import { rmSync, existsSync } from 'fs';
import path from 'path';
import { AppError } from '../../../middlewares/error-handler';

export class AutomationRepository {
  constructor(private prisma: PrismaClient) {}

  async getTestCaseForRun(testCaseId: string) {
    const testCase = await this.prisma.testCase.findFirst({
      where: { id: testCaseId, deletedAt: null },
      select: {
        id: true,
        code: true,
        title: true,
        type: true,
        project: true,
        steps: { orderBy: { stepNumber: 'asc' } },
      },
    });
    if (!testCase) throw new AppError(404, 'Test case not found');
    return testCase;
  }

  async findLatestExecutionNumber() {
    return this.prisma.execution.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { number: true },
    });
  }

  /**
   * Returns the single active execution for a test case, or null if the test
   * case has never been run (or its previous execution was soft-deleted).
   */
  async findExecutionByTestCase(testCaseId: string) {
    return this.prisma.execution.findFirst({
      where: { testCaseId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        testCase: { select: { id: true, code: true, title: true } },
      },
    });
  }

  /**
   * Upsert semantics for the "one active execution per test case" model.
   * When an execution already exists for the test case it is UPDATED and its
   * runCount is incremented; otherwise a new execution row is CREATED.
   */
  async upsertExecutionByTestCase(data: {
    number: string;
    projectId: string;
    testCaseId: string;
    browser?: string;
    environment?: string;
  }) {
    const existing = await this.findExecutionByTestCase(data.testCaseId);
    const now = new Date();
    const runningState = {
      projectId: data.projectId,
      testCaseId: data.testCaseId,
      browser: data.browser,
      environment: data.environment,
      status: 'RUNNING' as ExecutionStatus,
      startedAt: now,
      finishedAt: null,
      durationMs: null,
      lastDurationMs: null,
      screenshotPath: null,
      videoPath: null,
      tracePath: null,
      errorMessage: null,
      generatedScript: null,
      lastRunAt: now,
      lastResult: 'RUNNING' as ExecutionStatus,
    };

    if (existing) {
      return this.prisma.execution.update({
        where: { id: existing.id },
        data: {
          ...runningState,
          runCount: { increment: 1 },
        },
      });
    }

    return this.prisma.execution.create({
      data: {
        ...runningState,
        number: data.number,
        runCount: 1,
      },
    });
  }

  async finishExecution(
    id: string,
    testCaseId: string,
    status: ExecutionStatus,
    durationMs: number,
    screenshotPath: string | null,
    error?: string | null,
  ) {
    const consoleLog = error ? { error } : null;
    const lastExecutionStatus = this.mapToLastResult(status);
    const now = new Date();
    const [execution] = await this.prisma.$transaction([
      this.prisma.execution.update({
        where: { id },
        data: {
          status,
          durationMs,
          lastDurationMs: durationMs,
          finishedAt: now,
          lastRunAt: now,
          lastResult: status,
          screenshotPath,
          ...(consoleLog ? { consoleLog: consoleLog as Prisma.InputJsonValue } : {}),
        },
      }),
      this.prisma.testCase.update({
        where: { id: testCaseId },
        data: {
          lastExecutionStatus,
          lastExecutedAt: now,
          lastExecutionId: id,
        },
      }),
    ]);
    return execution;
  }

async markTestCaseRunning(testCaseId: string, executionId: string) {
    const now = new Date();
    return this.prisma.$transaction([
      this.prisma.testCase.update({
        where: { id: testCaseId },
        data: {
          lastExecutionStatus: 'RUNNING',
          lastExecutedAt: now,
          lastExecutionId: executionId,
        },
      }),
      this.prisma.execution.update({
        where: { id: executionId },
        data: {
          status: 'RUNNING',
          startedAt: now,
          finishedAt: null,
          durationMs: null,
          lastDurationMs: null,
          screenshotPath: null,
          videoPath: null,
          tracePath: null,
          errorMessage: null,
          generatedScript: null,
          lastRunAt: now,
          lastResult: 'RUNNING',
        },
      }),
    ]);
  }

  private mapToLastResult(status: ExecutionStatus): 'NOT_RUN' | 'RUNNING' | 'PASSED' | 'FAILED' {
    switch (status) {
      case 'PASSED':
        return 'PASSED';
      case 'FAILED':
      case 'ERROR':
        return 'FAILED';
      case 'RUNNING':
        return 'RUNNING';
      default:
        return 'NOT_RUN';
    }
  }

  async getExecutionById(id: string) {
    return this.prisma.execution.findFirst({
      where: { id, deletedAt: null },
      include: {
        testCase: { select: { id: true, code: true, title: true } },
        project: { select: { id: true, code: true, name: true, slug: true } },
        logs: { orderBy: { timestamp: 'asc' } },
      },
    });
  }

  async updateExecutionGeneratedScript(id: string, generatedScript: string) {
    return this.prisma.execution.update({
      where: { id },
      data: { generatedScript },
    });
  }

  async createExecutionLogs(executionId: string, logs: Array<{ stepNumber?: number; action?: string; level: string; message: string }>) {
    if (logs.length === 0) return;
    await this.prisma.executionLog.createMany({
      data: logs.map((log) => ({
        executionId,
        stepNumber: log.stepNumber,
        action: log.action,
        level: log.level,
        message: log.message,
      })),
    });
  }

  /**
   * Removes every log row previously recorded for an execution so a re-run
   * only keeps the latest logs instead of accumulating history.
   */
  async clearExecutionLogs(executionId: string) {
    await this.prisma.executionLog.deleteMany({ where: { executionId } });
  }

  /**
   * Resets the execution history of a single test case:
   * - Hard-deletes its execution row (logs cascade via FK).
   * - Removes the stored screenshot file from disk.
   * - Resets the test case last-result fields to Not Run.
   * The next run creates a brand-new execution with a fresh number.
   */
  async resetExecutionHistory(testCaseId: string) {
    const execution = await this.findExecutionByTestCase(testCaseId);

    if (execution) {
      if (execution.screenshotPath) {
        const fullPath = path.resolve(process.cwd(), execution.screenshotPath);
        if (existsSync(fullPath)) {
          rmSync(fullPath, { force: true });
        }
      }
      await this.prisma.execution.delete({ where: { id: execution.id } });
    }

    await this.prisma.testCase.update({
      where: { id: testCaseId },
      data: {
        lastExecutionStatus: 'NOT_RUN',
        lastExecutedAt: null,
        lastExecutionId: null,
      },
    });

    return { reset: true };
  }
}