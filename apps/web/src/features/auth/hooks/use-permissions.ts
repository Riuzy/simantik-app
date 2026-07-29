import { useAuthStore } from '../../../stores/auth-store';
import { ROLE_HIERARCHY, ROLE_PERMISSIONS, NAVIGATION_PERMISSIONS, UserRole } from '../../../constants/permissions';

export function useRole() {
  const user = useAuthStore((s) => s.user);

  const roleName = user?.role?.name;

  const isManager = roleName === UserRole.MANAGER;
  const isDeveloper = roleName === UserRole.DEVELOPER;
  const isTester = roleName === UserRole.TESTER;

  const hasRole = (...roles: string[]) => {
    if (!roleName) return false;
    return roles.includes(roleName);
  };

  const roleLevel = roleName ? ROLE_HIERARCHY[roleName] ?? 0 : 0;

  const hasRoleLevel = (minLevel: number) => roleLevel >= minLevel;

  return { roleName, isManager, isDeveloper, isTester, hasRole, hasRoleLevel, roleLevel };
}

export function usePermission() {
  const user = useAuthStore((s) => s.user);
  const roleName = user?.role?.name;

  const permissions = roleName ? (ROLE_PERMISSIONS[roleName] ?? []) : [];

  const hasPermission = (...required: string[]) => {
    if (roleName === UserRole.MANAGER) return true;
    return required.every((p) => permissions.includes(p));
  };

  const canAccessRoute = (path: string) => {
    if (roleName === UserRole.MANAGER) return true;
    const required = NAVIGATION_PERMISSIONS[path];
    if (!required || required.length === 0) return true;
    return hasPermission(...required);
  };

  return { hasPermission, canAccessRoute, permissions, roleName };
}
