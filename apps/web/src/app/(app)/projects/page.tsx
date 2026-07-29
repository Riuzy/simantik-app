'use client';

import { useState } from 'react';
import { Container, Group, Title, Text, Button, Card, Badge, TextInput, SimpleGrid, Paper } from '@mantine/core';
import { IconPlus, IconSearch, IconFolder } from '@tabler/icons-react';
import Link from 'next/link';
import { useAuthStore } from '../../../stores/auth-store';
import { useProjects } from '../../../features/projects/hooks';
import { PageHeader } from '../../../components/common/page';
import { ROUTES } from '../../../constants/routes';

const statusColor: Record<string, string> = {
  PLANNING: 'gray', ACTIVE: 'green', TESTING: 'blue', COMPLETED: 'cyan', ARCHIVED: 'red',
};

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const user = useAuthStore((s) => s.user);
  const isManager = user?.role?.name === 'Manager';
  const { data, isLoading } = useProjects({ search: search || undefined });

  return (
    <Container size="xl" py="md">
      <PageHeader
        title={isManager ? 'Projects' : 'My Projects'}
        description={isManager ? 'Manage all projects' : 'View your assigned projects'}
        actions={isManager ? <Button leftSection={<IconPlus size={16} />} component={Link} href="/projects/create">New Project</Button> : undefined}
      />

      <TextInput
        placeholder="Search projects..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        mb="md"
        style={{ maxWidth: 400 }}
      />

      {isLoading ? (
        <Text c="dimmed" ta="center" py="xl">Loading projects...</Text>
      ) : !data?.data?.length ? (
        <Paper p="xl" ta="center" withBorder>
          <IconFolder size={40} stroke={1} style={{ opacity: 0.3 }} />
          <Text c="dimmed" mt="sm">No projects found</Text>
          {isManager && <Button component={Link} href="/projects/create" mt="md" variant="light">Create your first project</Button>}
        </Paper>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
          {data.data.map((project) => (
            <Card key={project.id} component={Link} href={`/projects/${project.id}`} padding="lg" radius="md" withBorder style={{ textDecoration: 'none' }}>
              <Group justify="space-between" mb="xs">
                <Text fw={500} size="lg">{project.name}</Text>
                <Badge color={statusColor[project.status] || 'gray'} variant="light" size="sm">{project.status}</Badge>
              </Group>
              <Text size="sm" c="dimmed" mb="md" lineClamp={2}>{project.description || 'No description'}</Text>
              <Group gap="xs">
                <Text size="xs" c="dimmed">{project.code}</Text>
                <Text size="xs" c="dimmed">·</Text>
                <Text size="xs" c="dimmed">{project.createdBy?.name}</Text>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}
