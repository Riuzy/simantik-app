'use client';

import { Container, TextInput, Textarea, Button, Group, Paper, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCreateProject } from '../../../../features/projects/hooks';

export default function CreateProjectPage() {
  const createMutation = useCreateProject();
  const form = useForm({
    initialValues: { name: '', slug: '', description: '' },
    validate: {
      name: (v: string) => (v.length < 2 ? 'Name must be at least 2 characters' : null),
      slug: (v: string) => (v.length < 2 ? 'Slug is required' : null),
    },
  });

  return (
    <Container size="sm" py="md">
      <Title order={2} mb="lg">Create Project</Title>
      <Paper p="lg" withBorder>
        <form onSubmit={form.onSubmit((values) => createMutation.mutate(values as any))}>
          <TextInput label="Project Name" placeholder="Project Name" required {...form.getInputProps('name')} mb="sm" />
          <TextInput label="Slug" placeholder="project-name" required {...form.getInputProps('slug')} mb="sm" />
          <Textarea label="Description" placeholder="Project description" {...form.getInputProps('description')} mb="sm" />
          <Group mt="md">
            <Button type="submit" loading={createMutation.isPending}>Create Project</Button>
            <Button variant="light" onClick={() => window.history.back()}>Cancel</Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}
