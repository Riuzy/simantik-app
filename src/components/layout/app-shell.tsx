'use client';

import { AppShell, Burger, Group, TextInput, Title, ActionIcon, useMantineColorScheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch, IconMoon, IconSun } from '@tabler/icons-react';
import { Sidebar } from './sidebar';
import { UserMenu } from './user-menu';
import { Breadcrumb } from './breadcrumb';

export function Shell({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 260, breakpoint: 'md', collapsed: { mobile: !opened } }}
      padding="lg"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" />
            <Title order={4}>SIMANTIK</Title>
          </Group>
          <Group gap="sm">
            <TextInput placeholder="Search..." leftSection={<IconSearch size={16} />} size="sm" w={{ sm: 200, md: 300 }} visibleFrom="sm" />
            <ActionIcon variant="subtle" onClick={toggleColorScheme} aria-label="Toggle theme">
              {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
            </ActionIcon>
            <UserMenu />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        <Sidebar />
      </AppShell.Navbar>

      <AppShell.Main>
        <Breadcrumb />
        <div style={{ marginTop: 16 }}>{children}</div>
      </AppShell.Main>
    </AppShell>
  );
}
