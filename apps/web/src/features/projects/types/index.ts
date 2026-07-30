export interface Project {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  createdById: string;
  createdAt: string;
  createdBy: { id: string; name: string; email: string };
  _count?: { members: number; testCases: number; testRuns: number; bugReports: number };
  members?: ProjectMember[];
}

export interface ProjectList {
  id: string;
  code: string;
  name: string;
  slug: string;
  description?: string | null;
  status: ProjectStatus;
  createdAt: string;
  createdBy: { id: string; name: string };
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    jobTitle: string | null;
    role: { id: string; name: string };
  };
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
