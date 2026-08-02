'use client';

import { Breadcrumbs as MantineBreadcrumbs, Anchor, Text } from '@mantine/core';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { getBreadcrumbs } from '../../constants/navigation';

export function Breadcrumb() {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);

  return (
    <MantineBreadcrumbs separator="→" separatorMargin="xs">
      {crumbs.map((crumb, i) =>
        i < crumbs.length - 1 && crumb.href ? (
          <Anchor component={Link} href={crumb.href} key={i} size="sm" c="dimmed">
            {crumb.label}
          </Anchor>
        ) : (
          <Text key={i} size="sm" fw={500}>
            {crumb.label}
          </Text>
        ),
      )}
    </MantineBreadcrumbs>
  );
}
