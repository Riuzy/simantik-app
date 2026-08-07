'use client';

import { Center, Loader, Stack, Paper, Group, Text, Badge, SimpleGrid } from '@mantine/core';
import { IconPlugConnected } from '@tabler/icons-react';
import { useAISettings } from '../hooks';
import { AIProvider } from '../types';

const PROVIDER_LABELS: Record<AIProvider, string> = {
  RULE_ENGINE: 'Built-in Template',
  GEMINI: 'Google Gemini',
  OPENROUTER: 'OpenRouter',
  OPENAI: 'OpenAI',
  OLLAMA: 'Ollama',
  CUSTOM: 'Custom API',
};

export function AIConnectionStatus() {
  const { data: settings, isLoading } = useAISettings();

  if (isLoading) {
    return (
      <Center h={120}>
        <Loader size="sm" />
      </Center>
    );
  }

  const status = settings?.connectionStatus;
  const testedAt = settings?.connectionTestedAt;

  return (
    <Paper p="lg" withBorder>
      <Group gap="sm" mb="lg" align="flex-start" wrap="nowrap">
        <IconPlugConnected size={20} style={{ color: 'var(--mantine-color-dimmed)', marginTop: 2 }} />
        <div>
          <Text fw={600}>Connection Status</Text>
          <Text size="sm" c="dimmed">
            Read-only information about the last verified AI provider connection.
          </Text>
        </div>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Stack gap={4}>
          <Text size="xs" c="dimmed">
            Status
          </Text>
          <Badge color={status === 'connected' ? 'green' : status === 'failed' ? 'red' : 'gray'} size="lg">
            {status === 'connected' ? 'Connected' : status === 'failed' ? 'Disconnected' : 'Not Tested'}
          </Badge>
        </Stack>
        <Stack gap={4}>
          <Text size="xs" c="dimmed">
            Provider
          </Text>
          <Text size="sm" fw={500}>
            {settings ? PROVIDER_LABELS[settings.provider] ?? settings.provider : '\u2014'}
          </Text>
        </Stack>
        <Stack gap={4}>
          <Text size="xs" c="dimmed">
            Current Model
          </Text>
          <Text size="sm" fw={500}>
            {settings?.model || '\u2014'}
          </Text>
        </Stack>
        <Stack gap={4}>
          <Text size="xs" c="dimmed">
            Last Tested
          </Text>
          <Text size="sm" fw={500}>
            {testedAt ? new Date(testedAt).toLocaleString() : 'Never'}
          </Text>
        </Stack>
      </SimpleGrid>

      {settings?.connectionMessage && (
        <Text size="xs" c="dimmed" mt="md">
          {settings.connectionMessage}
        </Text>
      )}
    </Paper>
  );
}