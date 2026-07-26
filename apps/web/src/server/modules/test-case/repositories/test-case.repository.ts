import { PrismaClient } from '@prisma/client';
import { AppError } from '../../../middlewares/error-handler';
import { TestCaseFilters } from '../types/test-case.dto';

export class TestCaseRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Record<string, string | undefined>) {
    return this.prisma.testCase.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: data as any,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        steps: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.testCase.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        steps: {
          orderBy: {
            stepNumber: 'asc',
          },
        },
        _count: {
          select: {
            steps: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Record<string, string | undefined>) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new AppError(404, 'Test case not found');
    }

    return this.prisma.testCase.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: data as any,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });
  }

  async softDelete(id: string) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new AppError(404, 'Test case not found');
    }

    return this.prisma.testCase.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async list(page: number, limit: number, filters: TestCaseFilters = {}) {
    const skip = (page - 1) * limit;

    type WhereClause = {
      deletedAt: null;
      projectId?: string;
      status?: string;
      priority?: string;
      createdById?: string;
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' };
        code?: { contains: string; mode: 'insensitive' };
        precondition?: { contains: string; mode: 'insensitive' };
      }>;
    };

    const where: WhereClause = {
      deletedAt: null,
    };

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.createdById) {
      where.createdById = filters.createdById;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } },
        { precondition: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    type OrderByClause = {
      createdAt?: 'asc' | 'desc';
      title?: 'asc' | 'desc';
      updatedAt?: 'asc' | 'desc';
      priority?: 'asc' | 'desc';
    };

    const orderBy: OrderByClause = {};
    
    if (filters.sortBy === 'priority') {
      orderBy.priority = filters.sortOrder || 'desc';
    } else {
      orderBy[filters.sortBy || 'createdAt'] = filters.sortOrder || 'desc';
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.testCase.findMany({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        where: where as any,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          code: true,
          title: true,
          priority: true,
          status: true,
          createdAt: true,
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
          project: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          _count: {
            select: {
              steps: true,
            },
          },
        },
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.prisma.testCase.count({ where: where as any }),
    ]);

    return {
      items,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByCode(code: string) {
    return this.prisma.testCase.findFirst({
      where: {
        code,
        deletedAt: null,
      },
    });
  }

  async createWithSteps(data: Record<string, unknown>) {
    return this.prisma.$transaction(async (tx) => {
      // Create test case
      const testCase = await tx.testCase.create({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: data as any,
      });

      // Create steps
      if (data.steps && (data.steps as Array<Record<string, unknown>>).length > 0) {
        const stepsData = (data.steps as Array<Record<string, unknown>>).map((step) => ({
          testCaseId: testCase.id,
          stepNumber: step.stepNumber as number,
          action: step.action as string,
          expectedResult: step.expectedResult as string,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        await tx.testStep.createMany({
          data: stepsData,
        });
      }

      return this.prisma.testCase.findUnique({
        where: { id: testCase.id },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          steps: true,
        },
      });
    });
  }

  async updateWithSteps(id: string, data: Record<string, unknown>) {
    return this.prisma.$transaction(async (tx) => {
      // Update test case
      await tx.testCase.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      // Handle steps
      if (data.steps && (data.steps as Array<Record<string, unknown>>).length > 0) {
        // Delete existing steps
        await tx.testStep.deleteMany({
          where: { testCaseId: id },
        });

        // Create new steps
        if ((data.steps as Array<Record<string, unknown>>).length > 0) {
          const stepsData = (data.steps as Array<Record<string, unknown>>).map((step) => ({
          testCaseId: id,
            stepNumber: step.stepNumber as number,
            action: step.action as string,
            expectedResult: step.expectedResult as string,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));

          await tx.testStep.createMany({
            data: stepsData,
          });
        }
      }

      return this.prisma.testCase.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          steps: true,
        },
      });
    });
  }

  async duplicate(id: string, newCode: string, newTitle?: string) {
    return this.prisma.$transaction(async (tx) => {
      // Find original test case
      const original = await tx.testCase.findUnique({
        where: { id },
        include: {
          steps: {
            orderBy: { stepNumber: 'asc' },
          },
        },
      });

      if (!original) {
        throw new AppError(404, 'Test case not found');
      }

      // Create duplicate
      const duplicated = await tx.testCase.create({
        data: {
          code: newCode,
          title: newTitle || original.title,
          description: original.description,
          precondition: original.precondition,
          priority: original.priority,
          status: 'DRAFT',
          projectId: original.projectId,
          createdById: original.createdById,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          steps: true,
        },
      });

      // Duplicate steps
      if (original.steps && original.steps.length > 0) {
        const stepsData = original.steps.map((step) => ({
          testCaseId: duplicated.id,
          stepNumber: step.stepNumber,
          action: step.action,
          expectedResult: step.expectedResult,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        await tx.testStep.createMany({
          data: stepsData,
        });
      }

      return this.prisma.testCase.findUnique({
        where: { id: duplicated.id },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          steps: true,
        },
      });
    });
  }

  async clone(id: string, projectId: string, newCode: string, newTitle?: string) {
    return this.prisma.$transaction(async (tx) => {
      // Find original test case
      const original = await tx.testCase.findUnique({
        where: { id },
        include: {
          steps: {
            orderBy: { stepNumber: 'asc' },
          },
        },
      });

      if (!original) {
        throw new AppError(404, 'Test case not found');
      }

      // Verify project exists
      const project = await tx.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new AppError(404, 'Target project not found');
      }

      // Create cloned test case in new project
      const cloned = await tx.testCase.create({
        data: {
          code: newCode,
          title: newTitle || original.title,
          description: original.description,
          precondition: original.precondition,
          priority: original.priority,
          status: 'DRAFT',
          projectId,
          createdById: original.createdById,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          steps: true,
        },
      });

      // Clone steps
      if (original.steps && original.steps.length > 0) {
        const stepsData = original.steps.map((step) => ({
          testCaseId: cloned.id,
          stepNumber: step.stepNumber,
          action: step.action,
          expectedResult: step.expectedResult,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        await tx.testStep.createMany({
          data: stepsData,
        });
      }

      return this.prisma.testCase.findUnique({
        where: { id: cloned.id },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          steps: true,
        },
      });
    });
  }

  // Test Step methods
  async createTestStep(testCaseId: string, data: {
    action: string;
    expectedResult: string;
    stepNumber?: number;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // Get max step number
      const maxStep = await tx.testStep.findFirst({
        where: { testCaseId },
        orderBy: { stepNumber: 'desc' },
        select: { stepNumber: true },
      });

      const stepNumber = (maxStep?.stepNumber || 0) + 1;

      return tx.testStep.create({
        data: {
          testCaseId,
          stepNumber,
          action: data.action,
          expectedResult: data.expectedResult,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    });
  }

  async updateTestStep(testCaseId: string, stepNumber: number, data: {
    action?: string;
    expectedResult?: string;
  }) {
    const existing = await this.prisma.testStep.findUnique({
      where: {
        testCaseId_stepNumber: {
          testCaseId,
          stepNumber,
        },
      },
    });

    if (!existing) {
      throw new AppError(404, 'Test step not found');
    }

    return this.prisma.testStep.update({
      where: {
        testCaseId_stepNumber: {
          testCaseId,
          stepNumber,
        },
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async deleteTestStep(testCaseId: string, stepNumber: number) {
    const existing = await this.prisma.testStep.findUnique({
      where: {
        testCaseId_stepNumber: {
          testCaseId,
          stepNumber,
        },
      },
    });

    if (!existing) {
      throw new AppError(404, 'Test step not found');
    }

    // Delete step and renumber remaining steps
    return this.prisma.$transaction(async (tx) => {
      await tx.testStep.delete({
        where: {
          testCaseId_stepNumber: {
            testCaseId,
            stepNumber,
          },
        },
      });

      // Renumber remaining steps
      await tx.testStep.updateMany({
        where: {
          testCaseId,
          stepNumber: { gt: stepNumber },
        },
        data: {
          stepNumber: { decrement: 1 },
          updatedAt: new Date(),
        },
      });
    });
  }

  async getTestStep(testCaseId: string, stepNumber: number) {
    return this.prisma.testStep.findUnique({
      where: {
        testCaseId_stepNumber: {
          testCaseId,
          stepNumber,
        },
      },
    });
  }
}