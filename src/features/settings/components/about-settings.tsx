'use client';

import type { ReactNode } from 'react';
import { Stack, Group, Text, SimpleGrid, Badge, Anchor, Divider, Paper } from '@mantine/core';
import {
  IconTag, IconStack, IconRobot, IconTool, IconCertificate, IconBook, IconBrandGithub, IconInfoCircle,
} from '@tabler/icons-react';

const APP_VERSION = '0.1.0';
const GITHUB_URL = 'https://github.com/Riuzy/simantik-app';
const DOCS_URL = 'https://github.com/Riuzy/simantik-app/tree/main/docs';

export function AboutSettings() {
  return (
    <Stack gap="md">
      <Paper p="lg" withBorder>
        <Group gap="sm" mb="sm" align="flex-start" wrap="nowrap">
          <IconInfoCircle size={20} style={{ color: 'var(--mantine-color-dimmed)' }} />
          <Text fw={600} size="lg">
            About SIMANTIK
          </Text>
        </Group>
        <Text size="sm" c="dimmed">
          SIMANTIK is a modern Software Testing Management System designed to manage test cases,
          automation scripts, and execution results in one place.
        </Text>
      </Paper>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <InfoCard icon={<IconTag size={20} />} label="SIMANTIK Version" value={`v${APP_VERSION}`} />
        <InfoCard icon={<IconCertificate size={20} />} label="Build Version" value={APP_VERSION} />
        <InfoCard icon={<IconStack size={20} />} label="Framework" value="Next.js · React 19 · TypeScript" />
        <InfoCard icon={<IconTool size={20} />} label="Backend" value="Express · Prisma · MySQL" />
        <InfoCard icon={<IconRobot size={20} />} label="Automation" value="Playwright · Page Object Model" />
        <InfoCard icon={<IconCertificate size={20} />} label="License" value="MIT" />
      </SimpleGrid>

      <Paper p="lg" withBorder>
        <Text fw={600} mb="md">
          Resources
        </Text>
        <Stack gap="sm">
          <Group gap="sm">
            <IconBook size={18} style={{ color: 'var(--mantine-color-dimmed)' }} />
            <Anchor href={DOCS_URL} target="_blank" rel="noreferrer" size="sm">
              Documentation
            </Anchor>
          </Group>
          <Group gap="sm">
            <IconBrandGithub size={18} style={{ color: 'var(--mantine-color-dimmed)' }} />
            <Anchor href={GITHUB_URL} target="_blank" rel="noreferrer" size="sm">
              GitHub Repository
            </Anchor>
          </Group>
        </Stack>
        <Divider my="lg" />
        <Badge variant="light">Copyright © 2026 SIMANTIK</Badge>
      </Paper>
    </Stack>
  );
}

function InfoCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Paper p="md" withBorder>
      <Group gap="sm" align="flex-start" wrap="nowrap">
        <span style={{ color: 'var(--mantine-color-dimmed)', display: 'flex', marginTop: 2 }}>{icon}</span>
        <div>
          <Text size="xs" c="dimmed">
            {label}
          </Text>
          <Text size="sm" fw={500}>
            {value}
          </Text>
        </div>
      </Group>
    </Paper>
  );
}