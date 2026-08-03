'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Container, Group, Text, Badge, Paper, Tabs, ActionIcon, Stack, Loader, Center, SimpleGrid, Avatar } from '@mantine/core';
import { IconArrowLeft, IconList, IconRobot, IconPlayerPlay, IconClock, IconFileText, IconSettings } from '@tabler/icons-react';
import { useTestCaseByCode } from '../../../../../../features/test-cases/hooks';
import { TestStepsTab } from '../../../../../../features/test-cases/components/detail/test-steps-tab';
import { TestCaseAutomationPanel } from '../../../../../../features/automation/components/test-case-automation-panel';
import type { TestCase, TestCaseType, TestCaseLastResult } from '../../../../../../features/test-cases/types';

type TabValue = 'overview' | 'steps' | 'expected-result' | 'automation' | 'executions' | 'history';

const priorityColor: Record<string, string> = {
  LOW: 'gray',
  MEDIUM: 'blue',
  HIGH: 'orange',
  CRITICAL: 'red',
};

const testCaseStatusColor: Record<string, string> = {
  DRAFT: 'gray',
  READY: 'green',
  ARCHIVED: 'yellow',
};

const typeColor: Record<TestCaseType, string> = {
  MANUAL: 'gray',
  AUTOMATION: 'violet',
};

const lastResultColor: Record<TestCaseLastResult, string> = {
  NOT_RUN: 'gray',
  RUNNING: 'blue',
  PASSED: 'green',
  FAILED: 'red',
};

const lastResultLabel: Record<TestCaseLastResult, string> = {
  NOT_RUN: 'Not Run',
  RUNNING: 'Running',
  PASSED: 'Passed',
  FAILED: 'Failed',
};

export default function TestCaseDetailPage() {
  const params = useParams<{ id: string; code: string }>();
  const { code } = params;
  const { data: testCase, isLoading } = useTestCaseByCode(code as string);
  const [activeTab, setActiveTab] = useState<TabValue>('overview');

  if (isLoading) return <Center h={400}><Loader /></Center>;
  if (!testCase) return <Center h={400}><Text c="dimmed">Test case not found</Text></Center>;

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="md">
        <Group>
          <ActionIcon onClick={() => window.history.back()} variant="subtle">
            <IconArrowLeft size={16} />
          </ActionIcon>
          <div>
            <Group gap="sm">
              <Text fw={600} size="xl">{testCase.title}</Text>
              <Badge ff="monospace" variant="light">{testCase.code}</Badge>
            </Group>
            <Group gap="xs" mt={4}>
              <Badge color={typeColor[testCase.type]} variant="light">{testCase.type}</Badge>
              <Badge color={priorityColor[testCase.priority]} variant="light">{testCase.priority}</Badge>
              <Badge color={testCaseStatusColor[testCase.status]} variant="light">{testCase.status}</Badge>
              <Badge color={lastResultColor[testCase.lastExecutionStatus]} variant="dot">{lastResultLabel[testCase.lastExecutionStatus]}</Badge>
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
            <PlaceholderTab icon={IconPlayerPlay} message="Executions tab - under development" />
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
  return (
    <Stack gap="md">
      {testCase.description && (
        <Paper p="md" withBorder>
          <Text fw={500} size="sm" mb={4}>Description</Text>
          <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{testCase.description}</Text>
        </Paper>
      )}

      <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }}>
        <Paper p="md" withBorder>
          <Text size="xs" c="dimmed">Project</Text>
          <Text size="sm">{testCase.project?.name ?? '\u2014'}</Text>
          {testCase.project?.code && <Text size="xs" c="dimmed">{testCase.project.code}</Text>}
        </Paper>
        <Paper p="md" withBorder>
          <Text size="xs" c="dimmed">Module</Text>
          <Text size="sm">{testCase.module ?? '\u2014'}</Text>
        </Paper>
        <Paper p="md" withBorder>
          <Text size="xs" c="dimmed">Type</Text>
          <Badge color={typeColor[testCase.type]} variant="light">{testCase.type}</Badge>
        </Paper>
        <Paper p="md" withBorder>
          <Text size="xs" c="dimmed">Priority</Text>
          <Badge color={priorityColor[testCase.priority]} variant="light">{testCase.priority}</Badge>
        </Paper>
        <Paper p="md" withBorder>
          <Text size="xs" c="dimmed">Design Status</Text>
          <Badge color={testCaseStatusColor[testCase.status]} variant="light">{testCase.status}</Badge>
        </Paper>
        <Paper p="md" withBorder>
          <Text size="xs" c="dimmed">Last Result</Text>
          <Badge color={lastResultColor[testCase.lastExecutionStatus]} variant="dot">{lastResultLabel[testCase.lastExecutionStatus]}</Badge>
        </Paper>
        <Paper p="md" withBorder>
          <Text size="xs" c="dimmed">Last Executed</Text>
          <Text size="sm">{testCase.lastExecutedAt ? new Date(testCase.lastExecutedAt).toLocaleString() : '\u2014'}</Text>
        </Paper>
        <Paper p="md" withBorder>
          <Text size="xs" c="dimmed">Created By</Text>
          {testCase.createdBy ? (
            <Group gap="xs" mt={4}>
              {testCase.createdBy.avatar && (
                <Avatar src={testCase.createdBy.avatar} size={24} radius="xl" />
              )}
              <Text size="sm">{testCase.createdBy.name || testCase.createdBy.email}</Text>
            </Group>
          ) : (
            <Text size="sm" c="dimmed">Unknown User</Text>
          )}
        </Paper>
        <Paper p="md" withBorder>
          <Text size="xs" c="dimmed">Created</Text>
          <Text size="sm">{new Date(testCase.createdAt).toLocaleString()}</Text>
        </Paper>
        <Paper p="md" withBorder>
          <Text size="xs" c="dimmed">Updated</Text>
          <Text size="sm">{new Date(testCase.updatedAt).toLocaleString()}</Text>
        </Paper>
      </SimpleGrid>
    </Stack>
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