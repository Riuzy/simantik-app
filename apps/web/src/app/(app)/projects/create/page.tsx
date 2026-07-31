'use client';

import { Container, TextInput, Textarea, Select, Button, Group, Paper, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCreateProject } from '../../../../features/projects/hooks';

const FRAMEWORK_OPTIONS = [
  { value: 'PLAYWRIGHT', label: 'Playwright' },
  { value: 'SELENIUM', label: 'Selenium' },
  { value: 'CYPRESS', label: 'Cypress' },
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
    initialValues: { name: '', slug: '', description: '', baseUrl: '', framework: 'PLAYWRIGHT', environment: '' },
    validate: {
      name: (v: string) => (v.length < 2 ? 'Name must be at least 2 characters' : null),
      slug: (v: string) => (v.length < 2 ? 'Slug is required' : null),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    createMutation.mutate({
      ...values,
      baseUrl: values.baseUrl || undefined,
      environment: values.environment || undefined,
    } as Parameters<typeof createMutation.mutate>[0]);
  };

  return (
    <Container size="sm" py="md">
      <Title order={2} mb="lg">Create Project</Title>
      <Paper p="lg" withBorder>
        <form onSubmit={form.onSubmit(handleSubmit)}>
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
          <Textarea label="Description" placeholder="Project description" {...form.getInputProps('description')} mb="sm" />
          <TextInput label="Base URL" placeholder="https://example.com" {...form.getInputProps('baseUrl')} mb="sm" />
          <Group grow mb="sm">
            <Select label="Framework" data={FRAMEWORK_OPTIONS} {...form.getInputProps('framework')} />
            <TextInput label="Environment" placeholder="staging" {...form.getInputProps('environment')} />
          </Group>
          <Group mt="md">
            <Button type="submit" loading={createMutation.isPending}>Create Project</Button>
            <Button variant="light" onClick={() => window.history.back()}>Cancel</Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}
