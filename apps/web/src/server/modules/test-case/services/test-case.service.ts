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
} from '../types/test-case.dto';

export class TestCaseService {
  constructor(private repository: TestCaseRepository) {}

  async create(dto: CreateTestCaseDTO, createdById: string) {
    // Check code uniqueness
    const existingByCode = await this.repository.findByCode(dto.code);
    if (existingByCode) {
      throw new AppError(409, 'Test case with this code already exists');
    }

    // Create test case
    const testCase = await this.repository.create({
      code: dto.code,
      title: dto.title,
      description: dto.description,
      precondition: dto.precondition,
      priority: dto.priority || 'MEDIUM',
      status: dto.status || 'DRAFT',
      projectId: dto.projectId,
      createdById,
    });

    return testCase;
  }

  async getById(id: string) {
    const testCase = await this.repository.findById(id);
    if (!testCase) {
      throw new AppError(404, 'Test case not found');
    }
    return testCase;
  }

  async update(id: string, dto: UpdateTestCaseDTO) {
    const testCase = await this.repository.update(id, dto);
    return testCase;
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

  async duplicate(id: string, dto: DuplicateTestCaseDTO) {
    // Check code uniqueness
    const existingByCode = await this.repository.findByCode(dto.code);
    if (existingByCode) {
      throw new AppError(409, 'Test case with this code already exists');
    }

    const testCase = await this.repository.duplicate(id, dto.code, dto.title);
    return testCase;
  }

  async clone(id: string, projectId: string, dto: CloneTestCaseDTO) {
    // Check code uniqueness
    const existingByCode = await this.repository.findByCode(dto.code);
    if (existingByCode) {
      throw new AppError(409, 'Test case with this code already exists');
    }

    const testCase = await this.repository.clone(id, dto.projectId, dto.code, dto.title);
    return testCase;
  }

  // Test Step methods
  async addStep(testCaseId: string, dto: CreateTestStepDTO) {
    const testCase = await this.repository.findById(testCaseId);
    if (!testCase) {
      throw new AppError(404, 'Test case not found');
    }

    const step = await this.repository.createTestStep(testCaseId, dto);
    return step;
  }

  async updateStep(testCaseId: string, stepNumber: number, dto: UpdateTestStepDTO) {
    const testCase = await this.repository.findById(testCaseId);
    if (!testCase) {
      throw new AppError(404, 'Test case not found');
    }

    const step = await this.repository.updateTestStep(testCaseId, stepNumber, dto);
    return step;
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
}