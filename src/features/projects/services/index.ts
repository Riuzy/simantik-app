import { apiClient } from '../../../services/api-client';
import { API } from '../../../constants/api';
import type { Project, ProjectListResponse } from '../types';

export async function listProjects(params?: Record<string, unknown>): Promise<ProjectListResponse> {
  const res = await apiClient.get(API.PROJECTS.BASE, { params });
  return { data: res.data.data, pagination: res.data.meta };
}

export async function getProject(id: string): Promise<Project> {
  const res = await apiClient.get(API.PROJECTS.DETAIL(id));
  return res.data.data;
}

export async function getProjectBySlug(slug: string): Promise<Project> {
  const res = await apiClient.get(API.PROJECTS.SLUG(slug));
  return res.data.data;
}

export async function createProject(data: Record<string, unknown>): Promise<Project> {
  const res = await apiClient.post(API.PROJECTS.BASE, data);
  return res.data.data;
}

export async function updateProject(id: string, data: Record<string, unknown>): Promise<Project> {
  const res = await apiClient.patch(API.PROJECTS.DETAIL(id), data);
  return res.data.data;
}

export async function deleteProject(id: string): Promise<void> {
  await apiClient.delete(API.PROJECTS.DETAIL(id));
}
