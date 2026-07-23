"use client";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import { theme } from "@/theme/theme";

interface MantineAppProviderProps {
  children: React.ReactNode;
}

export default function MantineAppProvider({
  children,
}: MantineAppProviderProps) {
  return (
    <MantineProvider theme={theme}>
      <Notifications />
      {children}
    </MantineProvider>
  );
}
