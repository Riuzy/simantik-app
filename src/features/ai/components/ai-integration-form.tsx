'use client';

import { useEffect, useState } from 'react';
import {
  Stack, Paper, Group, Text, Select, TextInput, PasswordInput, Switch, Button, Badge, Box, Loader, Center, Anchor, NumberInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlugConnected, IconDeviceFloppy, IconRobot } from '@tabler/icons-react';
import { useAISettings, useSaveAISettings, useTestConnection } from '../hooks';
import { AI_PROVIDER_OPTIONS, PROVIDER_MODEL_OPTIONS, OLLAMA_DEFAULT_HOST } from '../constants';
import { AIProvider } from '../types';

const MODEL_LABELS: Record<string, Record<string, string>> = {
  GEMINI: {
    'gemini-2.5-flash': 'Gemini 2.5 Flash',
    'gemini-2.5-pro': 'Gemini 2.5 Pro',
    'gemini-flash-lite': 'Gemini Flash Lite',
  },
  OPENROUTER: {
    'deepseek/deepseek-chat': 'DeepSeek Chat',
    'google/gemini-2.5-flash': 'Gemini 2.5 Flash',
    'qwen/qwen3': 'Qwen 3',
    'meta-llama/llama-3.1-8b-instruct': 'Meta Llama 3.1',
  },
  OLLAMA: {},
  OPENAI: {
    'gpt-5.5': 'GPT-5.5',
    'gpt-5': 'GPT-5',
    'gpt-4.1': 'GPT-4.1',
  },
};

