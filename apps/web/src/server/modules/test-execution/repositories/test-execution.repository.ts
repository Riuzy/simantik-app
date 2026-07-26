import { PrismaClient, Prisma, ExecutionStatus, TestRunStatus } from '@prisma/client';
import { AppError } from '../../../middlewares/error-handler';
import { TestRunFilters } from '../types/test-execution.dto';

export class TestExecutionRepository {
  constructor(private prisma: PrismaClient) {}

  // Test Run methods
  async createTestRun(data: {
    code: string;
    name: string;
    description?: string | null;
    projectId: string;
    executedById: string;
    testCaseIds: string[];
  }) {
    return this.prisma.$transaction(async (tx) => {
      // Create test run
      const testRun = await tx.testRun.create({
        data: {
          code: data.code,
          name: data.name,
          description: data.description,
          projectId: data.projectId,
          executedById: data.executedById,
          status: 'PLANNED',
        },
        include: {
          executedBy: {
            select: { id: true, name: true, email: true },
          },
          project: {
            select: { id: true, code: true, name: true },
          },
        },
      });

      // Create executions for each test case
      if (data.testCaseIds && data.testCaseIds.length > 0) {
        const executionsData = data.testCaseIds.map((testCaseId: string) => ({
          testRunId: testRun.id,
          testCaseId,
          testerId: data.executedById,
          status: 'NOT_RUN',
        }));

        await tx.execution.createMany({
          data: executionsData as unknown as Prisma.ExecutionCreateManyInput[],
        });
      }

      return testRun;
    });
  }

  async findTestRunById(id: string) {
    return this.prisma.testRun.findFirst({
      where: { id, deletedAt: null },
      include: {
        executedBy: {
          select: { id: true, name: true, email: true },
        },
        project: {
          select: { id: true, code: true, name: true },
        },
        _count: {
          select: { executions: true },
        },
      },
    });
  }

  async updateTestRun(id: string, data: {
    name?: string;
    description?: string | null;
    status?: string;
  }) {
    const existing = await this.findTestRunById(id);
    if (!existing) {
      throw new AppError(404, 'Test run not found');
    }

    return this.prisma.testRun.update({
      where: { id },
      data: data as unknown as Prisma.TestRunUpdateInput,
      include: {
        executedBy: {
          select: { id: true, name: true, email: true },
        },
        project: {
          select: { id: true, code: true, name: true },
        },
      },
    });
  }

