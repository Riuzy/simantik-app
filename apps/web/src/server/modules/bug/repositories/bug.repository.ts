import { PrismaClient, BugStatus, Severity, BugPriority } from '@prisma/client';
import { AppError } from '../../../middlewares/error-handler';
import { BugFilters } from '../types/bug.dto';

export class BugRepository {
  constructor(private prisma: PrismaClient) {}

  // Bug methods
  async createBug(data: {
    code: string;
    title: string;
    description?: string | null;
    severity: Severity;
    priority: BugPriority;
    executionId: string;
    projectId: string;
    reportedById: string;
    assignedToId?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // Create bug
      const bug = await tx.bugReport.create({
        data: {
          code: data.code,
          title: data.title,
          description: data.description,
          severity: data.severity,
          priority: data.priority,
          status: 'OPEN',
          executionId: data.executionId,
          projectId: data.projectId,
          reportedById: data.reportedById,
          assignedToId: data.assignedToId,
        },
        include: {
          execution: {
            select: {
              id: true,
              testCase: {
                select: {
                  id: true,
                  code: true,
                  title: true,
                },
              },
            },
          },
          project: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          reportedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Create initial history record
      await tx.bugHistory.create({
        data: {
          bugReportId: bug.id,
          changedById: data.reportedById,
          field: 'created',
          oldValue: null,
          newValue: `Bug ${bug.code} created`,
        },
      });

      return bug;
    });
  }

  async findBugById(id: string) {
    return this.prisma.bugReport.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        execution: {
          select: {
            id: true,
            testCase: {
              select: {
                id: true,
                code: true,
                title: true,
              },
            },
          },
        },
        project: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
            history: true,
          },
        },
      },
    });
  }

  async updateBug(id: string, data: {
    title?: string;
    description?: string | null;
    severity?: Severity;
    priority?: BugPriority;
    status?: BugStatus;
    assignedToId?: string;
  }) {
    const existing = await this.findBugById(id);
    if (!existing) {
      throw new AppError(404, 'Bug not found');
    }

    return this.prisma.bugReport.update({
      where: { id },
      data,
      include: {
        execution: {
          select: {
            id: true,
            testCase: {
              select: {
                id: true,
                code: true,
                title: true,
              },
            },
          },
        },
        project: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async softDeleteBug(id: string) {
    const existing = await this.findBugById(id);
    if (!existing) {
      throw new AppError(404, 'Bug not found');
    }

    return this.prisma.bugReport.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async listBugs(page: number, limit: number, filters: BugFilters = {}) {
    const skip = (page - 1) * limit;

    const where: {
      deletedAt: null;
      projectId?: string;
      status?: BugStatus;
      severity?: Severity;
      priority?: BugPriority;
      reportedById?: string;
      assignedToId?: string;
      OR?: Array<{
        title?: { contains: string };
        code?: { contains: string };
        description?: { contains: string };
      }>;
    } = {
      deletedAt: null,
    };

    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.status) where.status = filters.status;
    if (filters.severity) where.severity = filters.severity;
    if (filters.priority) where.priority = filters.priority;
    if (filters.reportedById) where.reportedById = filters.reportedById;
    if (filters.assignedToId) where.assignedToId = filters.assignedToId;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { code: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    type OrderBy = {
      createdAt?: 'asc' | 'desc';
      title?: 'asc' | 'desc';
      updatedAt?: 'asc' | 'desc';
      priority?: 'asc' | 'desc';
      severity?: 'asc' | 'desc';
    };

    const orderBy: OrderBy = {};
    orderBy[filters.sortBy || 'createdAt'] = filters.sortOrder || 'desc';

    const [items, total] = await this.prisma.$transaction([
      this.prisma.bugReport.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          code: true,
          title: true,
          severity: true,
          priority: true,
          status: true,
          createdAt: true,
          reportedBy: {
            select: {
              id: true,
              name: true,
            },
          },
          assignedTo: {
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
        },
      }),
      this.prisma.bugReport.count({ where }),
    ]);

    return { items, total, totalPages: Math.ceil(total / limit) };
  }

  async findByCode(code: string) {
    return this.prisma.bugReport.findFirst({
      where: {
        code,
        deletedAt: null,
      },
    });
  }

  async updateBugWithHistory(id: string, data: {
    title?: string;
    description?: string | null;
    severity?: Severity;
    priority?: BugPriority;
    status?: BugStatus;
    assignedToId?: string;
  }, changedById: string) {
    return this.prisma.$transaction(async (tx) => {
      const oldBug = await tx.bugReport.findUnique({ where: { id } });
      if (!oldBug) {
        throw new AppError(404, 'Bug not found');
      }

      // Update bug
      const updatedBug = await tx.bugReport.update({
        where: { id },
        data,
      });

      // Track field changes
      const changes = [];

      if (data.status && data.status !== oldBug.status) {
        changes.push({
          bugReportId: id,
          changedById,
          field: 'status',
          oldValue: oldBug.status,
          newValue: data.status,
        });
      }

      if (data.assignedToId && data.assignedToId !== oldBug.assignedToId) {
        const oldUser = oldBug.assignedToId 
          ? await tx.user.findUnique({ where: { id: oldBug.assignedToId }, select: { name: true } })
          : null;
        const newUser = await tx.user.findUnique({ where: { id: data.assignedToId }, select: { name: true } });

        changes.push({
          bugReportId: id,
          changedById,
          field: 'assignedTo',
          oldValue: oldUser?.name || 'Unassigned',
          newValue: newUser?.name,
        });
      }

      if (data.severity && data.severity !== oldBug.severity) {
        changes.push({
          bugReportId: id,
          changedById,
          field: 'severity',
          oldValue: oldBug.severity,
          newValue: data.severity,
        });
      }

      if (data.priority && data.priority !== oldBug.priority) {
        changes.push({
          bugReportId: id,
          changedById,
          field: 'priority',
          oldValue: oldBug.priority,
          newValue: data.priority,
        });
      }

      // Create history records
      if (changes.length > 0) {
        await tx.bugHistory.createMany({
          data: changes.map(change => ({
            ...change,
            createdAt: new Date(),
          })),
        });
      }

      return updatedBug;
    });
  }

  // Comment methods
  async createComment(bugId: string, data: { userId: string; message: string }) {
    return this.prisma.bugComment.create({
      data: {
        bugReportId: bugId,
        userId: data.userId,
        message: data.message,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async listComments(bugId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const where = { bugReportId: bugId };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.bugComment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.bugComment.count({ where }),
    ]);

    return { items, total, totalPages: Math.ceil(total / limit) };
  }

  async deleteComment(bugId: string, commentId: string) {
    const comment = await this.prisma.bugComment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.bugReportId !== bugId) {
      throw new AppError(404, 'Comment not found');
    }

    return this.prisma.bugComment.delete({
      where: { id: commentId },
    });
  }

  // Attachment methods
  async createAttachment(bugId: string, data: { uploadedById: string; fileName: string; filePath: string; fileType: string; fileSize: number }) {
    return this.prisma.bugAttachment.create({
      data: {
        bugReportId: bugId,
        uploadedById: data.uploadedById,
        fileName: data.fileName,
        filePath: data.filePath,
        fileType: data.fileType,
        fileSize: data.fileSize,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async listAttachments(bugId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const where = { bugReportId: bugId };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.bugAttachment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.bugAttachment.count({ where }),
    ]);

    return { items, total, totalPages: Math.ceil(total / limit) };
  }

  async deleteAttachment(bugId: string, attachmentId: string) {
    const attachment = await this.prisma.bugAttachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment || attachment.bugReportId !== bugId) {
      throw new AppError(404, 'Attachment not found');
    }

    return this.prisma.bugAttachment.delete({
      where: { id: attachmentId },
    });
  }

  // History methods
  async listHistory(bugId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const where = { bugReportId: bugId };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.bugHistory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          changedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.bugHistory.count({ where }),
    ]);

    return { items, total, totalPages: Math.ceil(total / limit) };
  }

  // Statistics
  async getBugStatistics(projectId?: string): Promise<Record<BugStatus, number>> {
    const where: {
      deletedAt: null;
      projectId?: string;
    } = { deletedAt: null };
    if (projectId) where.projectId = projectId;

    const statusCounts = await this.prisma.bugReport.groupBy({
      by: ['status'],
      where,
      _count: true,
    });

    const result: Record<BugStatus, number> = {
      OPEN: 0,
      IN_PROGRESS: 0,
      READY_FOR_RETEST: 0,
      RESOLVED: 0,
      CLOSED: 0,
      REJECTED: 0,
    };

    statusCounts.forEach(item => {
      result[item.status] = item._count;
    });

    return result;
  }
}