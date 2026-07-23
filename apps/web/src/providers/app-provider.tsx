"use client";

import MantineAppProvider from "./mantine-provider";
import QueryProvider from "./query-provider";

interface AppProviderProps {
  children: React.ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  return (
    <QueryProvider>
      <MantineAppProvider>{children}</MantineAppProvider>
    </QueryProvider>
  );
}
