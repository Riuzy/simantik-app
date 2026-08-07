'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Button, Center, Loader, Stack, Group, Switch, Text, SimpleGrid } from '@mantine/core';
import { IconBell, IconDeviceFloppy, IconFlagCheck, IconAlertTriangle, IconRobotOff, IconDeviceDesktop, IconMail } from '@tabler/icons-react';
import { useSettings, useBulkUpsertSetting } from '../hooks';
import { SettingsSection } from './settings-section';

interface NotificationToggle {
  key: 'notifications.executionFinished' | 'notifications.executionFailed' | 'notifications.aiGenerationFailed' | 'notifications.desktop' | 'notifications.email';
  title: string;
  description: string;
  icon: ReactNode;
}

const TOGGLES: NotificationToggle[] = [
  {
    key: 'notifications.executionFinished',
    title: 'Execution Finished',
    description: 'Notify when a test execution completes successfully.',
    icon: <IconFlagCheck size={18} />,
  },
  {
    key: 'notifications.executionFailed',
    title: 'Execution Failed',
    description: 'Notify when a test execution fails.',
    icon: <IconAlertTriangle size={18} />,
  },
  {
    key: 'notifications.aiGenerationFailed',
    title: 'AI Generation Failed',
    description: 'Notify when an AI-generated script fails to be produced.',
    icon: <IconRobotOff size={18} />,
  },
  {
    key: 'notifications.desktop',
    title: 'Desktop Notification',
    description: 'Show browser desktop notifications for events.',
    icon: <IconDeviceDesktop size={18} />,
  },
  {
    key: 'notifications.email',
    title: 'Email Notification',
    description: 'Send email summaries for important events.',
    icon: <IconMail size={18} />,
  },
];

export function NotificationSettings() {
  const { data: settings, isLoading } = useSettings();
  const save = useBulkUpsertSetting();

  const [values, setValues] = useState<Record<string, boolean>>({});

  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!settings || hydratedRef.current) return;
    setValues({
      'notifications.executionFinished': settings['notifications.executionFinished'],
      'notifications.executionFailed': settings['notifications.executionFailed'],
      'notifications.aiGenerationFailed': settings['notifications.aiGenerationFailed'],
      'notifications.desktop': settings['notifications.desktop'],
      'notifications.email': settings['notifications.email'],
    });
    hydratedRef.current = true;
  }, [settings]);

  const payload = useMemo(() => ({ ...values }), [values]);

  const handleSave = () => {
    save.mutate(payload);
  };

  if (isLoading) {
    return <Center h={200}><Loader /></Center>;
  }

  return (
    <Stack gap="md">
      <SettingsSection
        icon={<IconBell size={20} />}
        title="Notifications"
        description="Choose which events trigger a notification."
      >
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          {TOGGLES.map((item) => (
            <Group key={item.key} justify="space-between" wrap="nowrap" gap="sm">
              <Group gap="sm" wrap="nowrap">
                <span style={{ color: 'var(--mantine-color-dimmed)', display: 'flex' }}>{item.icon}</span>
                <div>
                  <Text size="sm" fw={500}>
                    {item.title}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {item.description}
                  </Text>
                </div>
              </Group>
              <Switch
                checked={values[item.key] ?? false}
                onChange={(e) => setValues((prev) => ({ ...prev, [item.key]: e.currentTarget.checked }))}
              />
            </Group>
          ))}
        </SimpleGrid>
      </SettingsSection>

      <Group justify="flex-end">
        <Button leftSection={<IconDeviceFloppy size={16} />} loading={save.isPending} onClick={handleSave}>
          Save Notifications
        </Button>
      </Group>
    </Stack>
  );
}