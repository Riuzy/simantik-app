'use client';

import { Container, SimpleGrid, Paper, Group, Title, Text } from '@mantine/core';
import { IconUsers, IconBug, IconTestPipe, IconFolder } from '@tabler/icons-react';

function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <Group justify="space-between" mb="lg">
      <div>
        <Title order={2}>{title}</Title>
        {description && <Text c="dimmed" size="sm">{description}</Text>}
      </div>
      {actions && <Group gap="sm">{actions}</Group>}
    </Group>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon?: React.ReactNode; color?: string }) {
  return (
    <Paper p="md" radius="md" withBorder>
      <Group justify="space-between">
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>{title}</Text>
          <Text size="xxl" fw={700} mt={4}>{value}</Text>
        </div>
        {icon && <div style={{ color: `var(--mantine-color-${color || 'blue'}-6)` }}>{icon}</div>}
      </Group>
    </Paper>
  );
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <Paper p="lg" radius="md" shadow="sm" withBorder mb="md">
      {title && <Title order={4} mb="md">{title}</Title>}
      {children}
    </Paper>
  );
}

export default function DashboardPage() {
  return (
    <Container size="xl" py="md">
      <PageHeader title="Dashboard" description="Overview of your workspace" />

      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mb="lg">
        <StatCard title="Total Projects" value="0" icon={<IconFolder size={24} />} color="blue" />
        <StatCard title="Total Users" value="0" icon={<IconUsers size={24} />} color="green" />
        <StatCard title="Test Cases" value="0" icon={<IconTestPipe size={24} />} color="violet" />
        <StatCard title="Active Bugs" value="0" icon={<IconBug size={24} />} color="red" />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Section title="Recent Projects">
          <Text c="dimmed" size="sm">No projects yet. Create your first project to get started.</Text>
        </Section>
        <Section title="Recent Bugs">
          <Text c="dimmed" size="sm">No bug reports yet.</Text>
        </Section>
      </SimpleGrid>
    </Container>
  );
}
