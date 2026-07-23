import AppLayout from "@/components/layout/app-shell";

interface AppLayoutWrapperProps {
  children: React.ReactNode;
}

export default function AppLayoutWrapper({ children }: AppLayoutWrapperProps) {
  return <AppLayout>{children}</AppLayout>;
}
