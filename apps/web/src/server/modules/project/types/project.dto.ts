import { z } from 'zod';
import {
  createProjectBodySchema,
  updateProjectBodySchema,
  listProjectsQuerySchema,
  addMemberParamSchema,
  removeMemberParamSchema,
} from '../validators/project.validators';
import { ProjectStatus } from '@prisma/client';

export type CreateProjectDTO = z.infer<typeof createProjectBodySchema>;
export type UpdateProjectDTO = z.infer<typeof updateProjectBodySchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
export type AddMemberDTO = z.infer<typeof addMemberParamSchema>;
export type RemoveMemberDTO = z.infer<typeof removeMemberParamSchema>;

export interface ProjectResponseDTO {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  status: ProjectStatus;
  startDate: Date | null;
  endDate: Date | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ProjectListDTO {
  id: string;
  code: string;
  name: string;
  slug: string;
  status: ProjectStatus;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
  };
}

export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProjectListResponseDTO {
  data: ProjectListDTO[];
  pagination: PaginationDTO;
}

export interface ProjectMemberDTO {
  id: string;
  userId: string;
  projectId: string;
  joinedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    jobTitle: string | null;
    role: {
      id: string;
      name: string;
    };
  };
}

export interface ProjectDetailDTO extends ProjectResponseDTO {
  members: ProjectMemberDTO[];
  _count: {
    members: number;
    testCases: number;
    testRuns: number;
    bugReports: number;
  };
}

export interface ProjectFilters {
  status?: ProjectStatus;
  search?: string;
  createdById?: string;
  sortBy?: 'createdAt' | 'name' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}