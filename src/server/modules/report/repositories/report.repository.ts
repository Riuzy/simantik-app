import { PrismaClient } from '@prisma/client';

export class ReportRepository {
  constructor(private prisma: PrismaClient) {}

  async getOverview() {
    const [
      totalProjects,
      totalTestCases,
      totalExecutions,
      passedExecutions,
      failedExecutions,
      errorExecutions,
      skippedExecutions,
      runningExecutions,
      recentExecutions,
    ] = await this.prisma.$transaction([
      this.prisma.project.count({ where: { deletedAt: null } }),
      this.prisma.testCase.count({ where: { deletedAt: null } }),
      this.prisma.execution.count({ where: { deletedAt: null } }),
      this.prisma.execution.count({ where: { deletedAt: null, status: 'PASSED' } }),
      this.prisma.execution.count({ where: { deletedAt: null, status: 'FAILED' } }),
      this.prisma.execution.count({ where: { deletedAt: null, status: 'ERROR' } }),
      this.prisma.execution.count({ where: { deletedAt: null, status: 'SKIPPED' } }),
      this.prisma.execution.count({ where: { deletedAt: null, status: 'RUNNING' } }),
      this.prisma.execution.findMany({
        where: { deletedAt: null },
        orderBy: { updatedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          number: true,
          status: true,
          runCount: true,
          durationMs: true,
          lastRunAt: true,
          createdAt: true,
          testCase: { select: { id: true, code: true, title: true, module: true } },
          project: { select: { id: true, slug: true, name: true } },
        },
      }),
    ]);

    return {
      totalProjects,
      totalTestCases,
      totalExecutions,
      executionStatus: {
        PASSED: passedExecutions,
        FAILED: failedExecutions,
        ERROR: errorExecutions,
        SKIPPED: skippedExecutions,
        RUNNING: runningExecutions,
      },
      recentExecutions,
    };
  }

  async getProjectReport(projectId: string) {
    const [project, totalTestCases, totalExecutions, passedExecutions, failedExecutions, errorExecutions, skippedExecutions, runningExecutions, recentExecutions] =
      await this.prisma.$transaction([
        this.prisma.project.findFirst({
          where: { id: projectId, deletedAt: null },
          select: { id: true, code: true, name: true, slug: true, status: true, createdAt: true },
        }),
        this.prisma.testCase.count({ where: { projectId, deletedAt: null } }),
        this.prisma.execution.count({ where: { projectId, deletedAt: null } }),
        this.prisma.execution.count({ where: { projectId, deletedAt: null, status: 'PASSED' } }),
        this.prisma.execution.count({ where: { projectId, deletedAt: null, status: 'FAILED' } }),
        this.prisma.execution.count({ where: { projectId, deletedAt: null, status: 'ERROR' } }),
        this.prisma.execution.count({ where: { projectId, deletedAt: null, status: 'SKIPPED' } }),
        this.prisma.execution.count({ where: { projectId, deletedAt: null, status: 'RUNNING' } }),
        this.prisma.execution.findMany({
          where: { projectId, deletedAt: null },
          orderBy: { updatedAt: 'desc' },
          take: 20,
          select: {
            id: true,
            number: true,
            status: true,
            runCount: true,
            durationMs: true,
            browser: true,
            lastRunAt: true,
            createdAt: true,
            testCase: { select: { id: true, code: true, title: true, module: true } },
          },
        }),
      ]);

    return {
      project,
      totalTestCases,
      totalExecutions,
      executionStatus: {
        PASSED: passedExecutions,
        FAILED: failedExecutions,
        ERROR: errorExecutions,
        SKIPPED: skippedExecutions,
        RUNNING: runningExecutions,
      },
      recentExecutions,
    };
  }
}
