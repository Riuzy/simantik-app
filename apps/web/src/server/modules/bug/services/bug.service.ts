import { BugRepository } from '../repositories/bug.repository';
import { AppError } from '../../../middlewares/error-handler';
import {
  CreateBugDTO,
  UpdateBugDTO,
  AssignBugDTO,
  BugFilters,
  CreateCommentDTO,
  CreateAttachmentDTO,
} from '../types/bug.dto';

export class BugService {
  constructor(private repository: BugRepository) {}

  // Bug CRUD
  async createBug(dto: CreateBugDTO, reportedById: string) {
    const existingByCode = await this.repository.findByCode(dto.code);
    if (existingByCode) {
      throw new AppError(409, 'Bug with this code already exists');
    }

    const bug = await this.repository.createBug({
      ...dto,
      reportedById,
    });

    return bug;
  }

  async getBugById(id: string) {
    const bug = await this.repository.findBugById(id);
    if (!bug) {
      throw new AppError(404, 'Bug not found');
    }
    return bug;
  }

  async updateBug(id: string, dto: UpdateBugDTO, changedById: string) {
    const bug = await this.repository.findBugById(id);
    if (!bug) {
      throw new AppError(404, 'Bug not found');
    }

    const updatedBug = await this.repository.updateBugWithHistory(id, dto, changedById);
    return updatedBug;
  }

  async deleteBug(id: string) {
    const bug = await this.repository.findBugById(id);
    if (!bug) {
      throw new AppError(404, 'Bug not found');
    }
    await this.repository.softDeleteBug(id);
  }

  async listBugs(page: number, limit: number, filters: BugFilters) {
    const result = await this.repository.listBugs(page, limit, filters);
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

  // Status transitions
  async assignBug(id: string, dto: AssignBugDTO, changedById: string) {
    const bug = await this.repository.findBugById(id);
    if (!bug) {
      throw new AppError(404, 'Bug not found');
    }

    const updatedBug = await this.repository.updateBugWithHistory(id, {
      assignedToId: dto.assignedToId,
    }, changedById);

    return updatedBug;
  }

  async resolveBug(id: string, changedById: string) {
    const bug = await this.repository.findBugById(id);
    if (!bug) {
      throw new AppError(404, 'Bug not found');
    }

    if (bug.status !== 'IN_PROGRESS' && bug.status !== 'READY_FOR_RETEST') {
      throw new AppError(400, 'Bug can only be resolved from IN_PROGRESS or READY_FOR_RETEST status');
    }

    const updatedBug = await this.repository.updateBugWithHistory(id, {
      status: 'RESOLVED',
    }, changedById);

    return { message: 'Bug resolved successfully', bug: updatedBug };
  }

  async closeBug(id: string, changedById: string) {
    const bug = await this.repository.findBugById(id);
    if (!bug) {
      throw new AppError(404, 'Bug not found');
    }

    if (bug.status !== 'RESOLVED' && bug.status !== 'READY_FOR_RETEST') {
      throw new AppError(400, 'Bug can only be closed from RESOLVED or READY_FOR_RETEST status');
    }

    const updatedBug = await this.repository.updateBugWithHistory(id, {
      status: 'CLOSED',
    }, changedById);

    return { message: 'Bug closed successfully', bug: updatedBug };
  }

  async reopenBug(id: string, changedById: string) {
    const bug = await this.repository.findBugById(id);
    if (!bug) {
      throw new AppError(404, 'Bug not found');
    }

    if (bug.status !== 'RESOLVED' && bug.status !== 'CLOSED') {
      throw new AppError(400, 'Bug can only be reopened from RESOLVED or CLOSED status');
    }

    const updatedBug = await this.repository.updateBugWithHistory(id, {
      status: 'OPEN',
    }, changedById);

    return { message: 'Bug reopened successfully', bug: updatedBug };
  }

  async inProgressBug(id: string, changedById: string) {
    const bug = await this.repository.findBugById(id);
    if (!bug) {
      throw new AppError(404, 'Bug not found');
    }

    if (bug.status !== 'OPEN') {
      throw new AppError(400, 'Bug can only be set to IN_PROGRESS from OPEN status');
    }

    const updatedBug = await this.repository.updateBugWithHistory(id, {
      status: 'IN_PROGRESS',
    }, changedById);

    return { message: 'Bug marked as in progress', bug: updatedBug };
  }

  // Comments
  async addComment(bugId: string, dto: CreateCommentDTO, userId: string) {
    const bug = await this.repository.findBugById(bugId);
    if (!bug) {
      throw new AppError(404, 'Bug not found');
    }

    return this.repository.createComment(bugId, { ...dto, userId });
  }

  async listComments(bugId: string, page: number, limit: number) {
    const bug = await this.repository.findBugById(bugId);
    if (!bug) {
      throw new AppError(404, 'Bug not found');
    }

    return this.repository.listComments(bugId, page, limit);
  }

  async deleteComment(bugId: string, commentId: string) {
    const comment = await this.repository.deleteComment(bugId, commentId);
    return comment;
  }

  // Attachments
  async addAttachment(bugId: string, dto: CreateAttachmentDTO, uploadedById: string) {
    const bug = await this.repository.findBugById(bugId);
    if (!bug) {
      throw new AppError(404, 'Bug not found');
    }

    return this.repository.createAttachment(bugId, { ...dto, uploadedById });
  }

  async listAttachments(bugId: string, page: number, limit: number) {
    const bug = await this.repository.findBugById(bugId);
    if (!bug) {
      throw new AppError(404, 'Bug not found');
    }

    return this.repository.listAttachments(bugId, page, limit);
  }

  async deleteAttachment(bugId: string, attachmentId: string) {
    return this.repository.deleteAttachment(bugId, attachmentId);
  }

  // History
  async listHistory(bugId: string, page: number, limit: number) {
    const bug = await this.repository.findBugById(bugId);
    if (!bug) {
      throw new AppError(404, 'Bug not found');
    }

    return this.repository.listHistory(bugId, page, limit);
  }

  // Statistics
  async getBugStatistics(projectId?: string) {
    return this.repository.getBugStatistics(projectId);
  }
}