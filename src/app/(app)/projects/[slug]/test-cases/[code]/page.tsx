'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Group, Text, Badge, Paper, Tabs, ActionIcon, Stack, Loader, Center, SimpleGrid, Avatar } from '@mantine/core';
import { IconArrowLeft, IconList, IconRobot, IconPlayerPlay, IconClock, IconFileText, IconSettings } from '@tabler/icons-react';
import { useTestCaseByCode } from '../../../../../../features/test-cases/hooks';
import { useExecutions } from '../../../../../../features/executions/hooks';
import { TestStepsTab } from '../../../../../../features/test-cases/components/detail/test-steps-tab';
import { TestCaseAutomationPanel } from '../../../../../../features/automation/components/test-case-automation-panel';
import { PriorityBadge, TestCaseStatusBadge, TestCaseTypeBadge, LastResultBadge } from '../../../../../../components/ui/badges';
import { Section } from '../../../../../../components/ui/section';
import { EmptyState } from '../../../../../../components/ui/empty-state';
import { ROUTES } from '../../../../../../constants/routes';
import type { TestCase } from '../../../../../../features/test-cases/types';

type TabValue = 'overview' | 'steps' | 'expected-result' | 'automation' | 'executions' | 'history';

export default function TestCaseDetailPage() {
  const params = useParams<{ slug: string; code: string }>();
  const { slug, code } = params;
  const router = useRouter();
  const { data: testCase, isLoading } = useTestCaseByCode(code as string);
  const [activeTab, setActiveTab] = useState<TabValue>('overview');

  if (isLoading) return <Center h={400}><Loader /></Center>;
  if (!testCase) return <Center h={400}><Text c="dimmed">Test case not found</Text></Center>;

  return (
    <Container size="xl">
      <Group justify="space-between" mb="md" wrap="nowrap">
        <Group wrap="nowrap" style={{ minWidth: 0 }}>
          <ActionIcon onClick={() => router.push(ROUTES.PROJECT_TEST_CASES(slug))} variant="subtle" aria-label="Back to test cases">
            <IconArrowLeft size={16} />
          </ActionIcon>
          <div style={{ minWidth: 0 }}>
            <Group gap="sm" wrap="nowrap">
              <Text fw={600} size="xl" lineClamp={1}>{testCase.title}</Text>
              <Badge ff="monospace" variant="light">{testCase.code}</Badge>
            </Group>
            <Group gap="xs" mt={4} wrap="wrap">
              <TestCaseTypeBadge value={testCase.type} />
              <PriorityBadge value={testCase.priority} />
              <TestCaseStatusBadge value={testCase.status} />
              <LastResultBadge value={testCase.lastExecutionStatus} />
              {testCase.module && <Badge variant="light">{testCase.module}</Badge>}
            </Group>
          </div>
        </Group>
      </Group>

      <Paper withBorder>
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value as TabValue)}>
          <Tabs.List>
            <Tabs.Tab value="overview" leftSection={<IconFileText size={14} />}>Overview</Tabs.Tab>
            <Tabs.Tab value="steps" leftSection={<IconList size={14} />}>Test Steps</Tabs.Tab>
            <Tabs.Tab value="expected-result" leftSection={<IconSettings size={14} />}>Expected Result</Tabs.Tab>
            <Tabs.Tab value="automation" leftSection={<IconRobot size={14} />}>Automation</Tabs.Tab>
            <Tabs.Tab value="executions" leftSection={<IconPlayerPlay size={14} />}>Executions</Tabs.Tab>
            <Tabs.Tab value="history" leftSection={<IconClock size={14} />}>History</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            <OverviewTab testCase={testCase} />
          </Tabs.Panel>

          <Tabs.Panel value="steps" pt="md">
            <TestStepsTab testCase={testCase} canManage />
          </Tabs.Panel>

          <Tabs.Panel value="expected-result" pt="md">
            <PlaceholderTab icon={IconSettings} message="Expected Result tab - under development" />
          </Tabs.Panel>

          <Tabs.Panel value="automation" pt="md">
            <TestCaseAutomationPanel testCaseId={testCase.id} />
          </Tabs.Panel>

          <Tabs.Panel value="executions" pt="md">
            <ExecutionsTab testCase={testCase} />
          </Tabs.Panel>

          <Tabs.Panel value="history" pt="md">
            <PlaceholderTab icon={IconClock} message="History tab - under development" />
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Container>
  );
}

