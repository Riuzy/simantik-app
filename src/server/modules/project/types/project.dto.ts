import { z } from 'zod';
import {
  createProjectBodySchema,
  updateProjectBodySchema,
  listProjectsQuerySchema,
} from '../validators/project.validators';
import { Browser, Framework, LoginMethod, ProjectStatus, SessionStrategy } from '@prisma/client';

export type CreateProjectDTO = z.infer<typeof createProjectBodySchema>;
export type UpdateProjectDTO = z.infer<typeof updateProjectBodySchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;

/**
 * Public project representation returned to clients.
 * loginPassword is NEVER exposed - only a boolean indicating whether a
 * password has been set (so the UI can show a masked input).
 */
export interface ProjectResponseDTO {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  status: ProjectStatus;
  framework: Framework;
  // Automation
  baseUrl: string | null;
  browser: Browser;
  environment: string | null;
  headless: boolean;
  timeout: number;
  slowMo: number;
  viewportWidth: number;
  viewportHeight: number;
  debugMode: boolean;
  // Authentication
  authenticationEnabled: boolean;
  loginUrl: string | null;
  loginEmail: string | null;
  loginMethod: LoginMethod;
  sessionStrategy: SessionStrategy;
  loginPasswordSet: boolean;
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
  description: string | null;
  baseUrl: string | null;
  browser: Browser;
  environment: string | null;
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
  browser?: string;
  sortBy?: 'createdAt' | 'name' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}