import { apiClient } from '../../../services/api-client';
import { API } from '../../../constants/api';
import type { Project, ProjectListResponse, ProjectMember } from '../types';

export async function listProjects(params?: Record<string, unknown>): Promise<ProjectListResponse> {
  const res = await apiClient.get(API.PROJECTS.BASE, { params });
  return res.data.data;
}

export async function getProject(id: string): Promise<Project> {
  const res = await apiClient.get(API.PROJECTS.DETAIL(id));
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

export async function addMember(projectId: string, userId: string): Promise<ProjectMember> {
  const res = await apiClient.post(API.PROJECTS.MEMBERS(projectId), { userId });
  return res.data.data;
}

export async function removeMember(projectId: string, userId: string): Promise<void> {
  await apiClient.delete(API.PROJECTS.MEMBER_DETAIL(projectId, userId));
}

export async function listMembers(projectId: string): Promise<ProjectMember[]> {
  const res = await apiClient.get(API.PROJECTS.MEMBERS(projectId));
  return res.data.data;
}
