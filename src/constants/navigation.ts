import {
  IconLayoutDashboard,
  IconFolder,
  IconClipboardList,
  IconPlayerPlay,
  IconCheckbox,
  IconChartBar,
  IconSettings,
} from '@tabler/icons-react';
import { ROUTES } from './routes';

export type NavKey = 'dashboard' | 'projects' | 'test-cases' | 'automation' | 'executions' | 'reports' | 'settings';

export interface NavItem {
  key: NavKey;
  label: string;
  icon: React.ComponentType<{ size?: number; stroke?: number }>;
  route: string;
}

export const MAIN_NAVIGATION: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: IconLayoutDashboard, route: ROUTES.DASHBOARD },
  { key: 'projects', label: 'Projects', icon: IconFolder, route: ROUTES.PROJECTS },
];

export const ACCOUNT_NAVIGATION: NavItem[] = [
  { key: 'settings', label: 'Settings', icon: IconSettings, route: ROUTES.SETTINGS },
];

export function getProjectNavigation(slug: string): NavItem[] {
  return [
    { key: 'test-cases', label: 'Test Cases', icon: IconClipboardList, route: ROUTES.PROJECT_TEST_CASES(slug) },
    { key: 'automation', label: 'Automation', icon: IconPlayerPlay, route: ROUTES.PROJECT_AUTOMATION(slug) },
    { key: 'executions', label: 'Executions', icon: IconCheckbox, route: ROUTES.PROJECT_EXECUTIONS(slug) },
    { key: 'reports', label: 'Reports', icon: IconChartBar, route: ROUTES.PROJECT_REPORTS(slug) },
  ];
}

export function getActiveNavKey(pathname: string): NavKey | null {
  const path = pathname.split('?')[0].replace(/\/$/, '');

  if (path === ROUTES.DASHBOARD || path.startsWith(ROUTES.DASHBOARD + '/')) return 'dashboard';
  if (path === ROUTES.SETTINGS || path.startsWith(ROUTES.SETTINGS + '/')) return 'settings';
  if (path === ROUTES.PROJECTS || path === ROUTES.PROJECT_CREATE) return 'projects';

  const projectMatch = path.match(/^\/projects\/[^/]+/);
  if (projectMatch) {
    const rest = path.slice(projectMatch[0].length);
    if (rest.startsWith('/test-cases')) return 'test-cases';
    if (rest.startsWith('/automation')) return 'automation';
    if (rest.startsWith('/executions')) return 'executions';
    if (rest.startsWith('/reports')) return 'reports';
    return 'projects';
  }

  return null;
}

export function getRouteLabel(path: string): string {
  const cleanPath = path.split('?')[0].replace(/\/$/, '');
  const segments = cleanPath.split('/').filter(Boolean);

  if (segments.length >= 2 && segments[0] === 'projects') {
    const last = segments[segments.length - 1];
    if (segments.length === 2) return 'Overview';
    if (last === 'edit') return 'Edit Project';
    if (last === 'test-cases') return 'Test Cases';
    if (last === 'automation') return 'Automation';
    if (last === 'executions') return 'Executions';
    if (last === 'reports') return 'Reports';
    if (last === 'create') return 'New Project';
    if (segments.length >= 4 && segments[2] === 'test-cases') return `Test Case ${last}`;
    return last;
  }

  const map: Record<string, string> = {
    [ROUTES.DASHBOARD]: 'Dashboard',
    [ROUTES.PROJECTS]: 'Projects',
    [ROUTES.SETTINGS]: 'Settings',
  };
  if (map[cleanPath]) return map[cleanPath];

  if (cleanPath.startsWith('/executions/')) return 'Execution Detail';
  if (cleanPath === ROUTES.LOGIN) return 'Sign In';
  return segments.at(-1) || 'Home';
}

export function getBreadcrumbs(path: string): Array<{ label: string; href?: string }> {
  const cleanPath = path.split('?')[0].replace(/\/$/, '');
  if (cleanPath === ROUTES.DASHBOARD) return [{ label: 'Dashboard' }];

  const segments = cleanPath.split('/').filter(Boolean);
  const crumbs: Array<{ label: string; href?: string }> = [{ label: 'Home', href: ROUTES.DASHBOARD }];

  if (segments[0] === 'projects' && segments.length >= 2) {
    crumbs.push({ label: 'Projects', href: ROUTES.PROJECTS });
    const slug = segments[1];
    crumbs.push({ label: slug, href: ROUTES.PROJECT_OVERVIEW(slug) });
    if (segments.length > 2) {
      const rest = segments.slice(2);
      let current = ROUTES.PROJECT_OVERVIEW(slug);
      rest.forEach((seg, idx) => {
        current += `/${seg}`;
        crumbs.push({
          label: getRouteLabel(current),
          href: idx === rest.length - 1 ? undefined : current,
        });
      });
    }
    return crumbs;
  }

  if (segments[0] === 'executions' && segments.length === 2) {
    crumbs.push({ label: 'Executions', href: `/projects` });
    crumbs.push({ label: 'Execution Detail' });
    return crumbs;
  }

  let current = '';
  for (const segment of segments) {
    current += '/' + segment;
    crumbs.push(current === cleanPath
      ? { label: getRouteLabel(current) }
      : { label: getRouteLabel(current) || segment, href: current });
  }
  return crumbs;
}
