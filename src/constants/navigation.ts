import {
  IconLayoutDashboard,
  IconFolder,
  IconClipboardList,
  IconPlayerPlay,
  IconCheckbox,
  IconChartBar,
  IconUserCircle,
  IconSettings,
} from '@tabler/icons-react';
import { ROUTES } from './routes';

export interface NavItem {
  label: string;
  icon: React.ComponentType<{ size?: number; stroke?: number }>;
  route: string;
}

export const NAVIGATION: NavItem[] = [
  { label: 'Dashboard', icon: IconLayoutDashboard, route: ROUTES.DASHBOARD },
  { label: 'Projects', icon: IconFolder, route: ROUTES.PROJECTS },
  { label: 'Test Cases', icon: IconClipboardList, route: ROUTES.TEST_CASES },
  { label: 'Automation', icon: IconPlayerPlay, route: ROUTES.AUTOMATION },
  { label: 'Executions', icon: IconCheckbox, route: ROUTES.EXECUTIONS },
  { label: 'Reports', icon: IconChartBar, route: ROUTES.REPORTS },
  { label: 'Profile', icon: IconUserCircle, route: ROUTES.PROFILE },
  { label: 'Settings', icon: IconSettings, route: ROUTES.SETTINGS },
];

export const routeLabels: Record<string, string> = {
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.PROJECTS]: 'Projects',
  [ROUTES.TEST_CASES]: 'Test Cases',
  [ROUTES.AUTOMATION]: 'Automation',
  [ROUTES.EXECUTIONS]: 'Executions',
  [ROUTES.REPORTS]: 'Reports',
  [ROUTES.PROFILE]: 'Profile',
  [ROUTES.SETTINGS]: 'Settings',
};

export function getRouteLabel(path: string): string {
  const cleanPath = path.split('?')[0].replace(/\/$/, '');
  if (routeLabels[cleanPath]) return routeLabels[cleanPath];
  const segments = cleanPath.split('/').filter(Boolean);
  if (segments.length >= 2) {
    const parent = routeLabels['/' + segments[0]];
    if (parent) return `${parent} / ${segments[segments.length - 1]}`;
  }
  return segments.at(-1) || 'Home';
}

export function getBreadcrumbs(path: string): Array<{ label: string; href?: string }> {
  if (path === '/dashboard') return [{ label: 'Dashboard' }];
  const cleanPath = path.split('?')[0].replace(/\/$/, '');
  const segments = cleanPath.split('/').filter(Boolean);
  const crumbs: Array<{ label: string; href?: string }> = [{ label: 'Home', href: '/dashboard' }];
  let current = '';
  for (const segment of segments) {
    current += '/' + segment;
    crumbs.push(current === cleanPath
      ? { label: getRouteLabel(current) }
      : { label: getRouteLabel(current) || segment, href: current });
  }
  return crumbs;
}
