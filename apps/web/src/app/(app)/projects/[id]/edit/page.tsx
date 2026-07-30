'use client';

import { useParams, useRouter } from 'next/navigation';
import { Container, TextInput, Textarea, Select, Button, Group, Paper, Title, Loader, Center, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useProject, useUpdateProject } from '../../../../../features/projects/hooks';
import { useEffect } from 'react';

const STATUS_OPTIONS = ['ACTIVE', 'COMPLETED'];

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: project, isLoading } = useProject(id);
  const updateMutation = useUpdateProject(id);

  const form = useForm({
    initialValues: { name: '', slug: '', description: '', status: 'ACTIVE' },
  });

  useEffect(() => {
    if (project) {
      form.setValues({
        name: project.name,
        slug: project.slug,
        description: project.description || '',
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
        <form onSubmit={form.onSubmit((values) => updateMutation.mutate(values as any))}>
          <TextInput label="Project Code" value={project.code} disabled mb="sm" />
          <TextInput label="Project Name" placeholder="Project Name" required {...form.getInputProps('name')} mb="sm" />
          <TextInput label="Slug" placeholder="project-name" required {...form.getInputProps('slug')} mb="sm" />
          <Textarea label="Description" placeholder="Project description" {...form.getInputProps('description')} mb="sm" />
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
