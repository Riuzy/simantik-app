'use client';

import { useParams } from 'next/navigation';
import { Container, Group, Text, Badge, Paper, SimpleGrid, Button, Loader, Center, Tabs, rem } from '@mantine/core';
import { IconFolder, IconTestPipe, IconInfoCircle, IconPlayerPlay, IconLink, IconRobot } from '@tabler/icons-react';
import Link from 'next/link';
import { useProjectBySlug } from '../../../../features/projects/hooks';
import { TestCasesTab } from '../../../../features/test-cases/components/test-cases-tab';
import { AutomationConfigForm } from '../../../../features/automation/components/automation-config-form';
import { PageHeader } from '../../../../components/common/page';

const statusColor: Record<string, string> = {
  ACTIVE: 'green', COMPLETED: 'cyan',
};

function OverviewTab({ project }: { project: NonNullable<ReturnType<typeof useProjectBySlug>['data']> }) {
  return (
    <>
      <SimpleGrid cols={{ base: 1, md: 3 }} mb="lg">
        <Paper p="md" withBorder>
          <Text size="sm" fw={500}>Status</Text>
          <Badge color={statusColor[project.status]} mt={4}>{project.status}</Badge>
        </Paper>
        <Paper p="md" withBorder>
          <Text size="sm" fw={500}>Framework</Text>
          <Text mt={4}>{project.framework}</Text>
        </Paper>
        <Paper p="md" withBorder>
          <Text size="sm" fw={500}>Environment</Text>
          <Text mt={4}>{project.environment || '\u2014'}</Text>
        </Paper>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 3 }} mb="lg">
        <Paper p="md" withBorder>
          <Group gap="xs" align="center">
            <IconLink size={16} style={{ color: 'var(--mantine-color-gray-5)' }} />
            <Text size="sm" fw={500}>Base URL</Text>
          </Group>
          <Text size="sm" mt={4} style={{ wordBreak: 'break-all' }}>{project.baseUrl || '\u2014'}</Text>
        </Paper>
        <Paper p="md" withBorder>
          <Text size="sm" fw={500}>Created by</Text>
          <Text mt={4}>{project.createdBy?.name}</Text>
        </Paper>
        <Paper p="md" withBorder>
          <Text size="sm" fw={500}>Statistics</Text>
          <Text mt={4}>Test Cases: {project._count?.testCases ?? 0}</Text>
          <Text size="xs">Executions: {project._count?.executions ?? 0}</Text>
        </Paper>
      </SimpleGrid>

      {project.description && (
        <Paper p="md" withBorder>
          <Text size="sm" fw={500} mb={4}>Description</Text>
          <Text size="sm">{project.description}</Text>
        </Paper>
      )}
    </>
  );
}

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading } = useProjectBySlug(slug as string);
  const projectId = project?.id ?? '';

  if (isLoading) return <Center h={400}><Loader /></Center>;
  if (!project) return <Center h={400}><Text c="dimmed">Project not found</Text></Center>;

  return (
    <Container size="xl" py="md">
      <PageHeader
        title={project.name}
        description={`${project.code} · ${project.slug}`}
        actions={
          <Button leftSection={<IconPlayerPlay size={16} />} component={Link} href={`/automation?project=${project.slug}`}>
            Automation
          </Button>
        }
      />

      <Tabs defaultValue="overview" mt="md">
        <Tabs.List mb="md">
          <Tabs.Tab value="overview" leftSection={<IconInfoCircle style={{ width: rem(16), height: rem(16) }} />}>Overview</Tabs.Tab>
          <Tabs.Tab value="test-cases" leftSection={<IconTestPipe style={{ width: rem(16), height: rem(16) }} />}>Test Cases</Tabs.Tab>
          <Tabs.Tab value="automation" leftSection={<IconRobot style={{ width: rem(16), height: rem(16) }} />}>Automation</Tabs.Tab>
          <Tabs.Tab value="executions" leftSection={<IconFolder style={{ width: rem(16), height: rem(16) }} />}>Executions</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <OverviewTab project={project} />
        </Tabs.Panel>

        <Tabs.Panel value="test-cases">
          <TestCasesTab projectId={projectId} projectSlug={project.slug} canManage />
        </Tabs.Panel>

        <Tabs.Panel value="automation">
          <AutomationConfigForm projectId={projectId} />
        </Tabs.Panel>

        <Tabs.Panel value="executions">
          <Paper p="md" withBorder>
            <Button component={Link} href={`/executions?project=${project.slug}`} variant="light" fullWidth>
              View Executions
            </Button>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
