import {
  IconLayoutDashboard, IconFolder,
  IconBell, IconSettings, IconUserCircle, IconUsers,
} from '@tabler/icons-react';
import { ROUTES } from './routes';

export interface NavItem {
  label: string;
  icon?: React.ComponentType<{ size?: number; stroke?: number }>;
  route?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

const MENUS = {
  dashboard: { label: 'Dashboard', icon: IconLayoutDashboard, route: ROUTES.DASHBOARD },
  projects:  { label: 'Projects', icon: IconFolder, route: ROUTES.PROJECTS },
  myProjects: { label: 'My Projects', icon: IconFolder, route: ROUTES.PROJECTS },
  notifications: { label: 'Notifications', icon: IconBell, route: ROUTES.NOTIFICATIONS },
  users:     { label: 'Users', icon: IconUsers, route: ROUTES.USERS },
  settings:  { label: 'Settings', icon: IconSettings, route: ROUTES.SETTINGS },
  profile:   { label: 'Profile', icon: IconUserCircle, route: ROUTES.PROFILE },
} as const;

const ROLE_MENUS: Record<string, NavSection[]> = {
  Manager: [
    { title: 'General', items: [MENUS.dashboard] },
    { title: 'Workspace', items: [MENUS.projects] },
    { title: 'Quality', items: [MENUS.notifications] },
    { title: 'Administration', items: [MENUS.users, MENUS.settings] },
    { title: 'Account', items: [MENUS.profile] },
  ],
  Developer: [
    { title: 'General', items: [MENUS.dashboard] },
    { title: 'My Workspace', items: [MENUS.myProjects] },
    { title: 'Account', items: [MENUS.profile] },
  ],
  Tester: [
    { title: 'General', items: [MENUS.dashboard] },
    { title: 'Workspace', items: [MENUS.myProjects] },
    { title: 'Quality', items: [MENUS.notifications] },
    { title: 'Account', items: [MENUS.profile] },
  ],
};

export function getNavigation(role?: string): NavSection[] {
  return ROLE_MENUS[role || ''] || ROLE_MENUS.Tester;
}

export const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/notifications': 'Notifications',
  '/users': 'Users',
  '/profile': 'Profile',
  '/settings': 'Settings',
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
