'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Group, Text, Button, Card, TextInput, SimpleGrid, Menu, ActionIcon, rem, Badge, ThemeIcon, Stack, Loader, Center, ScrollArea } from '@mantine/core';
import { IconPlus, IconSearch, IconFolder, IconDots, IconEye, IconPencil, IconTrash, IconRobot, IconPlayerPlay, IconCircleCheck } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import Link from 'next/link';
import { useProjects, useDeleteProject } from '../../../features/projects/hooks';
import { PageHeader } from '../../../components/ui/page-header';
import { EmptyState } from '../../../components/ui/empty-state';
import { FrameworkBadge, BrowserBadge } from '../../../components/ui/badges';
import { ROUTES } from '../../../constants/routes';
import type { ProjectList } from '../../../features/projects/types';

function ProjectCard({ project }: { project: ProjectList }) {
  const router = useRouter();
  const deleteProject = useDeleteProject(project.id);

  const openDeleteConfirm = () =>
    modals.openConfirmModal({
      title: 'Delete Project',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete project &quot;{project.name}&quot;? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteProject.mutate(),
    });

  const passRate = project.passRate ?? 0;

  return (
    <Card
      padding="lg"
      radius="md"
      withBorder
      style={{ cursor: 'pointer', transition: 'box-shadow 0.15s ease', position: 'relative' }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--mantine-shadow-md)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'var(--mantine-shadow-xs)')}
      onClick={() => router.push(ROUTES.PROJECT_OVERVIEW(project.slug))}
    >
      <Group justify="space-between" mb="xs" wrap="nowrap">
        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
          <ThemeIcon size={36} radius="md" variant="light" color="blue">
            <IconFolder size={20} stroke={1.6} />
          </ThemeIcon>
          <div style={{ minWidth: 0 }}>
            <Text fw={600} size="md" lineClamp={1}>{project.name}</Text>
            <Text size="xs" c="dimmed" ff="monospace">{project.code}</Text>
          </div>
        </Group>
        <Menu shadow="md" width={160} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" size="sm" aria-label="Project menu" onClick={(e) => e.stopPropagation()}>
              <IconDots size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconEye style={{ width: rem(14), height: rem(14) }} />} onClick={() => router.push(ROUTES.PROJECT_OVERVIEW(project.slug))}>
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

      <Text size="sm" c="dimmed" mb="md" lineClamp={2} style={{ minHeight: 36 }}>
        {project.description || 'No description'}
      </Text>

      <Group gap="xs" mb="md">
        <FrameworkBadge value={project.framework} size="xs" />
        <BrowserBadge value={project.browser} size="xs" />
        {project.environment && <Badge size="xs" variant="outline">{project.environment}</Badge>}
      </Group>

      <Group gap="lg">
        <Stack gap={2}>
          <Text size="xs" c="dimmed">Automation</Text>
          <Group gap={6} wrap="nowrap">
            <IconRobot size={14} style={{ color: 'var(--mantine-color-violet-6)' }} />
            <Text size="sm" fw={600}>{project.automationCount}</Text>
          </Group>
        </Stack>
        <Stack gap={2}>
          <Text size="xs" c="dimmed">Executions</Text>
          <Group gap={6} wrap="nowrap">
            <IconPlayerPlay size={14} style={{ color: 'var(--mantine-color-cyan-6)' }} />
            <Text size="sm" fw={600}>{project.executionCount}</Text>
          </Group>
        </Stack>
        <Stack gap={2} style={{ flex: 1 }}>
          <Text size="xs" c="dimmed">Pass Rate</Text>
          <Group gap={6} wrap="nowrap">
            <IconCircleCheck size={14} style={{ color: project.passRate == null ? 'var(--mantine-color-gray-5)' : 'var(--mantine-color-green-6)' }} />
            <Text size="sm" fw={600}>{project.passRate == null ? 'N/A' : `${passRate}%`}</Text>
          </Group>
        </Stack>
      </Group>
    </Card>
  );
}

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useProjects({ search: search || undefined });

  return (
    <Container size="xl">
      <PageHeader
        title="Projects"
        description="Manage your automation testing projects"
        actions={<Button leftSection={<IconPlus size={16} />} component={Link} href={ROUTES.PROJECT_CREATE}>New Project</Button>}
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
        <Center py="xl"><Loader /></Center>
      ) : !data?.data?.length ? (
        <Card p="xl" radius="md" withBorder>
          <EmptyState
            title="No projects found"
            description="Create your first project to start managing automation test cases"
            icon={IconFolder}
            action={<Button component={Link} href={ROUTES.PROJECT_CREATE} leftSection={<IconPlus size={16} />} mt="md">Create your first project</Button>}
          />
        </Card>
      ) : (
        <ScrollArea.Autosize mah="calc(100vh - 220px)" offsetScrollbars>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
            {data.data.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </SimpleGrid>
        </ScrollArea.Autosize>
      )}
    </Container>
  );
}