export function AIIntegrationForm() {
  const { data: settings, isLoading } = useAISettings();
  const save = useSaveAISettings();
  const testConn = useTestConnection();

  const [enabled, setEnabled] = useState(false);
  const [provider, setProvider] = useState<AIProvider>('RULE_ENGINE');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');
  const [host, setHost] = useState(OLLAMA_DEFAULT_HOST);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [maxTokens, setMaxTokens] = useState<number | null>(null);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  useEffect(() => {
    if (!settings) return;
    setEnabled(settings.enabled);
    setProvider(settings.provider);
    setApiKey('');
    setApiKeyConfigured(settings.apiKeyConfigured);
    setBaseUrl(settings.baseUrl ?? '');
    setModel(settings.model ?? '');
    setHost(settings.host ?? OLLAMA_DEFAULT_HOST);
    setTemperature(settings.temperature);
    setMaxTokens(settings.maxTokens);
    setConnectionStatus('idle');
  }, [settings]);

  if (isLoading) {
    return <Center h={200}><Loader /></Center>;
  }

  const providerMeta = AI_PROVIDER_OPTIONS.find((o) => o.value === provider);

  const handleTestConnection = () => {
    testConn.mutate(
      {
        provider,
        apiKey: apiKey || undefined,
        baseUrl: baseUrl || undefined,
        model: model || undefined,
        host: host || undefined,
        temperature: temperature ?? undefined,
        maxTokens: maxTokens ?? undefined,
      },
      {
        onSuccess: (result) => {
          setConnectionStatus(result.success ? 'success' : 'failed');
          notifications.show({
            title: result.success ? 'Connection Success' : 'Connection Failed',
            message: result.message,
            color: result.success ? 'green' : 'red',
          });
        },
        onError: () => {
          setConnectionStatus('failed');
          notifications.show({ title: 'Connection Failed', message: 'Tidak dapat menghubungi provider.', color: 'red' });
        },
      },
    );
  };

  const handleSave = () => {
    save.mutate({
      enabled,
      provider,
      apiKey: apiKey || (apiKeyConfigured ? undefined : null),
      baseUrl: baseUrl || null,
      model: model || null,
      host: host || null,
      temperature,
      maxTokens,
    });
  };

  const modelOptions = (PROVIDER_MODEL_OPTIONS[provider as Exclude<AIProvider, 'RULE_ENGINE'>] ?? []).map((m) => ({
    value: m,
    label: MODEL_LABELS[provider]?.[m] ?? m,
  }));

  return (
    <Stack gap="md">
      <Paper p="md" withBorder>
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm">
            <IconRobot size={20} style={{ color: 'var(--mantine-color-blue-6)' }} />
            <Box>
              <Text fw={600}>AI Integration</Text>
              <Text size="sm" c="dimmed">AI bersifat opsional. SIMANTIK tetap berjalan tanpa AI.</Text>
            </Box>
          </Group>
          <Group gap="sm" wrap="nowrap">
            <Badge
              color={connectionStatus === 'success' ? 'green' : connectionStatus === 'failed' ? 'red' : 'gray'}
              variant="light"
            >
              {connectionStatus === 'success' ? 'Connected' : connectionStatus === 'failed' ? 'Disconnected' : 'Not Tested'}
            </Badge>
            <Switch label="Enabled" checked={enabled} onChange={(e) => setEnabled(e.currentTarget.checked)} />
          </Group>
        </Group>
      </Paper>

      <Paper p="md" withBorder>
        <Text fw={600} mb="md">Provider</Text>
        <Select
          label="Provider"
          data={AI_PROVIDER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          value={provider}
          onChange={(v) => {
            const next = (v as AIProvider) || 'RULE_ENGINE';
            setProvider(next);
            setModel((PROVIDER_MODEL_OPTIONS[next as Exclude<AIProvider, 'RULE_ENGINE'>] ?? [])[0] ?? '');
            setConnectionStatus('idle');
          }}
          mb="md"
        />
        {providerMeta && (
          <Text size="xs" c="dimmed" mb="lg">
            {providerMeta.description}
            {provider === 'GEMINI' && (
              <>
                {' '}·{' '}
                <Anchor href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" size="xs">
                  aistudio.google.com/apikey
                </Anchor>
              </>
            )}
          </Text>
        )}

        {provider !== 'RULE_ENGINE' && (
          <Stack gap="md">
            {provider === 'OLLAMA' ? (
              <TextInput label="Host" value={host} onChange={(e) => setHost(e.currentTarget.value)} placeholder={OLLAMA_DEFAULT_HOST} />
            ) : (
              <PasswordInput
                label="API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.currentTarget.value)}
                placeholder={apiKeyConfigured ? 'Tersimpan •••••••• (kosongkan untuk mempertahankan)' : 'Masukkan API Key'}
              />
            )}

            {modelOptions.length > 0 ? (
              <Select label="Model" data={modelOptions} value={model} onChange={(v) => setModel(v ?? '')} searchable />
            ) : (
              <TextInput label="Model" value={model} onChange={(e) => setModel(e.currentTarget.value)} placeholder="Nama model" />
            )}

            <Group gap="md" align="flex-start">
              <NumberInput
                label="Temperature"
                value={temperature ?? 0}
                onChange={(v) => setTemperature(typeof v === 'number' ? v : null)}
                min={0}
                max={2}
                step={0.1}
                decimalScale={1}
                style={{ flex: 1 }}
              />
              <NumberInput
                label="Max Tokens"
                value={maxTokens ?? 0}
                onChange={(v) => setMaxTokens(typeof v === 'number' && v > 0 ? v : null)}
                min={1}
                step={64}
                style={{ flex: 1 }}
              />
            </Group>

            {apiKeyConfigured && !apiKey && (
              <Badge variant="light" color="blue" size="sm">API Key tersimpan &amp; terenkripsi</Badge>
            )}
          </Stack>
        )}

        <Group mt="lg">
          <Button
            leftSection={<IconPlugConnected size={16} />}
            variant="light"
            loading={testConn.isPending}
            disabled={provider === 'RULE_ENGINE'}
            onClick={handleTestConnection}
          >
            Test Connection
          </Button>
          <Button leftSection={<IconDeviceFloppy size={16} />} loading={save.isPending} onClick={handleSave}>
            Save
          </Button>
        </Group>
      </Paper>
    </Stack>
  );
}
