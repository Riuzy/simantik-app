import { DashboardLayout } from '../../layouts/dashboard-layout';

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
