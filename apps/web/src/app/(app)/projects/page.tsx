'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Group, Text, Button, Card, Badge, TextInput, SimpleGrid, Paper, Menu, ActionIcon, rem } from '@mantine/core';
import { IconPlus, IconSearch, IconFolder, IconDots, IconEye, IconPencil, IconTrash } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import Link from 'next/link';
import { useProjects, useDeleteProject } from '../../../features/projects/hooks';
import { PageHeader } from '../../../components/common/page';
import { ROUTES } from '../../../constants/routes';
import type { ProjectList } from '../../../features/projects/types';

const statusColor: Record<string, string> = {
  ACTIVE: 'green', COMPLETED: 'gray',
};

function ProjectCard({ project }: { project: ProjectList }) {
  const router = useRouter();
  const deleteProject = useDeleteProject(project.id);

  const openDeleteConfirm = () =>
    modals.openConfirmModal({
      title: 'Delete Project',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete this project? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteProject.mutate(),
    });

  return (
    <Card key={project.id} padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Text fw={500} size="lg" style={{ flex: 1 }}>{project.name}</Text>
        <Group gap="xs">
          <Badge color={statusColor[project.status] || 'gray'} variant="light" size="sm">{project.status}</Badge>
          <Menu shadow="md" width={160}>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="sm" aria-label="Project menu">
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconEye style={{ width: rem(14), height: rem(14) }} />} onClick={() => router.push(ROUTES.PROJECT_DETAIL(project.slug))}>
                View Project
              </Menu.Item>
              <Menu.Item leftSection={<IconPencil style={{ width: rem(14), height: rem(14) }} />} onClick={() => router.push(ROUTES.PROJECT_EDIT(project.slug))}>
                Edit Project
              </Menu.Item>
              <Menu.Item leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />} color="red" onClick={openDeleteConfirm}>
                Delete Project
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
      <Text size="sm" c="dimmed" mb="md" lineClamp={2}>{project.description || 'No description'}</Text>
      <Group gap="xs">
        <Text size="xs" c="dimmed">{project.code}</Text>
        <Text size="xs" c="dimmed">·</Text>
        <Text size="xs" c="dimmed">{project.createdBy?.name}</Text>
      </Group>
    </Card>
  );
}

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useProjects({ search: search || undefined });

  return (
    <Container size="xl" py="md">
      <PageHeader
        title="Projects"
        description="Manage your automation testing projects"
        actions={<Button leftSection={<IconPlus size={16} />} component={Link} href="/projects/create">New Project</Button>}
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
          <Button component={Link} href="/projects/create" mt="md" variant="light">Create your first project</Button>
        </Paper>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
          {data.data.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}
