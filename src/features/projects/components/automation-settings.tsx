'use client';

import { useEffect } from 'react';
import { Paper, Group, Text, Button, Stack, Switch, Select, TextInput, NumberInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import * as projectService from '../services';
import type { Project } from '../types';

const BROWSER_OPTIONS = [
  { value: 'CHROMIUM', label: 'Chromium' },
  { value: 'FIREFOX', label: 'Firefox' },
  { value: 'WEBKIT', label: 'WebKit' },
];

interface Props {
  project: Project;
}

export function AutomationSettings({ project }: Props) {
  const qc = useQueryClient();

  const save = useMutation({
    mutationFn: (data: Record<string, unknown>) => projectService.updateProject(project.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-by-slug', project.slug] });
      qc.invalidateQueries({ queryKey: ['project', project.id] });
      notifications.show({ title: 'Success', message: 'Automation settings saved', color: 'green' });
    },
    onError: () => notifications.show({ title: 'Error', message: 'Failed to save automation settings', color: 'red' }),
  });

  const form = useForm({
    initialValues: {
      baseUrl: '',
      browser: 'CHROMIUM',
      environment: '',
      headless: true,
      timeout: 30000,
      slowMo: 0,
      viewportWidth: 1280,
      viewportHeight: 720,
      debugMode: false,
    },
  });

  useEffect(() => {
    if (project) {
      form.setValues({
        baseUrl: project.baseUrl ?? '',
        browser: project.browser,
        environment: project.environment ?? '',
        headless: project.headless,
        timeout: project.timeout,
        slowMo: project.slowMo,
        viewportWidth: project.viewportWidth,
        viewportHeight: project.viewportHeight,
        debugMode: project.debugMode,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);

  const handleSubmit = (values: typeof form.values) => {
    save.mutate({
      baseUrl: values.baseUrl || null,
      browser: values.browser,
      environment: values.environment || null,
      headless: values.headless,
      timeout: values.timeout,
      slowMo: values.slowMo,
      viewportWidth: values.viewportWidth,
      viewportHeight: values.viewportHeight,
      debugMode: values.debugMode,
    });
  };

  return (
    <Paper p="md" withBorder>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={600}>Automation</Text>
            <Button type="submit" size="sm" loading={save.isPending}>Save</Button>
          </Group>

          <Group grow>
            <TextInput label="Base URL" placeholder="http://localhost:3000" {...form.getInputProps('baseUrl')} />
            <Select label="Browser" data={BROWSER_OPTIONS} {...form.getInputProps('browser')} />
          </Group>

          <Group grow>
            <TextInput label="Environment" placeholder="Local Development" {...form.getInputProps('environment')} />
            <NumberInput label="Timeout (ms)" min={1000} max={600000} step={1000} {...form.getInputProps('timeout')} />
          </Group>

          <Group grow>
            <NumberInput label="Viewport Width" min={320} max={7680} {...form.getInputProps('viewportWidth')} />
            <NumberInput label="Viewport Height" min={240} max={4320} {...form.getInputProps('viewportHeight')} />
          </Group>

          <Group grow>
            <NumberInput label="Slow Motion (ms)" min={0} max={10000} step={100} {...form.getInputProps('slowMo')} />
            <Switch
              label="Debug Mode"
              {...form.getInputProps('debugMode', { type: 'checkbox' })}
              style={{ alignSelf: 'flex-end', marginBottom: 4 }}
            />
          </Group>

          <Switch label="Headless" {...form.getInputProps('headless', { type: 'checkbox' })} />
        </Stack>
      </form>
    </Paper>
  );
}