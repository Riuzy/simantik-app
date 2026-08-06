'use client';

import { useState } from 'react';
import {
  Paper, Group, Text, Button, Stack, Code, Switch, Box, Loader, Center, Modal,
  Radio, Select, PasswordInput, Badge, Divider, ActionIcon, ScrollArea, Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconRobot, IconPlayerPlay, IconFileCode, IconEye, IconRotate, IconPlugConnected,
  IconPrompt, IconBraces, IconBrain,
} from '@tabler/icons-react';
import { useGenerateScript, useRunTest, useStoredScript } from '../hooks';
import { useAISettings, useTestConnection } from '../../ai/hooks';
import { AI_PROVIDER_OPTIONS, PROVIDER_MODEL_OPTIONS, OLLAMA_DEFAULT_HOST } from '../../ai/constants';
import type { AIProvider } from '../../ai/types';

interface Props {
  testCaseId: string;
}

export function TestCaseAutomationPanel({ testCaseId }: Props) {
  const { data: stored, isLoading: scriptLoading, refetch } = useStoredScript(testCaseId);
  const generate = useGenerateScript(testCaseId);
  const run = useRunTest();
  const { data: aiSettings } = useAISettings();
  const testConn = useTestConnection();

  const [opened, { open, close }] = useDisclosure(false);
  const [method, setMethod] = useState<'TEMPLATE' | 'AI'>('TEMPLATE');
  const [provider, setProvider] = useState<AIProvider>('GEMINI');
  const [model, setModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [headless, setHeadless] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);

  const openDialog = () => {
    const p = (aiSettings?.provider as AIProvider) ?? 'GEMINI';
    setProvider(p);
    setModel((PROVIDER_MODEL_OPTIONS[p as Exclude<AIProvider, 'RULE_ENGINE'>] ?? [])[0] ?? '');
    setApiKey('');
    setMethod('TEMPLATE');
    open();
  };

  const handleGenerate = () => {
    generate.mutate(
      {
        method,
        provider: method === 'AI' ? provider : undefined,
        model: method === 'AI' ? model || undefined : undefined,
        apiKey: method === 'AI' ? apiKey || undefined : undefined,
      },
      {
        onSuccess: () => {
          close();
          refetch();
        },
      },
    );
  };

  const handleTestConnection = () => {
    testConn.mutate(
      {
        provider,
        apiKey: apiKey || undefined,
        model: model || undefined,
        host: provider === 'OLLAMA' ? OLLAMA_DEFAULT_HOST : undefined,
      },
      {
        onSuccess: (result) => {
          notifications.show({
            title: result.success ? 'Connection Success' : 'Connection Failed',
            message: result.message,
            color: result.success ? 'green' : 'red',
          });
        },
        onError: () => {
           notifications.show({ title: 'Connection Failed', message: 'Cannot contact provider.', color: 'red' });
        },
      },
    );
  };

  const script = stored?.script ?? null;
  const generatedBy = stored?.provider ?? stored?.generatorType ?? null;
  const aiEnabled = aiSettings?.enabled && aiSettings.provider !== 'RULE_ENGINE';

  const modelOptions = (PROVIDER_MODEL_OPTIONS[provider as Exclude<AIProvider, 'RULE_ENGINE'>] ?? []).map((m) => ({
    value: m,
    label: m,
  }));

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
            <Button
              leftSection={<IconFileCode size={16} />}
              variant="light"
              onClick={openDialog}
            >
              Generate Script
            </Button>
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
          {aiEnabled && (
            <Badge variant="light" color="violet" leftSection={<IconBrain size={12} />}>
               AI Assistant active · {aiSettings.provider}
            </Badge>
          )}
        </Group>
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
                  Generated by {generatedBy}
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
                <ActionIcon variant="light" onClick={openDialog} aria-label="Regenerate script">
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
        opened={opened}
        onClose={close}
        title="Generate Automation Script"
        size="lg"
        centered
      >
        <Stack gap="md">
          <Radio.Group
            value={method}
            onChange={(v) => setMethod(v as 'TEMPLATE' | 'AI')}
            label="Metode Generate"
          >
            <Stack mt={8} gap="sm">
               <Radio value="TEMPLATE" label="Template Engine (Recommended)" description="Internal Rule Engine. Doesn't need API Key." />
               <Radio value="AI" label="AI Generator" description="AI helps generate Playwright script." />
            </Stack>
          </Radio.Group>

          <Divider />

          {method === 'AI' ? (
            <>
              <Select
                label="Provider"
                data={AI_PROVIDER_OPTIONS.filter((o) => o.value !== 'RULE_ENGINE').map((o) => ({ value: o.value, label: o.label }))}
                value={provider}
                onChange={(v) => {
                  const next = (v as AIProvider) || 'GEMINI';
                  setProvider(next);
                  setModel((PROVIDER_MODEL_OPTIONS[next as Exclude<AIProvider, 'RULE_ENGINE'>] ?? [])[0] ?? '');
                }}
              />
              {modelOptions.length > 0 ? (
                <Select label="Model" data={modelOptions} value={model} onChange={(v) => setModel(v ?? '')} searchable />
              ) : (
                <Select
                  label="Model"
                  data={model ? [{ value: model, label: model }] : []}
                  value={model || null}
                  searchable
                  onChange={(v) => setModel(v ?? '')}
                  placeholder="Type model name"
                />
              )}
              <PasswordInput
                label="API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.currentTarget.value)}
                 placeholder={aiSettings?.apiKeyConfigured ? 'Use saved API Key' : 'Enter API Key'}
              />
              <Group>
                <Button
                  variant="light"
                  leftSection={<IconPlugConnected size={16} />}
                  loading={testConn.isPending}
                  onClick={handleTestConnection}
                >
                  Test Connection
                </Button>
                {!aiEnabled && (
                   <Text size="xs" c="dimmed">Tip: enable AI Integration in Settings &gt; AI Integration.</Text>
                )}
              </Group>
            </>
          ) : (
            <Group gap="sm">
              <IconPrompt size={18} style={{ color: 'var(--mantine-color-blue-6)' }} />
              <Text size="sm" c="dimmed">
                 Rule Engine translates each Test Step into Playwright code automatically.
              </Text>
            </Group>
          )}

          <Group justify="flex-end">
            <Button variant="default" onClick={close}>Cancel</Button>
            <Button
              leftSection={<IconFileCode size={16} />}
              loading={generate.isPending}
              onClick={handleGenerate}
            >
              Generate
            </Button>
          </Group>
        </Stack>
      </Modal>

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
