'use client';

import { useState } from 'react';
import {
  ScrollArea, NavLink, Text, Box,
} from '@mantine/core';
import { useRouter, usePathname } from 'next/navigation';
import { IconChevronRight } from '@tabler/icons-react';
import { useAuthStore } from '../../stores/auth-store';
import { usePermission } from '../../features/auth/hooks/use-permissions';
import { getNavigation, type NavItem, type NavSection } from '../../constants/navigation';

function NavLinkItem({ item, depth = 0, onNavigate }: { item: NavItem; depth?: number; onNavigate?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { hasPermission } = usePermission();
  const [opened, setOpened] = useState(false);

  if (item.permissions && item.permissions.length > 0 && !hasPermission(...item.permissions)) {
    return null;
  }

  const isActive = item.route ? pathname === item.route || pathname.startsWith(item.route + '/') : false;
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      setOpened(!opened);
    } else if (item.route) {
      router.push(item.route);
      onNavigate?.();
    }
  };

  return (
    <>
      <NavLink
        label={item.label}
        leftSection={item.icon ? <item.icon size={18} stroke={1.5} /> : undefined}
        rightSection={
          hasChildren ? (
            <IconChevronRight size={14} style={{ transform: opened ? 'rotate(90deg)' : undefined, transition: 'transform 0.2s' }} />
          ) : undefined
        }
        active={isActive}
        onClick={handleClick}
        pl={depth * 16 + 8}
        styles={{ root: { borderRadius: 8 } }}
        childrenOffset={0}
      />
      {hasChildren && (
        <Box ml={16} style={{ display: opened ? 'block' : 'none' }}>
          {item.children!.map((child, i) => (
            <NavLinkItem key={i} item={child} depth={depth + 1} onNavigate={onNavigate} />
          ))}
        </Box>
      )}
    </>
  );
}

function NavSectionGroup({ section }: { section: NavSection }) {
const visibleItems = section.items.filter((item) => {
    if (!item.permissions || item.permissions.length === 0) return true;
    return true;
  });

  if (visibleItems.length === 0) return null;

  return (
    <Box mb="xs">
      <Text size="xs" fw={600} c="dimmed" tt="uppercase" px="md" mb={4}>
        {section.title}
      </Text>
      {visibleItems.map((item, i) => (
        <NavLinkItem key={i} item={item} />
      ))}
    </Box>
  );
}

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const sections = getNavigation(user?.role?.name);

  return (
    <ScrollArea h="calc(100vh - 60px)" offsetScrollbars>
      <Box py="xs">
        {sections.map((section, i) => (
          <NavSectionGroup key={i} section={section} />
        ))}
      </Box>
    </ScrollArea>
  );
}