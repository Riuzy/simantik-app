import {
  IconLayoutDashboard, IconFolder, IconTestPipe, IconRocket, IconBug,
  IconBell, IconUsers, IconSettings, IconUserCircle,
} from '@tabler/icons-react';
import { Permission } from './permissions';
import { ROUTES } from './routes';

export interface NavItem {
  label: string;
  icon?: React.ComponentType<{ size?: number; stroke?: number }>;
  route?: string;
  permissions?: string[];
  children?: NavItem[];
  badge?: 'beta' | 'new' | number;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export function getNavigation(role?: string): NavSection[] {
  const sections: NavSection[] = [
    {
      title: 'General',
      items: [
        { label: 'Dashboard', icon: IconLayoutDashboard, route: ROUTES.DASHBOARD, permissions: [] },
      ],
    },
    {
      title: 'Workspace',
      items: [
        { label: 'Projects', icon: IconFolder, route: ROUTES.PROJECTS, permissions: [Permission.PROJECTS_READ] },
        { label: 'Test Cases', icon: IconTestPipe, route: ROUTES.TEST_CASES, permissions: [Permission.TEST_CASES_READ] },
        { label: 'Test Runs', icon: IconRocket, route: ROUTES.TEST_RUNS, permissions: [Permission.TEST_RUNS_READ] },
        { label: 'Executions', icon: IconRocket, route: ROUTES.EXECUTIONS, permissions: [Permission.EXECUTIONS_READ] },
      ],
    },
    {
      title: 'Quality',
      items: [
        { label: 'Bug Reports', icon: IconBug, route: ROUTES.BUGS, permissions: [Permission.BUGS_READ] },
        { label: 'Notifications', icon: IconBell, route: ROUTES.NOTIFICATIONS, permissions: [Permission.NOTIFICATIONS_READ] },
      ],
    },
  ];

  if (role === 'Manager') {
    sections.push({
      title: 'Administration',
      items: [
        { label: 'Users', icon: IconUsers, route: ROUTES.USERS, permissions: [Permission.USERS_READ] },
        { label: 'Settings', icon: IconSettings, route: ROUTES.SETTINGS },
      ],
    });
  }

  sections.push({
    title: 'Account',
    items: [
      { label: 'Profile', icon: IconUserCircle, route: ROUTES.PROFILE },
    ],
  });

  return sections;
}

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/test-cases': 'Test Cases',
  '/test-runs': 'Test Runs',
  '/executions': 'Executions',
  '/bugs': 'Bug Reports',
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
  return segments[segments.length - 1] || 'Home';
}

export function getBreadcrumbs(path: string): Array<{ label: string; href?: string }> {
  const cleanPath = path.split('?')[0].replace(/\/$/, '');
  const segments = cleanPath.split('/').filter(Boolean);
  const crumbs: Array<{ label: string; href?: string }> = [{ label: 'Home', href: ROUTES.DASHBOARD }];

  let current = '';
  for (const segment of segments) {
    current += '/' + segment;
    if (current === cleanPath) {
      crumbs.push({ label: getRouteLabel(current) });
    } else {
      crumbs.push({ label: getRouteLabel(current) || segment, href: current });
    }
  }

  return crumbs;
}
