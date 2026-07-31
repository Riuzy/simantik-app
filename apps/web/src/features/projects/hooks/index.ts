'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import * as projectService from '../services';
import type { CreateProjectForm, UpdateProjectForm } from '../schemas';

export function useProjects(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectService.listProjects(params),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProject(id),
    enabled: !!id,
  });
}

export function useProjectBySlug(slug: string) {
  return useQuery({
    queryKey: ['project-by-slug', slug],
    queryFn: () => projectService.getProjectBySlug(slug),
    enabled: !!slug,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateProjectForm) => projectService.createProject(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      notifications.show({ title: 'Success', message: 'Project created', color: 'green' });
      router.push('/projects');
    },
    onError: () => notifications.show({ title: 'Error', message: 'Failed to create project', color: 'red' }),
  });
}

export function useUpdateProject(id: string) {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: UpdateProjectForm) => projectService.updateProject(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['project', id] });
      notifications.show({ title: 'Success', message: 'Project updated', color: 'green' });
      router.push('/projects');
    },
    onError: () => notifications.show({ title: 'Error', message: 'Failed to update project', color: 'red' }),
  });
}

export function useDeleteProject(id: string) {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => projectService.deleteProject(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      notifications.show({ title: 'Success', message: 'Project deleted', color: 'green' });
      router.push('/projects');
    },
    onError: () => notifications.show({ title: 'Error', message: 'Failed to delete project', color: 'red' }),
  });
}
