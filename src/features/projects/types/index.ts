export interface Project {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  baseUrl: string | null;
  framework: 'PLAYWRIGHT' | 'SELENIUM' | 'CYPRESS';
  environment: string | null;
  status: ProjectStatus;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string; email: string; avatar: string | null };
  automationConfig?: AutomationConfig | null;
  _count?: { testCases: number; executions: number };
}

export interface AutomationConfig {
  id: string;
  projectId: string;
  framework: 'PLAYWRIGHT' | 'SELENIUM' | 'CYPRESS';
  browser: 'CHROMIUM' | 'FIREFOX' | 'WEBKIT';
  baseUrl: string | null;
  headless: boolean;
  viewportWidth: number;
  viewportHeight: number;
  timeout: number;
  retry: number;
  parallel: number;
  slowMotion: number;
}

export interface ProjectList {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  baseUrl: string | null;
  framework: string;
  environment: string | null;
  status: ProjectStatus;
  createdAt: string;
  createdBy: { id: string; name: string };
}

export type ProjectStatus = 'ACTIVE' | 'COMPLETED';

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProjectListResponse {
  data: ProjectList[];
  pagination: Pagination;
}
