'use client';

import { Container, Title, Text, Group, Tabs, Stack } from '@mantine/core';
import {
  IconSettings, IconUserCircle, IconPalette, IconBell, IconRobot, IconInfoCircle,
} from '@tabler/icons-react';
import { ProfileSettings } from '../../../features/auth/components/profile-settings';
import { GeneralSettings } from '../../../features/settings/components/general-settings';
import { AppearanceSettings } from '../../../features/settings/components/appearance-settings';
import { NotificationSettings } from '../../../features/settings/components/notification-settings';
import { AboutSettings } from '../../../features/settings/components/about-settings';
import { AIIntegrationForm } from '../../../features/ai/components/ai-integration-form';
import { AIConnectionStatus } from '../../../features/ai/components/ai-connection-status';
import { PromptTemplatesEditor } from '../../../features/ai/components/prompt-templates-editor';

export default function SettingsPage() {
  return (
    <Container size="lg" py="md">
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>Settings</Title>
          <Text c="dimmed" size="sm">
            Manage application and account settings.
          </Text>
        </div>
      </Group>

      <Tabs defaultValue="general">
        <Tabs.List mb="md">
          <Tabs.Tab value="general" leftSection={<IconSettings size={16} />}>
            General
          </Tabs.Tab>
          <Tabs.Tab value="profile" leftSection={<IconUserCircle size={16} />}>
            Profile
          </Tabs.Tab>
          <Tabs.Tab value="appearance" leftSection={<IconPalette size={16} />}>
            Appearance
          </Tabs.Tab>
          <Tabs.Tab value="ai" leftSection={<IconRobot size={16} />}>
            AI Integration
          </Tabs.Tab>
          <Tabs.Tab value="notifications" leftSection={<IconBell size={16} />}>
            Notifications
          </Tabs.Tab>
          <Tabs.Tab value="about" leftSection={<IconInfoCircle size={16} />}>
            About
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="general">
          <GeneralSettings />
        </Tabs.Panel>
        <Tabs.Panel value="profile">
          <ProfileSettings />
        </Tabs.Panel>
        <Tabs.Panel value="appearance">
          <AppearanceSettings />
        </Tabs.Panel>
        <Tabs.Panel value="ai">
          <Stack gap="md">
            <AIIntegrationForm />
            <AIConnectionStatus />
            <PromptTemplatesEditor />
          </Stack>
        </Tabs.Panel>
        <Tabs.Panel value="notifications">
          <NotificationSettings />
        </Tabs.Panel>
        <Tabs.Panel value="about">
          <AboutSettings />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}