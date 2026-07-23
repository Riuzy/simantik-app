"use client";

import { NavLink } from "@mantine/core";
import {
  IconDashboard,
  IconFolder,
  IconClipboardList,
  IconPlayerPlay,
  IconCheckbox,
  IconChartBar,
  IconSettings,
} from "@tabler/icons-react";

export default function AppSidebar() {
  const items = [
    { label: "Dashboard", icon: IconDashboard },
    { label: "Projects", icon: IconFolder },
    { label: "Test Cases", icon: IconClipboardList },
    { label: "Test Runs", icon: IconPlayerPlay },
    { label: "Executions", icon: IconCheckbox },
    { label: "Reports", icon: IconChartBar },
    { label: "Settings", icon: IconSettings },
  ];

  return (
    <>
      {items.map((item) => (
        <NavLink key={item.label} label={item.label} leftSection={<item.icon size={20} />} />
      ))}
    </>
  );
}
