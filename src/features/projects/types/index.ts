export type Browser = 'CHROMIUM' | 'FIREFOX' | 'WEBKIT';
export type Framework = 'PLAYWRIGHT' | 'SELENIUM' | 'CYPRESS';
export type LoginMethod = 'BROWSER' | 'API';
export type SessionStrategy = 'REUSE_CONTEXT' | 'NEW_SESSION';

export interface Project {
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
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string; email: string; avatar: string | null };
  _count?: { testCases: number; executions: number };
}

export interface ProjectList {
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