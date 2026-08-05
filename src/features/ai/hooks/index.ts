'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import * as aiService from '../services';
import { PromptTemplates, SaveAISettingsForm, TestConnectionForm } from '../types';

export function useAISettings() {
  return useQuery({
    queryKey: ['ai-settings'],
    queryFn: () => aiService.getAISettings(),
  });
}

export function useSaveAISettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SaveAISettingsForm) => aiService.saveAISettings(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-settings'] });
      notifications.show({ title: 'Success', message: 'AI settings saved', color: 'green' });
    },
    onError: () =>
      notifications.show({ title: 'Error', message: 'Failed to save AI settings', color: 'red' }),
  });
}

export function useTestConnection() {
  return useMutation({
    mutationFn: (data: TestConnectionForm) => aiService.testConnection(data),
  });
}

export function usePromptTemplates() {
  return useQuery({
    queryKey: ['ai-prompt-templates'],
    queryFn: () => aiService.getPromptTemplates(),
  });
}

export function useUpdatePromptTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, content }: { key: keyof PromptTemplates; content: string }) =>
      aiService.updatePromptTemplate(key, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-prompt-templates'] });
      notifications.show({ title: 'Success', message: 'Prompt template saved', color: 'green' });
    },
    onError: () =>
      notifications.show({ title: 'Error', message: 'Failed to save prompt template', color: 'red' }),
  });
}
