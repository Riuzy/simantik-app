'use client';

import { useState } from 'react';
import {
  Paper, Group, Text, Button, Stack, Code, Switch, Box, Loader, Center, Modal,
  Badge, ActionIcon, ScrollArea, Tooltip, Menu, ThemeIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import {
  IconRobot, IconPlayerPlay, IconFileCode, IconEye, IconRotate, IconBrain,
  IconSettings, IconPlugConnected, IconPlugConnectedX, IconBraces,
} from '@tabler/icons-react';
import { useGenerateScript, useRunTest, useStoredScript } from '../hooks';
import { useAISettings } from '../../ai/hooks';
import { AI_PROVIDER_OPTIONS } from '../../ai/constants';
import { ROUTES } from '../../../constants/routes';
import type { AIConnectionStatus } from '../../ai/types';

interface Props {
  testCaseId: string;
}

function providerLabel(provider: string | null | undefined): string {
  if (!provider) return '\u2014';
  const option = AI_PROVIDER_OPTIONS.find((o) => o.value === provider);
  return option?.label ?? provider;
}

function statusBadge(status: AIConnectionStatus, tested: boolean) {
  if (!tested) {
    return { label: 'Not Tested', color: 'gray' as const };
  }
  if (status === 'connected') {
    return { label: 'Connected', color: 'green' as const };
  }
  return { label: 'Disconnected', color: 'red' as const };
}

export function TestCaseAutomationPanel({ testCaseId }: Props) {
  const router = useRouter();
  const { data: stored, isLoading: scriptLoading, refetch } = useStoredScript(testCaseId);
  const generate = useGenerateScript(testCaseId);
  const run = useRunTest();
  const { data: aiSettings } = useAISettings();

  const [method, setMethod] = useState<'AI' | 'TEMPLATE'>('AI');
  const [headless, setHeadless] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [methodMenuOpen, { open: openMethodMenu, close: closeMethodMenu }] = useDisclosure(false);

  const aiConfigured = Boolean(
    aiSettings?.enabled &&
    aiSettings.provider !== 'RULE_ENGINE' &&
    aiSettings.apiKeyConfigured &&
    aiSettings.model,
  );
  const connectionTested = Boolean(aiSettings?.connectionTestedAt);
  const statusInfo = statusBadge(aiSettings?.connectionStatus ?? null, connectionTested);
  const activeProvider = aiSettings?.provider === 'RULE_ENGINE' ? null : (aiSettings?.provider ?? null);

  const script = stored?.script ?? null;
  const generatedBy = stored?.provider ?? stored?.generatorType ?? null;

  const handleGenerate = (m: 'AI' | 'TEMPLATE') => {
    setMethod(m);
    generate.mutate({ method: m }, { onSuccess: () => refetch() });
  };

  const openSettingsPage = () => {
    closeMethodMenu();
    router.push(ROUTES.SETTINGS);
  };

  return (
    <Stack gap="md">
      <Paper p="md" withBorder>
        <Group justify="space-between" align="center">
          <Box>
            <Group gap="xs" mb={4}>
              <IconRobot size={16} style={{ color: 'var(--mantine-color-blue-6)' }} />
              <Text fw={600}>Automation</Text>
            </Group>
            <Text size="sm" c="dimmed">
              Generate a Playwright script from this test case&apos;s steps and run it locally.
            </Text>
          </Box>
          <Group gap="sm">
            <Menu
              position="bottom-end"
              opened={methodMenuOpen}
              onOpen={openMethodMenu}
              onClose={closeMethodMenu}
            >
              <Menu.Target>
                <Button
                  leftSection={<IconFileCode size={16} />}
                  loading={generate.isPending}
                  disabled={!aiConfigured}
                >
                  Generate Script
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Generate Method</Menu.Label>
                <Menu.Item
                  leftSection={<IconBrain size={14} />}
                  onClick={() => handleGenerate('AI')}
                >
                  AI Generator
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconBraces size={14} />}
                  onClick={() => handleGenerate('TEMPLATE')}
                >
                  Template Engine
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <Button
              leftSection={<IconPlayerPlay size={16} />}
              color="green"
              loading={run.isPending}
              onClick={() => run.mutate({ testCaseId, data: { headless } })}
            >
              Run Test
            </Button>
          </Group>
        </Group>

        <Group mt="md" justify="space-between">
          <Switch label="Headless" checked={headless} onChange={(e) => setHeadless(e.currentTarget.checked)} />
          {aiConfigured && (
            <Badge variant="light" color="violet" leftSection={<IconBrain size={12} />}>
              AI Assistant active
            </Badge>
          )}
        </Group>
      </Paper>

      <Paper p="md" withBorder>
        {aiConfigured ? (
          <Group justify="space-between" wrap="wrap" align="center" gap="md">
            <Group gap="sm" align="center">
              <ThemeIcon variant="light" color="violet" size="lg" radius="md">
                <IconBrain size={18} />
              </ThemeIcon>
              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>AI Assistant</Text>
                <Group gap="xs" mt={2}>
                  <Text size="sm" fw={600}>{providerLabel(activeProvider)}</Text>
                  <Badge variant="outline" size="sm">{aiSettings?.model}</Badge>
                  <Badge
                    variant="light"
                    color={statusInfo.color}
                    leftSection={
                      statusInfo.label === 'Connected'
                        ? <IconPlugConnected size={11} />
                        : statusInfo.label === 'Disconnected'
                          ? <IconPlugConnectedX size={11} />
                          : undefined
                    }
                  >
                    {statusInfo.label}
                  </Badge>
                </Group>
              </Box>
            </Group>
            <Group gap="xs">
              <Button size="xs" variant="light" leftSection={<IconSettings size={14} />} onClick={openSettingsPage}>
                Manage AI Settings
              </Button>
            </Group>
          </Group>
        ) : (
          <Stack align="center" gap="xs" py="lg" ta="center">
            <ThemeIcon variant="light" color="gray" size="lg" radius="md">
              <IconBrain size={18} />
            </ThemeIcon>
            <Text size="sm" fw={600}>AI Provider is not configured.</Text>
            <Text size="xs" c="dimmed" maw={420}>
              Please configure your AI provider in Settings before generating scripts.
            </Text>
            <Button size="xs" variant="light" leftSection={<IconSettings size={14} />} onClick={openSettingsPage} mt="xs">
              Open AI Settings
            </Button>
          </Stack>
        )}
        {aiConfigured && aiSettings?.connectionStatus === 'failed' && (
          <Text size="xs" c="red" mt="xs">
            {aiSettings.connectionMessage || 'Please reconnect from Settings.'}
          </Text>
        )}
      </Paper>

      {scriptLoading && (
        <Paper p="md" withBorder>
          <Center py="lg"><Loader size="sm" /></Center>
        </Paper>
      )}

      {!scriptLoading && !script && (
        <Paper p="xl" ta="center" withBorder>
          <IconFileCode size={40} stroke={1} style={{ opacity: 0.3 }} />
           <Text c="dimmed" mt="sm" size="sm">
             Automation script not created yet. Click &quot;Generate Script&quot; to create it.
           </Text>
        </Paper>
      )}

      {!scriptLoading && script && (
        <Paper p="md" withBorder>
          <Group justify="space-between" mb="sm">
            <Group gap="sm">
              <Text fw={600} size="sm">Generated Script</Text>
              {generatedBy && (
                <Badge
                  variant="light"
                  color={stored?.generatorType === 'AI' ? 'violet' : 'blue'}
                  leftSection={stored?.generatorType === 'AI' ? <IconBrain size={12} /> : <IconBraces size={12} />}
                >
                  Generated by {providerLabel(generatedBy)}
                </Badge>
              )}
              {stored?.model && <Badge variant="outline" size="sm">{stored.model}</Badge>}
            </Group>
            <Group gap="xs">
              <Tooltip label="Preview Script">
                <ActionIcon variant="light" onClick={() => setPreviewOpen(true)} aria-label="Preview script">
                  <IconEye size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Regenerate">
                <ActionIcon variant="light" onClick={() => handleGenerate(method)} aria-label="Regenerate script">
                  <IconRotate size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
          <Code block style={{ maxHeight: 480, overflow: 'auto', fontSize: 12 }}>
            {script}
          </Code>
          {stored?.lastRunAt && (
            <Text size="xs" c="dimmed" mt="sm">Last run: {new Date(stored.lastRunAt).toLocaleString()}</Text>
          )}
        </Paper>
      )}

      <Modal
        opened={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Script Preview"
        size="xl"
        centered
      >
        <ScrollArea h={500}>
          <Code block style={{ fontSize: 12 }}>{script}</Code>
        </ScrollArea>
      </Modal>
    </Stack>
  );
}
