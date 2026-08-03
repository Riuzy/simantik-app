import {
  IconLayoutDashboard,
  IconFolder,
  IconClipboardList,
  IconPlayerPlay,
  IconCheckbox,
  IconChartBar,
  IconUserCircle,
  IconSettings,
  IconRadar,
} from '@tabler/icons-react';
import { ROUTES } from './routes';

export interface NavItem {
  label: string;
  icon: React.ComponentType<{ size?: number; stroke?: number }>;
  route: string;
}

export const MAIN_NAVIGATION: NavItem[] = [
  { label: 'Dashboard', icon: IconLayoutDashboard, route: ROUTES.DASHBOARD },
  { label: 'Projects', icon: IconFolder, route: ROUTES.PROJECTS },
];

export const ACCOUNT_NAVIGATION: NavItem[] = [
  { label: 'Profile', icon: IconUserCircle, route: ROUTES.PROFILE },
  { label: 'Settings', icon: IconSettings, route: ROUTES.SETTINGS },
];

export function getProjectNavigation(slug: string): NavItem[] {
  return [
    { label: 'Overview', icon: IconRadar, route: ROUTES.PROJECT_OVERVIEW(slug) },
    { label: 'Test Cases', icon: IconClipboardList, route: ROUTES.PROJECT_TEST_CASES(slug) },
    { label: 'Automation', icon: IconPlayerPlay, route: ROUTES.PROJECT_AUTOMATION(slug) },
    { label: 'Executions', icon: IconCheckbox, route: ROUTES.PROJECT_EXECUTIONS(slug) },
    { label: 'Reports', icon: IconChartBar, route: ROUTES.PROJECT_REPORTS(slug) },
  ];
}

export function isProjectRoute(pathname: string): boolean {
  return /^\/projects\/[^/]+(\/(overview|test-cases|automation|executions|reports))?$/.test(pathname);
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
    [ROUTES.PROFILE]: 'Profile',
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
