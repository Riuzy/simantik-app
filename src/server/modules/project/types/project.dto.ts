import { z } from 'zod';
import {
  createProjectBodySchema,
  updateProjectBodySchema,
  listProjectsQuerySchema,
} from '../validators/project.validators';
import { Framework, ProjectStatus } from '@prisma/client';

export type CreateProjectDTO = z.infer<typeof createProjectBodySchema>;
export type UpdateProjectDTO = z.infer<typeof updateProjectBodySchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;

export interface ProjectResponseDTO {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  baseUrl: string | null;
  framework: Framework;
  environment: string | null;
  status: ProjectStatus;
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
  framework: Framework;
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

export interface ProjectDetailDTO extends ProjectResponseDTO {
  _count: {
    testCases: number;
    executions: number;
  };
}

export interface ProjectFilters {
  status?: string;
  search?: string;
  createdById?: string;
  framework?: string;
  sortBy?: 'createdAt' | 'name' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
