'use client';

import { useState } from 'react';
import { Paper, Group, Text, Button, Stack, Code, Switch, Box, Loader, Center } from '@mantine/core';
import { IconRobot, IconPlayerPlay, IconFileCode } from '@tabler/icons-react';
import { useGenerateScript, useRunTest } from '../hooks';

interface Props {
  testCaseId: string;
}

export function TestCaseAutomationPanel({ testCaseId }: Props) {
  const generate = useGenerateScript(testCaseId);
  const run = useRunTest();
  const [headless, setHeadless] = useState(true);

  return (
    <Stack gap="md">
      <Paper p="md" withBorder>
        <Group justify="space-between">
          <Box>
            <Group gap="xs" mb={4}>
              <IconRobot size={16} style={{ color: 'var(--mantine-color-blue-6)' }} />
              <Text fw={600}>Automation</Text>
            </Group>
            <Text size="sm" c="dimmed">Generate a Playwright script from this test case&apos;s steps and run it locally.</Text>
          </Box>
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
              onClick={() => run.mutate({ testCaseId, data: { headless } })}
            >
              Run Test
            </Button>
          </Group>
        </Group>

        <Box mt="md">
          <Switch
            label="Headless"
            checked={headless}
            onChange={(e) => setHeadless(e.currentTarget.checked)}
          />
        </Box>
      </Paper>

      {generate.isPending && (
        <Paper p="md" withBorder>
          <Center py="lg"><Loader size="sm" /></Center>
        </Paper>
      )}

      {generate.data && (
        <Paper p="md" withBorder>
          <Group justify="space-between" mb="sm">
            <Text fw={600} size="sm">Generated Script</Text>
            <Text size="xs" c="dimmed" ff="monospace">{generate.data.code} · {generate.data.framework}</Text>
          </Group>
          <Code block style={{ maxHeight: 480, overflow: 'auto', fontSize: 12 }}>
            {generate.data.script}
          </Code>
        </Paper>
      )}
    </Stack>
  );
}
