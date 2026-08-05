'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Container, Paper, Title, Text, Group, Tabs, Badge, TextInput, Button, Table, Stack, Loader, Center,
  Avatar, SimpleGrid, SegmentedControl, Switch, Box, Divider, useMantineColorScheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconUserCircle, IconBell, IconPalette, IconRobot, IconSettings, IconInfoCircle, IconDeviceFloppy,
} from '@tabler/icons-react';
import { useSettings, useUpsertSetting, useDeleteSetting } from '../../../features/settings/hooks';
import { useCurrentUser, useChangePassword, useUpdateProfile } from '../../../features/auth/hooks/use-auth';
import { AIIntegrationForm } from '../../../features/ai/components/ai-integration-form';
import { PromptTemplatesEditor } from '../../../features/ai/components/prompt-templates-editor';

function GeneralTab() {
  const { data: settings, isLoading } = useSettings();
  const upsert = useUpsertSetting();
  const remove = useDeleteSetting();

  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  if (isLoading) return <Center h={200}><Loader /></Center>;

  const handleAdd = () => {
    if (!newKey.trim()) return;
    upsert.mutate({ key: newKey.trim(), value: newValue.trim() });
    setNewKey('');
    setNewValue('');
  };

  return (
    <Stack gap="md">
      <Paper p="md" withBorder>
        <Title order={4} mb="sm">Add Setting</Title>
        <Group gap="md" align="flex-end">
          <TextInput
            label="Key"
            placeholder="e.g. app.name"
            value={newKey}
            onChange={(e) => setNewKey(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <TextInput
            label="Value"
            placeholder="e.g. SIMANTIK"
            value={newValue}
            onChange={(e) => setNewValue(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <Button onClick={handleAdd} loading={upsert.isPending}>Save</Button>
        </Group>
      </Paper>

      <Paper p="md" withBorder>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Key</Table.Th>
              <Table.Th>Value</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {!settings || settings.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={3}><Text c="dimmed" ta="center" py="xl">No settings yet</Text></Table.Td>
              </Table.Tr>
            ) : (
              settings.map((setting) => (
                <Table.Tr key={setting.id}>
                  <Table.Td><Badge variant="light" ff="monospace">{setting.key}</Badge></Table.Td>
                  <Table.Td>{String(setting.value)}</Table.Td>
                  <Table.Td>
                    <Button size="xs" variant="light" color="red" onClick={() => remove.mutate(setting.key)}>
                      Delete
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}

function ProfileTab() {
  const { data: user, isLoading } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const profileForm = useForm({
    initialValues: {
      name: '',
      email: '',
      avatar: '',
    },
    validate: {
      name: (v: string) => (v.trim().length < 2 ? 'Name must be at least 2 characters' : null),
      email: (v: string) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Invalid email'),
    },
  });

  const passwordForm = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      currentPassword: (v: string) => (v.trim().length < 6 ? 'Current password required' : null),
      newPassword: (v: string) => (v.length < 8 ? 'Password must be at least 8 characters' : null),
      confirmPassword: (v: string, values) =>
        v !== values.newPassword ? 'Passwords do not match' : null,
    },
  });

  const hydratedRef = useRef(false);

  useEffect(() => {
    if (user && !hydratedRef.current) {
      profileForm.setValues({ name: user.name, email: user.email, avatar: user.avatar ?? '' });
      hydratedRef.current = true;
    }
  }, [user, profileForm]);

  if (isLoading) return <Center h={200}><Loader /></Center>;
  if (!user) return <Center h={200}><Text c="dimmed">Not signed in</Text></Center>;

  const handleProfileSubmit = (values: typeof profileForm.values) => {
    updateProfile.mutate({
      name: values.name,
      email: values.email,
      avatar: values.avatar.trim() || null,
    });
  };

  const handlePasswordSubmit = (values: typeof passwordForm.values) => {
    changePassword.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  };

  return (
    <Stack gap="md">
      <Paper p="lg" withBorder>
        <Group gap="lg">
          <Avatar src={user.avatar} size={80} radius="xl" color="blue">
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Title order={3}>{user.name}</Title>
            <Text c="dimmed">{user.email}</Text>
          </div>
        </Group>

        <SimpleGrid cols={{ base: 1, md: 3 }} mt="lg">
          <Paper p="md" withBorder>
            <Text size="xs" c="dimmed">Account Status</Text>
            <Text size="sm">{user.isActive ? 'Active' : 'Inactive'}</Text>
          </Paper>
          <Paper p="md" withBorder>
            <Text size="xs" c="dimmed">Last Login</Text>
            <Text size="sm">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '\u2014'}</Text>
          </Paper>
          <Paper p="md" withBorder>
            <Text size="xs" c="dimmed">Member Since</Text>
            <Text size="sm">{new Date(user.createdAt).toLocaleString()}</Text>
          </Paper>
        </SimpleGrid>
      </Paper>

      <Paper p="lg" withBorder>
        <Title order={4} mb="md">Edit Profile</Title>
        <form onSubmit={profileForm.onSubmit(handleProfileSubmit)}>
          <Stack gap="md" maw={480}>
            <TextInput label="Name" placeholder="Full name" {...profileForm.getInputProps('name')} />
            <TextInput label="Email" placeholder="you@example.com" {...profileForm.getInputProps('email')} />
            <TextInput label="Avatar URL" placeholder="https://example.com/avatar.png" {...profileForm.getInputProps('avatar')} />
            <Box>
              <Button type="submit" leftSection={<IconDeviceFloppy size={16} />} loading={updateProfile.isPending}>
                Save
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>

      <Paper p="lg" withBorder>
        <Title order={4} mb="md">Change Password</Title>
        <form onSubmit={passwordForm.onSubmit(handlePasswordSubmit)}>
          <Stack gap="md" maw={480}>
            <TextInput label="Current Password" type="password" {...passwordForm.getInputProps('currentPassword')} />
            <TextInput label="New Password" type="password" {...passwordForm.getInputProps('newPassword')} />
            <TextInput label="Confirm New Password" type="password" {...passwordForm.getInputProps('confirmPassword')} />
            <Box>
              <Button type="submit" loading={changePassword.isPending}>Change Password</Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}

function AppearanceTab() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  return (
    <Paper p="lg" withBorder maw={560}>
      <Title order={4} mb="md">Theme</Title>
      <Text size="sm" c="dimmed" mb="md">Pilih skema warna untuk antarmuka SIMANTIK.</Text>
      <SegmentedControl
        value={colorScheme}
        onChange={(v) => setColorScheme(v as 'light' | 'dark' | 'auto')}
        data={[
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
          { label: 'Auto', value: 'auto' },
        ]}
      />
    </Paper>
  );
}

function NotificationsTab() {
  const { data: settings, isLoading } = useSettings();
  const upsert = useUpsertSetting();

  const getValue = (key: string, fallback: boolean) => {
    const row = settings?.find((s) => s.key === key);
    if (row === undefined) return fallback;
    return String(row.value) === 'true';
  };

  const toggle = (key: string, checked: boolean) => {
    upsert.mutate({ key, value: checked });
  };

  if (isLoading) return <Center h={200}><Loader /></Center>;

  return (
    <Paper p="lg" withBorder maw={560}>
      <Title order={4} mb="md">Notifications</Title>
      <Text size="sm" c="dimmed" mb="lg">Atur notifikasi yang ingin kamu terima.</Text>
      <Stack gap="lg">
        <Group justify="space-between" wrap="nowrap">
          <Box>
            <Text size="sm" fw={500}>Email Notifications</Text>
            <Text size="xs" c="dimmed">Kirim ringkasan melalui email.</Text>
          </Box>
          <Switch checked={getValue('notifications.email.enabled', true)} onChange={(e) => toggle('notifications.email.enabled', e.currentTarget.checked)} />
        </Group>
        <Divider />
        <Group justify="space-between" wrap="nowrap">
          <Box>
            <Text size="sm" fw={500}>Execution Results</Text>
            <Text size="xs" c="dimmed">Beri tahu saat eksekusi test selesai.</Text>
          </Box>
          <Switch checked={getValue('notifications.execution.enabled', true)} onChange={(e) => toggle('notifications.execution.enabled', e.currentTarget.checked)} />
        </Group>
        <Divider />
        <Group justify="space-between" wrap="nowrap">
          <Box>
            <Text size="sm" fw={500}>System Updates</Text>
            <Text size="xs" c="dimmed">Info tentang pembaruan sistem.</Text>
          </Box>
          <Switch checked={getValue('notifications.system.enabled', false)} onChange={(e) => toggle('notifications.system.enabled', e.currentTarget.checked)} />
        </Group>
      </Stack>
    </Paper>
  );
}

function AboutTab() {
  return (
    <Paper p="lg" withBorder maw={560}>
      <Title order={4} mb="md">About SIMANTIK</Title>
      <Stack gap="xs">
        <Group gap="sm">
          <Text size="sm" fw={600} w={130}>Version</Text>
          <Text size="sm">0.1.0</Text>
        </Group>
        <Group gap="sm">
          <Text size="sm" fw={600} w={130}>Framework</Text>
          <Text size="sm">Next.js 16 · React 19 · TypeScript</Text>
        </Group>
        <Group gap="sm">
          <Text size="sm" fw={600} w={130}>Backend</Text>
          <Text size="sm">Express · Prisma · MySQL</Text>
        </Group>
        <Group gap="sm">
          <Text size="sm" fw={600} w={130}>Automation</Text>
          <Text size="sm">Playwright · Page Object Model</Text>
        </Group>
        <Divider my="xs" />
        <Text size="sm" c="dimmed">
          SIMANTIK adalah Software Testing Management System yang dirancang untuk mengelola test case,
          automation script, dan hasil eksekusi dalam satu tempat.
        </Text>
      </Stack>
    </Paper>
  );
}

export default function SettingsPage() {
  return (
    <Container size="lg" py="md">
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>Settings</Title>
          <Text c="dimmed" size="sm">Kelola pengaturan aplikasi dan akun</Text>
        </div>
      </Group>

      <Tabs defaultValue="general">
        <Tabs.List mb="md">
          <Tabs.Tab value="general" leftSection={<IconSettings size={16} />}>General</Tabs.Tab>
          <Tabs.Tab value="profile" leftSection={<IconUserCircle size={16} />}>Profile</Tabs.Tab>
          <Tabs.Tab value="appearance" leftSection={<IconPalette size={16} />}>Appearance</Tabs.Tab>
          <Tabs.Tab value="notifications" leftSection={<IconBell size={16} />}>Notifications</Tabs.Tab>
          <Tabs.Tab value="ai" leftSection={<IconRobot size={16} />}>AI Integration</Tabs.Tab>
          <Tabs.Tab value="about" leftSection={<IconInfoCircle size={16} />}>About</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="general"><GeneralTab /></Tabs.Panel>
        <Tabs.Panel value="profile"><ProfileTab /></Tabs.Panel>
        <Tabs.Panel value="appearance"><AppearanceTab /></Tabs.Panel>
        <Tabs.Panel value="notifications"><NotificationsTab /></Tabs.Panel>
        <Tabs.Panel value="ai">
          <Stack gap="md">
            <AIIntegrationForm />
            <PromptTemplatesEditor />
          </Stack>
        </Tabs.Panel>
        <Tabs.Panel value="about"><AboutTab /></Tabs.Panel>
      </Tabs>
    </Container>
  );
}
