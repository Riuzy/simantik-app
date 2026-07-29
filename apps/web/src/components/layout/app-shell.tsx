'use client';

import {
  Group, ActionIcon, Title, TextInput, useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconMenu2, IconSearch, IconMoon, IconSun,
} from '@tabler/icons-react';
import { Drawer } from '@mantine/core';
import { Breadcrumb } from './breadcrumb';
import { UserMenu } from './user-menu';
import { Sidebar } from './sidebar';

export function AppHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Group h="100%" px="md" justify="space-between" wrap="nowrap">
      <Group gap="sm" wrap="nowrap">
        <ActionIcon variant="subtle" onClick={onMenuClick} aria-label="Toggle sidebar">
          <IconMenu2 size={20} />
        </ActionIcon>
        <Title order={4}>SIMANTIK</Title>
      </Group>

      <Group gap="sm" wrap="nowrap" visibleFrom="sm">
        <TextInput
          placeholder="Search..."
          leftSection={<IconSearch size={16} />}
          size="sm"
          w={300}
        />
      </Group>

      <Group gap="xs" wrap="nowrap">
        <ActionIcon variant="subtle" onClick={toggleColorScheme} aria-label="Toggle theme">
          {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
        </ActionIcon>
        <UserMenu />
      </Group>
    </Group>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [, { close: closeSidebar }] = useDisclosure(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Drawer opened={false} onClose={closeSidebar} size={280} padding={0} title="Navigation">
        <Sidebar />
      </Drawer>

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', flex: 1 }}>
        <header
          style={{
            height: 60,
            borderBottom: '1px solid var(--mantine-color-default-border)',
            background: 'var(--mantine-color-body)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <AppHeader onMenuClick={() => {}} />
        </header>

        <div style={{ padding: '8px 16px 0', borderBottom: '1px solid var(--mantine-color-default-border)' }}>
          <Breadcrumb />
        </div>

        <main style={{ flex: 1, padding: 24, overflow: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
