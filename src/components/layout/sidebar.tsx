'use client';

import { ScrollArea, NavLink, Box } from '@mantine/core';
import { useRouter, usePathname } from 'next/navigation';
import { NAVIGATION, type NavItem } from '../../constants/navigation';

function NavItemEl({ item }: { item: NavItem }) {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = pathname === item.route || pathname.startsWith(item.route + '/');
  const Icon = item.icon;

  return (
    <NavLink
      label={item.label}
      leftSection={<Icon size={18} stroke={1.5} />}
      active={isActive}
      onClick={() => router.push(item.route)}
      styles={{ root: { borderRadius: 8, marginBottom: 2 } }}
      variant="light"
    />
  );
}

export function Sidebar() {
  return (
    <ScrollArea h="calc(100vh - 60px)" offsetScrollbars>
      <Box py="md" px="xs">
        {NAVIGATION.map((item, i) => <NavItemEl key={i} item={item} />)}
      </Box>
    </ScrollArea>
  );
}
