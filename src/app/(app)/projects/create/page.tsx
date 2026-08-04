'use client';

import { Container, TextInput, Textarea, Select, Button, Group, Paper, Title, Stack, Divider, PasswordInput, Switch } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCreateProject } from '../../../../features/projects/hooks';

const FRAMEWORK_OPTIONS = [
  { value: 'PLAYWRIGHT', label: 'Playwright' },
  { value: 'SELENIUM', label: 'Selenium' },
  { value: 'CYPRESS', label: 'Cypress' },
];

const BROWSER_OPTIONS = [
  { value: 'CHROMIUM', label: 'Chromium' },
  { value: 'FIREFOX', label: 'Firefox' },
  { value: 'WEBKIT', label: 'WebKit' },
];

const SCREENSHOT_TIMING_OPTIONS = [
  { value: 'FINAL_STATE', label: 'Final State (default)' },
  { value: 'AFTER_ACTION', label: 'After Each Action' },
  { value: 'BEFORE_ACTION', label: 'Before Each Action' },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export default function CreateProjectPage() {
  const createMutation = useCreateProject();
  const form = useForm({
    initialValues: {
      // General
      name: '',
      slug: '',
      description: '',
      framework: 'PLAYWRIGHT',
      // Automation
      baseUrl: '',
      browser: 'CHROMIUM',
      environment: '',
      headless: true,
      timeout: 30000,
      slowMo: 0,
      viewportWidth: 1600,
      viewportHeight: 900,
      screenshotTiming: 'FINAL_STATE',
      debugMode: false,
      // Authentication
      authenticationEnabled: false,
      loginUrl: '/login',
      loginEmail: '',
      loginPassword: '',
      loginMethod: 'BROWSER',
      sessionStrategy: 'REUSE_CONTEXT',
    },
    validate: {
      name: (v: string) => (v.length < 2 ? 'Name must be at least 2 characters' : null),
      slug: (v: string) => (v.length < 2 ? 'Slug is required' : null),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    createMutation.mutate({
      name: values.name,
      slug: values.slug,
      description: values.description || undefined,
      framework: values.framework,
      baseUrl: values.baseUrl || undefined,
      browser: values.browser,
      environment: values.environment || undefined,
      headless: values.headless,
      timeout: values.timeout,
      slowMo: values.slowMo,
      viewportWidth: values.viewportWidth,
      viewportHeight: values.viewportHeight,
      screenshotTiming: values.screenshotTiming,
      debugMode: values.debugMode,
      authenticationEnabled: values.authenticationEnabled,
      loginUrl: values.authenticationEnabled ? values.loginUrl || undefined : undefined,
      loginEmail: values.authenticationEnabled ? values.loginEmail || undefined : undefined,
      loginPassword: values.authenticationEnabled && values.loginPassword ? values.loginPassword : undefined,
      loginMethod: values.loginMethod,
      sessionStrategy: values.sessionStrategy,
    } as Parameters<typeof createMutation.mutate>[0]);
  };

  return (
    <Container size="lg" py="md">
      <Title order={2} mb="lg">Create Project</Title>
      <Paper p="lg" withBorder>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg">
            <div>
              <Title order={4} mb="sm">General</Title>
              <TextInput
                label="Project Name"
                placeholder="Project Name"
                required
                {...form.getInputProps('name')}
                onChange={(e) => {
                  form.setFieldValue('name', e.currentTarget.value);
                  if (!form.values.slug) {
                    form.setFieldValue('slug', slugify(e.currentTarget.value));
                  }
                }}
                mb="sm"
              />
              <TextInput label="Slug" placeholder="project-name" required {...form.getInputProps('slug')} mb="sm" />
              <Group grow mb="sm">
                <Select label="Framework" data={FRAMEWORK_OPTIONS} {...form.getInputProps('framework')} />
                <TextInput label="Environment" placeholder="Local Development" {...form.getInputProps('environment')} />
              </Group>
              <Textarea label="Description" placeholder="Project description" {...form.getInputProps('description')} />
            </div>

            <Divider mt="sm" />

            <div>
              <Group justify="space-between" mb="sm">
                <Title size={4} order={4}>Automation</Title>
                <Switch label="Headless" {...form.getInputProps('headless', { type: 'checkbox' })} />
              </Group>
              <Group grow mb="sm">
                <TextInput label="Base URL" placeholder="http://localhost:3000" {...form.getInputProps('baseUrl')} />
                <Select label="Browser" data={BROWSER_OPTIONS} {...form.getInputProps('browser')} />
              </Group>
              <Group grow mb="sm">
                <Select label="Session Strategy" data={[
                  { value: 'REUSE_CONTEXT', label: 'Reuse a single browser context' },
                  { value: 'NEW_SESSION', label: 'New session for each step' },
                ]} {...form.getInputProps('sessionStrategy')} />
                <Select label="Login Method" data={[
                  { value: 'BROWSER', label: 'Browser (fill login form)' },
                  { value: 'API', label: 'API (token/session)' },
                ]} {...form.getInputProps('loginMethod')} />
              </Group>
              <Group grow mb="sm">
                <TextInput label="Viewport Width" type="number" {...form.getInputProps('viewportWidth')} />
                <TextInput label="Viewport Height" type="number" {...form.getInputProps('viewportHeight')} />
              </Group>
              <Group grow mb="sm">
                <Select label="Screenshot Timing" data={SCREENSHOT_TIMING_OPTIONS} {...form.getInputProps('screenshotTiming')} />
                <TextInput label="Timeout (ms)" type="number" {...form.getInputProps('timeout')} />
              </Group>
              <Group grow mb="sm">
                <TextInput label="Slow Motion (ms)" type="number" {...form.getInputProps('slowMo')} />
              </Group>
            </div>

            <Divider mt="sm" />

            <div>
              <Switch
                label="Enable Authentication"
                description="Auto log in before running test steps using project credentials."
                {...form.getInputProps('authenticationEnabled', { type: 'checkbox' })}
                mb="sm"
              />
              {form.values.authenticationEnabled && (
                <Stack>
                  <Group grow>
                    <TextInput label="Login URL" placeholder="/login" {...form.getInputProps('loginUrl')} />
                    <TextInput label="Email" placeholder="tester@simantik.local" {...form.getInputProps('loginEmail')} />
                  </Group>
                  <Group grow>
                    <PasswordInput label="Password" placeholder="Password" {...form.getInputProps('loginPassword')} />
                  </Group>
                </Stack>
              )}
            </div>

            <Group mt="md">
              <Button type="submit" loading={createMutation.isPending}>Create Project</Button>
              <Button variant="light" onClick={() => window.history.back()}>Cancel</Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}