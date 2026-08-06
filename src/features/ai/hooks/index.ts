'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import * as aiService from '../services';
import { getApiError } from '../../../utils/error-handler';
import { PromptTemplates, SaveAISettingsForm, TestConnectionForm } from '../types';

function isDev(): boolean {
  return process.env.NODE_ENV !== 'production';
}

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
    onError: (error) =>
      notifications.show({ title: 'Error', message: getApiError(error, 'Failed to save AI settings'), color: 'red' }),
  });
}

export function useTestConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TestConnectionForm) => {
      if (isDev()) {
            console.log('[AI] Test connection', { provider: data.provider, model: data.model ?? null });
      }
      return aiService.testConnection(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-settings'] });
    },
    onError: (error) => {
      const message = getApiError(error, 'Cannot contact provider.');
      if (isDev()) {
            console.error('[AI] Test connection error', { error });
      }
      notifications.show({ title: 'Connection Failed', message, color: 'red' });
    },
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
    onError: (error) =>
      notifications.show({ title: 'Error', message: getApiError(error, 'Failed to save prompt template'), color: 'red' }),
  });
}
