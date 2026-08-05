'use client';

import {
  Group, Avatar, Text, Menu, UnstyledButton,
} from '@mantine/core';
import {
  IconUserCircle, IconSettings, IconLogout, IconChevronDown,
} from '@tabler/icons-react';
import { useAuthStore } from '../../stores/auth-store';
import { useLogout } from '../../features/auth/hooks/use-auth';
import { ROUTES } from '../../constants/routes';
import { useRouter } from 'next/navigation';

export function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const logoutMutation = useLogout();
  const router = useRouter();

  if (!user) return null;

  const initials = user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <UnstyledButton aria-label="User menu">
          <Group gap="xs">
            <Avatar src={user.avatar} alt={user.name} radius="xl" size="sm" color="blue">
              {initials}
            </Avatar>
            <IconChevronDown size={14} />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
          <Text size="sm" fw={500}>{user.name}</Text>
          <Text size="xs" c="dimmed">{user.email}</Text>
        </Menu.Label>
        <Menu.Divider />
        <Menu.Item leftSection={<IconUserCircle size={16} />} onClick={() => router.push(ROUTES.PROFILE)}>
          Profile
        </Menu.Item>
        <Menu.Item leftSection={<IconSettings size={16} />} onClick={() => router.push(ROUTES.SETTINGS)}>
          Settings
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item leftSection={<IconLogout size={16} />} color="red" onClick={() => logoutMutation.mutate()}>
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
