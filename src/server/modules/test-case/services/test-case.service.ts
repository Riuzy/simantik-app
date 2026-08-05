import { TestCaseRepository } from '../repositories/test-case.repository';
import { AppError } from '../../../middlewares/error-handler';
import {
  CreateTestCaseDTO,
  UpdateTestCaseDTO,
  CreateTestStepDTO,
  UpdateTestStepDTO,
  TestCaseFilters,
  DuplicateTestCaseDTO,
  CloneTestCaseDTO,
  ReorderStepsDTO,
} from '../types/test-case.dto';

export class TestCaseService {
  constructor(private repository: TestCaseRepository) {}

  async create(dto: CreateTestCaseDTO, createdById: string) {
    // Validate code uniqueness
    const existingByCode = await this.repository.findByCode(dto.code);
    if (existingByCode) {
      throw new AppError(409, 'Kode Test Case sudah digunakan');
    }

    return this.repository.create({
      code: dto.code,
      title: dto.title,
      description: dto.description,
      module: dto.module,
      priority: dto.priority || 'MEDIUM',
      status: dto.status || 'DRAFT',
      type: dto.type || 'MANUAL',
      tags: dto.tags ?? [],
      projectId: dto.projectId,
      createdById,
    });
  }

  async getById(id: string) {
    const testCase = await this.repository.findById(id);
    if (!testCase) {
      throw new AppError(404, 'Test case not found');
    }
    return testCase;
  }

  async getByCode(code: string) {
    return this.repository.findByCode(code);
  }

  async update(id: string, dto: UpdateTestCaseDTO) {
    const updateData: Record<string, unknown> = {};
    if (dto.code !== undefined) {
      // Validate code uniqueness if changing code
      const existingByCode = await this.repository.findByCode(dto.code);
      if (existingByCode && existingByCode.id !== id) {
        throw new AppError(409, 'Kode Test Case sudah digunakan');
      }
      updateData.code = dto.code;
    }
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.module !== undefined) updateData.module = dto.module;
    if (dto.priority !== undefined) updateData.priority = dto.priority;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.tags !== undefined) updateData.tags = dto.tags;

    return this.repository.update(id, updateData);
  }

  async delete(id: string) {
    const testCase = await this.repository.findById(id);
    if (!testCase) {
      throw new AppError(404, 'Test case not found');
    }
    await this.repository.softDelete(id);
  }

  async list(page: number, limit: number, filters: TestCaseFilters) {
    const result = await this.repository.list(page, limit, filters);
    return {
      data: result.items,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  async listModules(projectId?: string) {
    return this.repository.findDistinctModules(projectId);
  }

  async duplicate(id: string, dto: DuplicateTestCaseDTO) {
    const existingByCode = await this.repository.findByCode(dto.code);
    if (existingByCode) {
      throw new AppError(409, 'Test case with this code already exists');
    }

    return this.repository.duplicate(id, dto.code, dto.title);
  }

  async clone(id: string, projectId: string, dto: CloneTestCaseDTO) {
    const existingByCode = await this.repository.findByCode(dto.code);
    if (existingByCode) {
      throw new AppError(409, 'Test case with this code already exists');
    }

    return this.repository.clone(id, dto.projectId, dto.code, dto.title);
  }

  async addStep(testCaseId: string, dto: CreateTestStepDTO) {
    const testCase = await this.repository.findById(testCaseId);
    if (!testCase) {
      throw new AppError(404, 'Test case not found');
    }

    return this.repository.createTestStep(testCaseId, dto);
  }

  async updateStep(testCaseId: string, stepNumber: number, dto: UpdateTestStepDTO) {
    const testCase = await this.repository.findById(testCaseId);
    if (!testCase) {
      throw new AppError(404, 'Test case not found');
    }

    return this.repository.updateTestStep(testCaseId, stepNumber, dto);
  }

  async deleteStep(testCaseId: string, stepNumber: number) {
    const testCase = await this.repository.findById(testCaseId);
    if (!testCase) {
      throw new AppError(404, 'Test case not found');
    }

    await this.repository.deleteTestStep(testCaseId, stepNumber);
  }

  async getStep(testCaseId: string, stepNumber: number) {
    const testCase = await this.repository.findById(testCaseId);
    if (!testCase) {
      throw new AppError(404, 'Test case not found');
    }

    const step = await this.repository.getTestStep(testCaseId, stepNumber);
    if (!step) {
      throw new AppError(404, 'Test step not found');
    }

    return step;
  }

  async getStepsByTestCase(testCaseId: string) {
    const testCase = await this.repository.findById(testCaseId);
    if (!testCase) {
      throw new AppError(404, 'Test case not found');
    }

    return testCase.steps;
  }

  async reorderSteps(testCaseId: string, dto: ReorderStepsDTO) {
    const testCase = await this.repository.findById(testCaseId);
    if (!testCase) {
      throw new AppError(404, 'Test case not found');
    }

    return this.repository.reorderSteps(testCaseId, dto.stepIds);
  }
}