function OverviewTab({ testCase }: { testCase: TestCase }) {
  const info: { label: string; value: React.ReactNode }[] = [
    { label: 'Project', value: testCase.project?.name ?? '\u2014' },
    { label: 'Module', value: testCase.module ?? '\u2014' },
    { label: 'Type', value: <TestCaseTypeBadge value={testCase.type} /> },
    { label: 'Priority', value: <PriorityBadge value={testCase.priority} /> },
    { label: 'Design Status', value: <TestCaseStatusBadge value={testCase.status} /> },
    { label: 'Last Result', value: <LastResultBadge value={testCase.lastExecutionStatus} /> },
    { label: 'Last Executed', value: testCase.lastExecutedAt ? new Date(testCase.lastExecutedAt).toLocaleString() : '\u2014' },
    {
      label: 'Created By',
      value: testCase.createdBy ? (
        <Group gap="xs">
          {testCase.createdBy.avatar && <Avatar src={testCase.createdBy.avatar} size={24} radius="xl" />}
          <Text size="sm">{testCase.createdBy.name || testCase.createdBy.email}</Text>
        </Group>
      ) : (
        '\u2014'
      ),
    },
    { label: 'Created', value: new Date(testCase.createdAt).toLocaleString() },
    { label: 'Updated', value: new Date(testCase.updatedAt).toLocaleString() },
    { label: 'Steps', value: testCase._count?.steps ?? testCase.steps?.length ?? 0 },
  ];

  return (
    <Stack gap="md">
      {testCase.description && (
        <Section title="Description">
          <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{testCase.description}</Text>
        </Section>
      )}

      <Section title="Details">
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {info.map((item) => (
            <Paper key={item.label} p="md" withBorder>
              <Text size="xs" c="dimmed">{item.label}</Text>
              <div style={{ marginTop: 4 }}>{item.value}</div>
            </Paper>
          ))}
        </SimpleGrid>
      </Section>
    </Stack>
  );
}

function ExecutionsTab({ testCase }: { testCase: TestCase }) {
  const { data: executions, isLoading } = useExecutions({ testCaseId: testCase.id, page: 1, limit: 20 });

  if (isLoading) return <Center py="xl"><Loader /></Center>;
  if (!executions?.data?.length) {
    return (
      <EmptyState
        title="No executions"
        description="This test case has not been executed yet"
        icon={IconPlayerPlay}
        compact={false}
      />
    );
  }

  return (
    <Paper p="md" withBorder>
      <Stack gap="sm">
        {executions.data.map((ex) => (
          <Group key={ex.id} justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
              <Badge color={ex.status === 'PASSED' ? 'green' : ex.status === 'FAILED' ? 'red' : ex.status === 'ERROR' ? 'orange' : 'gray'} variant="dot">
                {ex.status}
              </Badge>
              <Text size="sm" fw={500} ff="monospace">{ex.number}</Text>
              <Text size="sm" truncate>{new Date(ex.createdAt ?? '').toLocaleString()}</Text>
            </Group>
            <Text size="sm" c="dimmed">
              {ex.durationMs != null ? `${(ex.durationMs / 1000).toFixed(1)}s` : '\u2014'}
            </Text>
          </Group>
        ))}
      </Stack>
    </Paper>
  );
}

function PlaceholderTab({ icon: Icon, message }: { icon: React.ComponentType<{ size?: number; stroke?: number }>; message: string }) {
  return (
    <Paper p="xl" ta="center" withBorder>
      <div style={{ opacity: 0.3 }}>
        <Icon size={40} stroke={1} />
      </div>
      <Text c="dimmed" mt="sm">{message}</Text>
    </Paper>
  );
}
