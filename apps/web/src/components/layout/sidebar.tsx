'use client';

import { ScrollArea, NavLink, Text, Box } from '@mantine/core';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../stores/auth-store';
import { getNavigation, type NavSection, type NavItem } from '../../constants/navigation';

function NavItemEl({ item }: { item: NavItem }) {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = item.route ? pathname === item.route || pathname.startsWith(item.route + '/') : false;
  const Icon = item.icon;

  return (
    <NavLink
      label={item.label}
      leftSection={Icon ? <Icon size={18} stroke={1.5} /> : undefined}
      active={isActive}
      onClick={() => { if (item.route) router.push(item.route); }}
      styles={{ root: { borderRadius: 8, marginBottom: 2 } }}
      variant="light"
    />
  );
}

function NavGroup({ section }: { section: NavSection }) {
  if (section.items.length === 0) return null;
  return (
    <Box mb="md">
      <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="md" mb={4}>{section.title}</Text>
      {section.items.map((item, i) => <NavItemEl key={i} item={item} />)}
    </Box>
  );
}

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const sections = getNavigation(user?.role?.name);

  return (
    <ScrollArea h="calc(100vh - 60px)" offsetScrollbars>
      <Box py="md" px="xs">
        {sections.map((section, i) => <NavGroup key={i} section={section} />)}
      </Box>
    </ScrollArea>
  );
}
