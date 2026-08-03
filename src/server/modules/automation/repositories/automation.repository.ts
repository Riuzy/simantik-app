import { PrismaClient, ExecutionStatus, Prisma } from '@prisma/client';
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

  async createExecution(data: {
    number: string;
    projectId: string;
    testCaseId: string;
    browser?: string;
    environment?: string;
    generatedScript?: string;
  }) {
    return this.prisma.execution.create({
      data: {
        number: data.number,
        project: { connect: { id: data.projectId } },
        testCase: { connect: { id: data.testCaseId } },
        browser: data.browser,
        environment: data.environment,
        generatedScript: data.generatedScript,
        status: 'RUNNING',
        startedAt: new Date(),
      } as Prisma.ExecutionCreateInput,
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
    const [execution] = await this.prisma.$transaction([
      this.prisma.execution.update({
        where: { id },
        data: {
          status,
          durationMs,
          finishedAt: new Date(),
          screenshotPath,
          ...(consoleLog ? { consoleLog: consoleLog as Prisma.InputJsonValue } : {}),
        },
      }),
      this.prisma.testCase.update({
        where: { id: testCaseId },
        data: {
          lastExecutionStatus,
          lastExecutedAt: new Date(),
          lastExecutionId: id,
        },
      }),
    ]);
    return execution;
  }

  async markTestCaseRunning(testCaseId: string, executionId: string) {
    return this.prisma.testCase.update({
      where: { id: testCaseId },
      data: {
        lastExecutionStatus: 'RUNNING',
        lastExecutedAt: new Date(),
        lastExecutionId: executionId,
      },
    });
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
}