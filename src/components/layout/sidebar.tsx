'use client';

import { ScrollArea, NavLink, Box, Text, Select, Divider, Group, ThemeIcon } from '@mantine/core';
import { useRouter, usePathname } from 'next/navigation';
import { IconFlame } from '@tabler/icons-react';
import { MAIN_NAVIGATION, ACCOUNT_NAVIGATION, getProjectNavigation, getActiveNavKey } from '../../constants/navigation';
import { useProjects } from '../../features/projects/hooks';
import { useProjectStore } from '../../stores/project-store';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text size="xs" tt="uppercase" fw={600} c="dimmed" px="xs" mb={6} mt={12} style={{ letterSpacing: '0.05em' }}>
      {children}
    </Text>
  );
}

function NavItemEl({ label, icon: Icon, route, active }: { label: string; icon: React.ComponentType<{ size?: number; stroke?: number }>; route: string; active: boolean }) {
  const router = useRouter();
  return (
    <NavLink
      label={label}
      leftSection={<Icon size={18} stroke={1.6} />}
      active={active}
      onClick={() => router.push(route)}
      styles={{ root: { borderRadius: 8, marginBottom: 2 } }}
      variant="light"
    />
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: projectsData } = useProjects({ page: 1, limit: 100 });
  const { selectedProject, setSelectedProject } = useProjectStore();

  const activeKey = getActiveNavKey(pathname);

  const projectList = projectsData?.data ?? [];
  const projectOptions = projectList.map((p) => ({ value: p.slug, label: p.name }));

  const handleProjectChange = (slug: string | null) => {
    if (!slug) {
      setSelectedProject(null);
      return;
    }
    const project = projectList.find((p) => p.slug === slug);
    if (!project) return;
    setSelectedProject({ id: project.id, code: project.code, name: project.name, slug: project.slug });
  };

  const projectNav = selectedProject ? getProjectNavigation(selectedProject.slug) : [];

  return (
    <ScrollArea h="calc(100vh - 60px)" offsetScrollbars>
      <Box py="md" px="xs">
        <Group gap="sm" px="xs" mb="md">
          <ThemeIcon size={30} radius="md" variant="light" color="blue">
            <IconFlame size={18} stroke={1.8} />
          </ThemeIcon>
          <Text fw={700} fz="lg" style={{ letterSpacing: '-0.02em' }}>SIMANTIK</Text>
        </Group>

        <SectionLabel>Main</SectionLabel>
        {MAIN_NAVIGATION.map((item) => (
          <NavItemEl
            key={item.key}
            label={item.label}
            icon={item.icon}
            route={item.route}
            active={activeKey === item.key}
          />
        ))}

        <SectionLabel>Project</SectionLabel>
        <Select
          placeholder="Select project"
          data={projectOptions}
          value={selectedProject?.slug ?? null}
          onChange={handleProjectChange}
          searchable
          clearable
          size="sm"
          mb={8}
          styles={{ input: { fontWeight: 600 } }}
        />

        {projectNav.length > 0 && (
          <>
            {projectNav.map((item) => (
              <NavItemEl
                key={item.key}
                label={item.label}
                icon={item.icon}
                route={item.route}
                active={activeKey === item.key}
              />
            ))}
          </>
        )}

        <Divider my="sm" />

        <SectionLabel>Account</SectionLabel>
        {ACCOUNT_NAVIGATION.map((item) => (
          <NavItemEl
            key={item.key}
            label={item.label}
            icon={item.icon}
            route={item.route}
            active={activeKey === item.key}
          />
        ))}
      </Box>
    </ScrollArea>
  );
}
