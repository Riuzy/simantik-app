'use client';

import { useParams } from 'next/navigation';
import { Container, Group, Title, Text, Badge, Paper, SimpleGrid, Avatar, Button, Loader, Center, Stack } from '@mantine/core';
import { useProject, useProjectMembers, useAddMember, useRemoveMember } from '../../../../features/projects/hooks';
import { PageHeader } from '../../../../components/common/page';

const statusColor: Record<string, string> = {
  PLANNING: 'gray', ACTIVE: 'green', TESTING: 'blue', COMPLETED: 'cyan', ARCHIVED: 'red',
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading } = useProject(id);
  const { data: members } = useProjectMembers(id);
  const addMember = useAddMember(id);
  const removeMember = useRemoveMember(id);

  if (isLoading) return <Center h={400}><Loader /></Center>;
  if (!project) return <Center h={400}><Text c="dimmed">Project not found</Text></Center>;

  return (
    <Container size="xl" py="md">
      <PageHeader title={project.name} description={`${project.code} · ${project.slug}`} />

      <SimpleGrid cols={{ base: 1, md: 3 }} mb="lg">
        <Paper p="md" withBorder>
          <Text size="sm" fw={500}>Status</Text>
          <Badge color={statusColor[project.status]} mt={4}>{project.status}</Badge>
        </Paper>
        <Paper p="md" withBorder>
          <Text size="sm" fw={500}>Created by</Text>
          <Text mt={4}>{project.createdBy?.name}</Text>
        </Paper>
        <Paper p="md" withBorder>
          <Text size="sm" fw={500}>Statistics</Text>
          <Text mt={4}>Members: {project._count?.members ?? 0}</Text>
          <Text size="xs">Test Cases: {project._count?.testCases ?? 0}</Text>
          <Text size="xs">Test Runs: {project._count?.testRuns ?? 0}</Text>
          <Text size="xs">Bugs: {project._count?.bugReports ?? 0}</Text>
        </Paper>
      </SimpleGrid>

      {project.description && (
        <Paper p="md" withBorder mb="lg">
          <Text size="sm" fw={500} mb={4}>Description</Text>
          <Text size="sm">{project.description}</Text>
        </Paper>
      )}

      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Text fw={500}>Members ({members?.length ?? 0})</Text>
        </Group>
        {!members?.length ? (
          <Text c="dimmed" size="sm">No members yet</Text>
        ) : (
          members.map((m) => (
            <Group key={m.id} justify="space-between" py="xs">
              <Group gap="sm">
                <Avatar src={m.user.avatar} alt={m.user.name} size="sm" radius="xl" />
                <div>
                  <Text size="sm">{m.user.name}</Text>
                  <Text size="xs" c="dimmed">{m.user.role?.name}</Text>
                </div>
              </Group>
            </Group>
          ))
        )}
      </Paper>
    </Container>
  );
}
