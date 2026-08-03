'use client';

import { useEffect, useState } from 'react';
import { Paper, Group, Text, Button, Stack, Switch, TextInput, PasswordInput, Select, Code } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import * as projectService from '../services';
import type { Project } from '../types';

const LOGIN_METHOD_OPTIONS = [
  { value: 'BROWSER', label: 'Browser (fill login form)' },
  { value: 'API', label: 'API (token/session)' },
];

const SESSION_STRATEGY_OPTIONS = [
  { value: 'REUSE_CONTEXT', label: 'Reuse a single browser context' },
  { value: 'NEW_SESSION', label: 'New session for each step' },
];

interface Props {
  project: Project;
}

export function AuthenticationSettings({ project }: Props) {
  const qc = useQueryClient();
  const [changePassword, setChangePassword] = useState(false);

  const save = useMutation({
    mutationFn: (data: Record<string, unknown>) => projectService.updateProject(project.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-by-slug', project.slug] });
      qc.invalidateQueries({ queryKey: ['project', project.id] });
      notifications.show({ title: 'Success', message: 'Authentication settings saved', color: 'green' });
    },
    onError: () => notifications.show({ title: 'Error', message: 'Failed to save authentication settings', color: 'red' }),
  });

  const form = useForm({
    initialValues: {
      authenticationEnabled: false,
      loginUrl: '/login',
      loginEmail: '',
      loginPassword: '',
      loginMethod: 'BROWSER',
      sessionStrategy: 'REUSE_CONTEXT',
    },
  });

  useEffect(() => {
    if (project) {
      form.setValues({
        authenticationEnabled: project.authenticationEnabled,
        loginUrl: project.loginUrl ?? '/login',
        loginEmail: project.loginEmail ?? '',
        loginPassword: '',
        loginMethod: project.loginMethod,
        sessionStrategy: project.sessionStrategy,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);

  const handleSubmit = (values: typeof form.values) => {
    const payload: Record<string, unknown> = {
      authenticationEnabled: values.authenticationEnabled,
      loginUrl: values.loginUrl || null,
      loginEmail: values.loginEmail || null,
      loginMethod: values.loginMethod,
      sessionStrategy: values.sessionStrategy,
    };
    if (changePassword && values.loginPassword) {
      payload.loginPassword = values.loginPassword;
    }
    save.mutate(payload);
  };

  return (
    <Paper p="md" withBorder>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={600}>Authentication</Text>
            <Button type="submit" size="sm" loading={save.isPending}>Save</Button>
          </Group>

          <Switch
            label="Enable Authentication"
            description="Automatically log in before running test steps using this project's credentials."
            {...form.getInputProps('authenticationEnabled', { type: 'checkbox' })}
          />

          <Group grow>
            <TextInput label="Login URL" placeholder="/login" {...form.getInputProps('loginUrl')} />
            <TextInput label="Email" placeholder="tester@simantik.local" {...form.getInputProps('loginEmail')} />
          </Group>

          <Group grow>
            <PasswordInput
              label="Password"
              placeholder={project.loginPasswordSet ? 'Password is set' : 'Not set'}
              disabled={!changePassword}
              {...form.getInputProps('loginPassword')}
            />
            <Button
              variant="light"
              style={{ alignSelf: 'flex-end' }}
              onClick={() => setChangePassword((v) => !v)}
            >
              {changePassword ? 'Cancel password change' : 'Change password'}
            </Button>
          </Group>

          <Group grow>
            <Select label="Login Method" data={LOGIN_METHOD_OPTIONS} {...form.getInputProps('loginMethod')} />
            <Select label="Session Strategy" data={SESSION_STRATEGY_OPTIONS} {...form.getInputProps('sessionStrategy')} />
          </Group>

          {project.loginPasswordSet && (
            <Code block>{'Password is stored encrypted and is never returned by the API.'}</Code>
          )}
        </Stack>
      </form>
    </Paper>
  );
}