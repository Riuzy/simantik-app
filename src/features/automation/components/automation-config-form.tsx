'use client';

import { useEffect } from 'react';
import { Paper, Group, Text, Button, Stack, Switch, Select, TextInput, NumberInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAutomationConfig, useUpsertAutomationConfig } from '../hooks';
import type { Browser } from '../types';

interface Props {
  projectId: string;
}

export function AutomationConfigForm({ projectId }: Props) {
  const { data: config, isLoading } = useAutomationConfig(projectId);
  const saveConfig = useUpsertAutomationConfig(projectId);

  const form = useForm({
    initialValues: {
      browser: 'CHROMIUM',
      baseUrl: '',
      headless: true,
      viewportWidth: 1280,
      viewportHeight: 720,
      timeout: 30000,
      retry: 0,
      parallel: 1,
      slowMotion: 0,
    },
  });

  useEffect(() => {
    if (config) {
      form.setValues({
        browser: config.browser,
        baseUrl: config.baseUrl ?? '',
        headless: config.headless,
        viewportWidth: config.viewportWidth,
        viewportHeight: config.viewportHeight,
        timeout: config.timeout,
        retry: config.retry,
        parallel: config.parallel,
        slowMotion: config.slowMotion,
      });
    }
  }, [config]);

  const handleSubmit = (values: typeof form.values) => {
    saveConfig.mutate({
      browser: values.browser as Browser,
      baseUrl: values.baseUrl || null,
      headless: values.headless,
      viewportWidth: values.viewportWidth,
      viewportHeight: values.viewportHeight,
      timeout: values.timeout,
      retry: values.retry,
      parallel: values.parallel,
      slowMotion: values.slowMotion,
    });
  };

  if (isLoading) return <Paper p="md" withBorder><Text c="dimmed" size="sm">Loading config...</Text></Paper>;

  return (
    <Paper p="md" withBorder>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Group justify="space-between" mb={4}>
            <Text fw={600}>Automation Configuration</Text>
            <Button type="submit" size="sm" loading={saveConfig.isPending}>Save</Button>
          </Group>

          <Group grow>
            <Select
              label="Browser"
              data={[
                { value: 'CHROMIUM', label: 'Chromium' },
                { value: 'FIREFOX', label: 'Firefox' },
                { value: 'WEBKIT', label: 'WebKit' },
              ]}
              {...form.getInputProps('browser')}
            />
            <TextInput
              label="Base URL"
              placeholder="http://localhost:3000"
              {...form.getInputProps('baseUrl')}
            />
          </Group>

          <Group grow>
            <NumberInput
              label="Viewport Width"
              min={320}
              max={7680}
              {...form.getInputProps('viewportWidth')}
            />
            <NumberInput
              label="Viewport Height"
              min={240}
              max={4320}
              {...form.getInputProps('viewportHeight')}
            />
          </Group>

          <Group grow>
            <NumberInput
              label="Timeout (ms)"
              min={1000}
              max={600000}
              step={1000}
              {...form.getInputProps('timeout')}
            />
            <NumberInput
              label="Retry"
              min={0}
              max={10}
              {...form.getInputProps('retry')}
            />
          </Group>

          <Group grow>
            <NumberInput
              label="Parallel"
              min={1}
              max={10}
              {...form.getInputProps('parallel')}
            />
            <NumberInput
              label="Slow Motion (ms)"
              min={0}
              max={10000}
              step={100}
              {...form.getInputProps('slowMotion')}
            />
          </Group>

          <Switch label="Headless" {...form.getInputProps('headless', { type: 'checkbox' })} />
        </Stack>
      </form>
    </Paper>
  );
}
