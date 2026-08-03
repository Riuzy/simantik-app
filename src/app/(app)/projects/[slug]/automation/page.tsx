'use client';

import { useState } from 'react';
import { Button, Group, Text, Stack, Paper, TextInput, Select, Switch, Code, Loader, Center, Box, SimpleGrid } from '@mantine/core';
import { IconRobot, IconPlayerPlay, IconFileCode, IconSearch } from '@tabler/icons-react';
import { useProjectStore } from '../../../../../stores/project-store';
import { useTestCases } from '../../../../../features/test-cases/hooks';
import { useGenerateScript, useRunTest } from '../../../../../features/automation/hooks';
import { PageHeader } from '../../../../../components/ui/page-header';
import { FilterBar } from '../../../../../components/ui/filter-bar';
import { Section } from '../../../../../components/ui/section';
import { EmptyState } from '../../../../../components/ui/empty-state';
import type { TestPriority } from '../../../../../features/test-cases/types';

const priorities: TestPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function ProjectAutomationPage() {
  const selectedProject = useProjectStore((s) => s.selectedProject);
  const projectId = selectedProject?.id ?? '';

  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [headless, setHeadless] = useState(true);

  const { data, isLoading } = useTestCases(projectId, {
    type: 'AUTOMATION',
    search: search || undefined,
    priority: priority || undefined,
    page: 1,
    limit: 50,
  });

  const selected = (data?.data ?? []).find((tc) => tc.id === selectedId) ?? null;

  const generate = useGenerateScript(selectedId ?? '');
  const run = useRunTest();

  return (
    <div>
      <PageHeader
        title="Automation"
        description={`${selectedProject?.name ?? ''} · run automated test cases with Playwright`}
      />

      <FilterBar>
        <TextInput
          placeholder="Search automated test cases..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
        <Select
          placeholder="Priority"
          data={priorities.map((p) => ({ value: p, label: p }))}
          value={priority}
          onChange={setPriority}
          clearable
        />
      </FilterBar>

      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <Section title="Automated Test Cases" description="Select a test case to generate a script and run it">
          {isLoading ? (
            <Center py="xl"><Loader /></Center>
          ) : (data?.data ?? []).length === 0 ? (
            <EmptyState
              title="No automated test cases"
              description="Create automation test cases or mark existing test cases as Automation type"
              icon={IconRobot}
              compact
            />
          ) : (
            <Stack gap={4}>
              {(data?.data ?? []).map((tc) => (
                <Box
                  key={tc.id}
                  p="sm"
                  style={{
                    borderRadius: 8,
                    border: `1px solid ${selectedId === tc.id ? 'var(--mantine-color-blue-4)' : 'var(--mantine-color-gray-3)'}`,
                    backgroundColor: selectedId === tc.id ? 'var(--mantine-color-blue-0)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background-color 0.15s',
                  }}
                  onClick={() => setSelectedId(tc.id)}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <div style={{ minWidth: 0 }}>
                      <Text size="sm" fw={600} ff="monospace">{tc.code}</Text>
                      <Text size="sm" lineClamp={1}>{tc.title}</Text>
                    </div>
                    <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>{tc._count?.steps ?? 0} steps</Text>
                  </Group>
                </Box>
              ))}
            </Stack>
          )}
        </Section>

        <Section title="Run Console" description="Generate a Playwright script and execute it">
          {!selected ? (
            <EmptyState
              title="Select a test case"
              description="Choose an automated test case from the list to get started"
              icon={IconRobot}
              compact
            />
          ) : (
            <Stack gap="md">
              <Group justify="space-between" wrap="nowrap">
                <div style={{ minWidth: 0 }}>
                  <Text fw={600}>{selected.title}</Text>
                  <Text size="xs" c="dimmed" ff="monospace">{selected.code} · {selected._count?.steps ?? 0} steps</Text>
                </div>
                <Switch label="Headless" checked={headless} onChange={(e) => setHeadless(e.currentTarget.checked)} />
              </Group>

              <Group gap="sm">
                <Button
                  leftSection={<IconFileCode size={16} />}
                  variant="light"
                  loading={generate.isPending}
                  onClick={() => generate.mutate()}
                >
                  Generate Script
                </Button>
                <Button
                  leftSection={<IconPlayerPlay size={16} />}
                  color="green"
                  loading={run.isPending}
                  disabled={!generate.data}
                  onClick={() => run.mutate({ testCaseId: selected.id, data: { headless } })}
                >
                  Run Test
                </Button>
              </Group>

              {generate.isPending && (
                <Paper p="md" withBorder>
                  <Center py="lg"><Loader size="sm" /></Center>
                </Paper>
              )}

              {generate.data && (
                <Paper p="md" withBorder>
                  <Group justify="space-between" mb="sm">
                    <Text fw={600} size="sm">Generated Script</Text>
                    <Text size="xs" c="dimmed" ff="monospace">{generate.data.framework}</Text>
                  </Group>
                  <Code block style={{ maxHeight: 420, overflow: 'auto', fontSize: 12 }}>
                    {generate.data.script}
                  </Code>
                </Paper>
              )}
            </Stack>
          )}
        </Section>
      </SimpleGrid>
    </div>
  );
}
