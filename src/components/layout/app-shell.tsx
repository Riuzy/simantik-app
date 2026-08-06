'use client';

import { AppShell, Burger, Group, ActionIcon, useMantineColorScheme, Divider, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconMoon, IconSun } from '@tabler/icons-react';
import { Sidebar } from './sidebar';
import { UserMenu } from './user-menu';
import { TopbarSearch } from './topbar-search';
import { NotificationsMenu } from './notifications-menu';
import { Breadcrumb } from './breadcrumb';
import { Brand } from './brand';

export function Shell({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 260, breakpoint: 'md', collapsed: { mobile: !opened } }}
      padding="lg"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="md" wrap="nowrap">
            <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" />
            <Box visibleFrom="sm">
              <Brand showSubtitle={true} />
            </Box>
            <Box hiddenFrom="sm">
              <Brand showSubtitle={false} />
            </Box>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <TopbarSearch />
            <Divider orientation="vertical" mx={4} />
            <NotificationsMenu />
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
        <Box px={{ base: 'sm', sm: 'md' }} pt="md">
          <Breadcrumb />
          <div style={{ marginTop: 16 }}>{children}</div>
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
