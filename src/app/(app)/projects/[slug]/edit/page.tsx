'use client';

import { useParams, useRouter } from 'next/navigation';
import { Container, TextInput, Textarea, Select, Button, Group, Paper, Title, Loader, Center, Text, Stack, Divider, Switch, PasswordInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useProjectBySlug, useUpdateProject } from '../../../../../features/projects/hooks';
import { useEffect } from 'react';

const STATUS_OPTIONS = ['ACTIVE', 'COMPLETED'];
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
const LOGIN_METHOD_OPTIONS = [
  { value: 'BROWSER', label: 'Browser (fill login form)' },
  { value: 'API', label: 'API (token/session)' },
];
const SESSION_STRATEGY_OPTIONS = [
  { value: 'REUSE_CONTEXT', label: 'Reuse a single browser context' },
  { value: 'NEW_SESSION', label: 'New session for each step' },
];

export default function EditProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: project, isLoading } = useProjectBySlug(slug as string);
  const projectId = project?.id ?? '';
  const updateMutation = useUpdateProject(projectId);

  const form = useForm({
    initialValues: {
      name: '',
      slug: '',
      description: '',
      framework: 'PLAYWRIGHT',
      status: 'ACTIVE',
      // Automation
      baseUrl: '',
      browser: 'CHROMIUM',
      environment: '',
      headless: true,
      timeout: 30000,
      slowMo: 0,
      viewportWidth: 1280,
      viewportHeight: 720,
      // Authentication
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
        name: project.name,
        slug: project.slug,
        description: project.description || '',
        framework: project.framework,
        status: project.status,
        baseUrl: project.baseUrl || '',
        browser: project.browser,
        environment: project.environment || '',
        headless: project.headless,
        timeout: project.timeout,
        slowMo: project.slowMo,
        viewportWidth: project.viewportWidth,
        viewportHeight: project.viewportHeight,
        authenticationEnabled: project.authenticationEnabled,
        loginUrl: project.loginUrl || '/login',
        loginEmail: project.loginEmail || '',
        loginPassword: '',
        loginMethod: project.loginMethod,
        sessionStrategy: project.sessionStrategy,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);

  const handleSubmit = (values: typeof form.values) => {
    updateMutation.mutate({
      name: values.name,
      slug: values.slug,
      description: values.description || null,
      framework: values.framework,
      status: values.status,
      baseUrl: values.baseUrl || null,
      browser: values.browser,
      environment: values.environment || null,
      headless: values.headless,
      timeout: values.timeout,
      slowMo: values.slowMo,
      viewportWidth: values.viewportWidth,
      viewportHeight: values.viewportHeight,
      authenticationEnabled: values.authenticationEnabled,
      loginUrl: values.loginUrl || null,
      loginEmail: values.loginEmail || null,
      loginPassword: values.loginPassword || undefined,
      loginMethod: values.loginMethod,
      sessionStrategy: values.sessionStrategy,
    } as Parameters<typeof updateMutation.mutate>[0]);
  };

  if (isLoading) return <Center h={400}><Loader /></Center>;
  if (!project) return <Center h={400}><Text c="dimmed">Project not found</Text></Center>;

  return (
    <Container size="lg" py="md">
      <Title order={2} mb="lg">Edit Project</Title>
      <Paper p="lg" withBorder>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg">
            <div>
              <TextInput label="Project Code" value={project.code} disabled mb="sm" />
              <TextInput label="Project Name" placeholder="Project Name" required {...form.getInputProps('name')} mb="sm" />
              <TextInput label="Slug" placeholder="project-name" required {...form.getInputProps('slug')} mb="sm" />
              <Group grow mb="sm">
                <Select label="Framework" data={FRAMEWORK_OPTIONS} {...form.getInputProps('framework')} />
                <Select label="Status" data={STATUS_OPTIONS} {...form.getInputProps('status')} />
              </Group>
              <Textarea label="Description" placeholder="Project description" {...form.getInputProps('description')} />
            </div>

            <Divider mt="sm" />

            <div>
              <Group justify="space-between" mb="sm">
                <Title order={4}>Automation</Title>
                <Switch label="Headless" {...form.getInputProps('headless', { type: 'checkbox' })} />
              </Group>
              <Group grow mb="sm">
                <TextInput label="Base URL" placeholder="http://localhost:3000" {...form.getInputProps('baseUrl')} />
                <Select label="Browser" data={BROWSER_OPTIONS} {...form.getInputProps('browser')} />
              </Group>
              <TextInput label="Environment" placeholder="Local Development" {...form.getInputProps('environment')} mb="sm" />
              <Group grow mb="sm">
                <TextInput label="Timeout (ms)" type="number" {...form.getInputProps('timeout')} />
                <TextInput label="Slow Motion (ms)" type="number" {...form.getInputProps('slowMo')} />
              </Group>
              <Group grow mb="sm">
                <TextInput label="Viewport Width" type="number" {...form.getInputProps('viewportWidth')} />
                <TextInput label="Viewport Height" type="number" {...form.getInputProps('viewportHeight')} />
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
                    <PasswordInput
                      label="Password"
                      placeholder={project.loginPasswordSet ? 'Password is set' : 'Not set'}
                      {...form.getInputProps('loginPassword')}
                    />
                    <Select label="Login Method" data={LOGIN_METHOD_OPTIONS} {...form.getInputProps('loginMethod')} />
                  </Group>
                  <Select label="Session Strategy" data={SESSION_STRATEGY_OPTIONS} {...form.getInputProps('sessionStrategy')} />
                </Stack>
              )}
            </div>

            <Group mt="md">
              <Button type="submit" loading={updateMutation.isPending}>Save Changes</Button>
              <Button variant="light" onClick={() => router.back()}>Cancel</Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}