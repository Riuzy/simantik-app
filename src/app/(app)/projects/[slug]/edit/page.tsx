'use client';

import { useParams, useRouter } from 'next/navigation';
import { Container, TextInput, Textarea, Select, Button, Group, Paper, Title, Loader, Center, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useProjectBySlug, useUpdateProject } from '../../../../../features/projects/hooks';
import { useEffect } from 'react';

const STATUS_OPTIONS = ['ACTIVE', 'COMPLETED'];
const FRAMEWORK_OPTIONS = [
  { value: 'PLAYWRIGHT', label: 'Playwright' },
  { value: 'SELENIUM', label: 'Selenium' },
  { value: 'CYPRESS', label: 'Cypress' },
];

export default function EditProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: project, isLoading } = useProjectBySlug(slug as string);
  const projectId = project?.id ?? '';
  const updateMutation = useUpdateProject(projectId);

  const form = useForm({
    initialValues: { name: '', slug: '', description: '', baseUrl: '', framework: 'PLAYWRIGHT', environment: '', status: 'ACTIVE' },
  });

  useEffect(() => {
    if (project) {
      form.setValues({
        name: project.name,
        slug: project.slug,
        description: project.description || '',
        baseUrl: project.baseUrl || '',
        framework: project.framework,
        environment: project.environment || '',
        status: project.status,
      });
    }
  }, [project]);

  if (isLoading) return <Center h={400}><Loader /></Center>;
  if (!project) return <Center h={400}><Text c="dimmed">Project not found</Text></Center>;

  return (
    <Container size="sm" py="md">
      <Title order={2} mb="lg">Edit Project</Title>
      <Paper p="lg" withBorder>
        <form onSubmit={form.onSubmit((values) => updateMutation.mutate({
          ...values,
          baseUrl: values.baseUrl || null,
          environment: values.environment || null,
        } as Parameters<typeof updateMutation.mutate>[0]))}>
          <TextInput label="Project Code" value={project.code} disabled mb="sm" />
          <TextInput label="Project Name" placeholder="Project Name" required {...form.getInputProps('name')} mb="sm" />
          <TextInput label="Slug" placeholder="project-name" required {...form.getInputProps('slug')} mb="sm" />
          <Textarea label="Description" placeholder="Project description" {...form.getInputProps('description')} mb="sm" />
          <TextInput label="Base URL" placeholder="http://localhost:3000" {...form.getInputProps('baseUrl')} mb="sm" />
          <Group grow mb="sm">
            <Select label="Framework" data={FRAMEWORK_OPTIONS} {...form.getInputProps('framework')} />
            <TextInput label="Environment" placeholder="Local Development" {...form.getInputProps('environment')} />
          </Group>
          <Select label="Status" data={STATUS_OPTIONS} {...form.getInputProps('status')} mb="sm" />
          <Group mt="md">
            <Button type="submit" loading={updateMutation.isPending}>Save Changes</Button>
            <Button variant="light" onClick={() => router.back()}>Cancel</Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}