  async softDeleteTestRun(id: string) {
    const existing = await this.findTestRunById(id);
    if (!existing) {
      throw new AppError(404, 'Test run not found');
    }

    return this.prisma.testRun.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async listTestRuns(page: number, limit: number, filters: TestRunFilters = {}) {
    const skip = (page - 1) * limit;

    const where: Prisma.TestRunWhereInput = { deletedAt: null };

    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.status) where.status = filters.status as TestRunStatus;
    if (filters.executedById) where.executedById = filters.executedById;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { code: { contains: filters.search } },
      ];
    }

    const orderBy: Prisma.TestRunOrderByWithRelationInput = {};
    orderBy[filters.sortBy || 'createdAt'] = filters.sortOrder || 'desc';

    const [items, total] = await this.prisma.$transaction([
      this.prisma.testRun.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          code: true,
          name: true,
          status: true,
          startedAt: true,
          completedAt: true,
          createdAt: true,
          executedBy: {
            select: { id: true, name: true },
          },
          project: {
            select: { id: true, code: true, name: true },
          },
          _count: {
            select: { executions: true },
          },
        },
      }),
      this.prisma.testRun.count({ where }),
    ]);

    return { items, total, totalPages: Math.ceil(total / limit) };
  }

  async findTestRunByCode(code: string) {
    return this.prisma.testRun.findFirst({
      where: { code, deletedAt: null },
    });
  }

  async startTestRun(id: string) {
    return this.prisma.testRun.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });
  }

  async finishTestRun(id: string, status: TestRunStatus = 'COMPLETED') {
    return this.prisma.testRun.update({
      where: { id },
      data: {
        status,
        completedAt: new Date(),
      },
    });
  }

  // Execution methods
  async findExecution(testRunId: string, testCaseId: string) {
    return this.prisma.execution.findUnique({
      where: {
        testRunId_testCaseId: { testRunId, testCaseId },
      },
      include: {
        testCase: {
          select: {
            id: true,
            code: true,
            title: true,
            priority: true,
            steps: {
              select: {
                id: true,
                stepNumber: true,
                action: true,
                expectedResult: true,
              },
              orderBy: { stepNumber: 'asc' },
            },
          },
        },
        tester: {
          select: { id: true, name: true },
        },
        result: true,
      },
    });
  }

  async updateExecution(testRunId: string, testCaseId: string, data: {
    status: string;
    testerId: string;
  }) {
    const existing = await this.findExecution(testRunId, testCaseId);
    if (!existing) {
      throw new AppError(404, 'Execution not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const execution = await tx.execution.update({
        where: {
          testRunId_testCaseId: { testRunId, testCaseId },
        },
        data: {
          ...data,
          executedAt: new Date(),
        } as unknown as Prisma.ExecutionUpdateInput,
        include: {
          testCase: {
            select: {
              id: true,
              code: true,
              title: true,
              priority: true,
            },
          },
          tester: {
            select: { id: true, name: true },
          },
        },
      });

      // Create or update execution result
      await tx.executionResult.upsert({
        where: { executionId: execution.id },
        create: {
          executionId: execution.id,
        },
        update: {},
      });

      return execution;
    });
  }

  async listExecutions(testRunId: string, page: number, limit: number, status?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.ExecutionWhereInput = { testRunId };
    if (status) where.status = status as ExecutionStatus;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.execution.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          testRunId: true,
          testCaseId: true,
          status: true,
          executedAt: true,
          createdAt: true,
          testCase: {
            select: {
              id: true,
              code: true,
              title: true,
              priority: true,
            },
          },
          tester: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.execution.count({ where }),
    ]);

    return { items, total, totalPages: Math.ceil(total / limit) };
  }

  // Execution Result methods
  async updateExecutionResult(executionId: string, data: {
    actualResult?: string | null;
    environment?: string | null;
    browser?: string | null;
    operatingSystem?: string | null;
    device?: string | null;
    notes?: string | null;
    duration?: number;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // Verify execution exists
      const execution = await tx.execution.findUnique({
        where: { id: executionId },
      });

      if (!execution) {
        throw new AppError(404, 'Execution not found');
      }

      // Upsert execution result
      return tx.executionResult.upsert({
        where: { executionId },
        create: {
          executionId,
          ...data,
        },
        update: data,
      });
    });
  }

  async getExecutionById(id: string) {
    return this.prisma.execution.findUnique({
      where: { id },
      include: {
        testCase: {
          select: {
            id: true,
            code: true,
            title: true,
            priority: true,
            steps: {
              select: {
                id: true,
                stepNumber: true,
                action: true,
                expectedResult: true,
              },
              orderBy: { stepNumber: 'asc' },
            },
          },
        },
        tester: {
          select: { id: true, name: true },
        },
        result: true,
      },
    });
  }

  // Statistics
  async getTestRunStatistics(testRunId: string) {
    const executions = await this.prisma.execution.groupBy({
      by: ['status'],
      where: { testRunId },
      _count: true,
    });

    type Statistics = {
      total: number;
      notRun: number;
      passed: number;
      failed: number;
      blocked: number;
      skipped: number;
    };

    const stats: Statistics = {
      total: 0,
      notRun: 0,
      passed: 0,
      failed: 0,
      blocked: 0,
      skipped: 0,
    };

    executions.forEach((item) => {
      stats.total += item._count;
      if (item.status === 'NOT_RUN') stats.notRun += item._count;
      if (item.status === 'PASSED') stats.passed += item._count;
      if (item.status === 'FAILED') stats.failed += item._count;
      if (item.status === 'BLOCKED') stats.blocked += item._count;
      if (item.status === 'SKIPPED') stats.skipped += item._count;
    });

    const passRate = stats.total > 0 ? (stats.passed / stats.total) * 100 : 0;

    return { ...stats, passRate: Math.round(passRate * 100) / 100 };
  }
}