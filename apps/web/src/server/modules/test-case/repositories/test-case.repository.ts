import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../../../middlewares/error-handler';
import { TestCaseFilters } from '../types/test-case.dto';

interface CreateStepData {
  action: string;
  description?: string;
  locatorStrategy?: string;
  locatorValue?: string;
  inputValue?: string;
  expectedResult?: string;
  stepNumber?: number;
}

interface UpdateStepData {
  action?: string;
  description?: string;
  locatorStrategy?: string;
  locatorValue?: string;
  inputValue?: string;
  expectedResult?: string;
}

const testCaseInclude = {
  createdBy: { select: { id: true, name: true, email: true, avatar: true } },
  project: { select: { id: true, code: true, name: true } },
  steps: { orderBy: { stepNumber: 'asc' as const } },
} as const;

export class TestCaseRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Record<string, unknown>) {
    return this.prisma.testCase.create({
      data: data as Prisma.TestCaseCreateInput,
      include: testCaseInclude,
    });
  }

  async findById(id: string) {
    return this.prisma.testCase.findFirst({
      where: { id, deletedAt: null },
      include: {
        ...testCaseInclude,
        _count: { select: { steps: true } },
      },
    });
  }

  async update(id: string, data: Record<string, unknown>) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new AppError(404, 'Test case not found');
    }

    return this.prisma.testCase.update({
      where: { id },
      data: data as Prisma.TestCaseUpdateInput,
      include: {
        createdBy: { select: { id: true, name: true, email: true, avatar: true } },
        project: { select: { id: true, code: true, name: true } },
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
      data: { deletedAt: new Date() },
    });
  }

  async list(page: number, limit: number, filters: TestCaseFilters = {}) {
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.priority) where.priority = filters.priority;
    if (filters.status) where.status = filters.status;
    if (filters.createdById) where.createdById = filters.createdById;
    if (filters.tag) {
      where.tags = { has: filters.tag };
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Record<string, 'asc' | 'desc'> = {};
    orderBy[filters.sortBy || 'createdAt'] = filters.sortOrder || 'desc';

    const [items, total] = await this.prisma.$transaction([
      this.prisma.testCase.findMany({
        where: where as Prisma.TestCaseWhereInput,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          code: true,
          title: true,
          module: true,
          priority: true,
          status: true,
          tags: true,
          createdAt: true,
          createdBy: { select: { id: true, name: true, avatar: true } },
          project: { select: { id: true, code: true, name: true, slug: true } },
          _count: { select: { steps: true } },
        },
      }),
      this.prisma.testCase.count({ where: where as Prisma.TestCaseWhereInput }),
    ]);

    return {
      items,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByCode(code: string) {
    return this.prisma.testCase.findFirst({
      where: { code, deletedAt: null },
      include: testCaseInclude,
    });
  }

  async findLatestCode() {
    return this.prisma.testCase.findFirst({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: { code: true },
    });
  }

  async duplicate(id: string, newCode: string, newTitle?: string) {
    return this.prisma.$transaction(async (tx) => {
      const original = await tx.testCase.findUnique({
        where: { id },
        include: { steps: { orderBy: { stepNumber: 'asc' } } },
      });

      if (!original) {
        throw new AppError(404, 'Test case not found');
      }

      const duplicated = await tx.testCase.create({
        data: {
          code: newCode,
          title: newTitle || original.title,
          description: original.description,
          module: original.module,
          priority: original.priority,
          status: original.status,
          tags: (original.tags as string[] | null) ?? [],
          projectId: original.projectId,
          createdById: original.createdById,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: { steps: true },
      });

      if (original.steps.length > 0) {
        await tx.testStep.createMany({
          data: original.steps.map((step) => ({
            testCaseId: duplicated.id,
            stepNumber: step.stepNumber,
            action: step.action,
            description: step.description,
            locatorStrategy: step.locatorStrategy,
            locatorValue: step.locatorValue,
            inputValue: step.inputValue,
            expectedResult: step.expectedResult,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
        });
      }

      return this.prisma.testCase.findUnique({
        where: { id: duplicated.id },
        include: testCaseInclude,
      });
    });
  }

  async clone(id: string, projectId: string, newCode: string, newTitle?: string) {
    return this.prisma.$transaction(async (tx) => {
      const original = await tx.testCase.findUnique({
        where: { id },
        include: { steps: { orderBy: { stepNumber: 'asc' } } },
      });

      if (!original) {
        throw new AppError(404, 'Test case not found');
      }

      const project = await tx.project.findUnique({ where: { id: projectId } });
      if (!project) {
        throw new AppError(404, 'Target project not found');
      }

      const cloned = await tx.testCase.create({
        data: {
          code: newCode,
          title: newTitle || original.title,
          description: original.description,
          module: original.module,
          priority: original.priority,
          status: original.status,
          tags: (original.tags as string[] | null) ?? [],
          projectId,
          createdById: original.createdById,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: { steps: true },
      });

      if (original.steps.length > 0) {
        await tx.testStep.createMany({
          data: original.steps.map((step) => ({
            testCaseId: cloned.id,
            stepNumber: step.stepNumber,
            action: step.action,
            description: step.description,
            locatorStrategy: step.locatorStrategy,
            locatorValue: step.locatorValue,
            inputValue: step.inputValue,
            expectedResult: step.expectedResult,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
        });
      }

      return this.prisma.testCase.findUnique({
        where: { id: cloned.id },
        include: testCaseInclude,
      });
    });
  }

  async createTestStep(testCaseId: string, data: CreateStepData) {
    return this.prisma.$transaction(async (tx) => {
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
          description: data.description ?? null,
          locatorStrategy: data.locatorStrategy ?? null,
          locatorValue: data.locatorValue ?? null,
          inputValue: data.inputValue ?? null,
          expectedResult: data.expectedResult ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    });
  }

  async updateTestStep(testCaseId: string, stepNumber: number, data: UpdateStepData) {
    const existing = await this.prisma.testStep.findUnique({
      where: { testCaseId_stepNumber: { testCaseId, stepNumber } },
    });

    if (!existing) {
      throw new AppError(404, 'Test step not found');
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.action !== undefined) updateData.action = data.action;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.locatorStrategy !== undefined) updateData.locatorStrategy = data.locatorStrategy;
    if (data.locatorValue !== undefined) updateData.locatorValue = data.locatorValue;
    if (data.inputValue !== undefined) updateData.inputValue = data.inputValue;
    if (data.expectedResult !== undefined) updateData.expectedResult = data.expectedResult;

    return this.prisma.testStep.update({
      where: { testCaseId_stepNumber: { testCaseId, stepNumber } },
      data: updateData,
    });
  }

  async deleteTestStep(testCaseId: string, stepNumber: number) {
    const existing = await this.prisma.testStep.findUnique({
      where: { testCaseId_stepNumber: { testCaseId, stepNumber } },
    });

    if (!existing) {
      throw new AppError(404, 'Test step not found');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.testStep.delete({
        where: { testCaseId_stepNumber: { testCaseId, stepNumber } },
      });

      await tx.testStep.updateMany({
        where: { testCaseId, stepNumber: { gt: stepNumber } },
        data: { stepNumber: { decrement: 1 }, updatedAt: new Date() },
      });
    });
  }

  async getTestStep(testCaseId: string, stepNumber: number) {
    return this.prisma.testStep.findUnique({
      where: { testCaseId_stepNumber: { testCaseId, stepNumber } },
    });
  }

  async reorderSteps(testCaseId: string, stepIds: string[]) {
    return this.prisma.$transaction(async (tx) => {
      for (let i = 0; i < stepIds.length; i++) {
        await tx.testStep.updateMany({
          where: { id: stepIds[i], testCaseId },
          data: { stepNumber: i + 1, updatedAt: new Date() },
        });
      }

      return tx.testStep.findMany({
        where: { testCaseId },
        orderBy: { stepNumber: 'asc' },
      });
    });
  }
}
