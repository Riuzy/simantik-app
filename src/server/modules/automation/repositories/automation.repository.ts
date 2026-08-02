import { PrismaClient, ExecutionStatus, Prisma } from '@prisma/client';
import { AppError } from '../../../middlewares/error-handler';

export class AutomationRepository {
  constructor(private prisma: PrismaClient) {}

  async getConfig(projectId: string) {
    return this.prisma.automationConfig.findUnique({ where: { projectId } });
  }

  async upsertConfig(projectId: string, data: Record<string, unknown>) {
    return this.prisma.automationConfig.upsert({
      where: { projectId },
      create: { project: { connect: { id: projectId } }, ...data } as Prisma.AutomationConfigCreateInput,
      update: { ...data, updatedAt: new Date() } as Prisma.AutomationConfigUpdateInput,
    });
  }

  async getProjectWithDetails(projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },
      include: { automationConfig: true },
    });
    if (!project) throw new AppError(404, 'Project not found');
    return project;
  }

  async getTestCaseForRun(testCaseId: string) {
    const testCase = await this.prisma.testCase.findFirst({
      where: { id: testCaseId, deletedAt: null },
      include: {
        project: { include: { automationConfig: true } },
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
    status: ExecutionStatus,
    durationMs: number,
    screenshotPath: string | null,
    error?: string | null,
  ) {
    const consoleLog = error ? { error } : null;
    return this.prisma.execution.update({
      where: { id },
      data: {
        status,
        durationMs,
        finishedAt: new Date(),
        screenshotPath,
        ...(consoleLog ? { consoleLog: consoleLog as Prisma.InputJsonValue } : {}),
      },
    });
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
