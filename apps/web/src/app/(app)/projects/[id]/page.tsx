'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Container, Group, Text, Badge, Paper, SimpleGrid, Avatar, Button, Loader, Center, Box, Tabs, Combobox, TextInput, useCombobox, rem } from '@mantine/core';
import { IconUserPlus, IconTrash, IconFolder, IconRocket, IconBug, IconTestPipe, IconUsers, IconInfoCircle } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useAuthStore } from '../../../../stores/auth-store';
import { useProject, useProjectMembers, useAddMember, useRemoveMember, useAvailableUsers } from '../../../../features/projects/hooks';
import { PageHeader } from '../../../../components/common/page';

const statusColor: Record<string, string> = {
  ACTIVE: 'green', COMPLETED: 'cyan',
};

function OverviewTab({ project }: { project: NonNullable<ReturnType<typeof useProject>['data']> }) {
  return (
    <>
      <SimpleGrid cols={{ base: 1, md: 3 }} mb="lg">
        <Paper p="md" withBorder>
          <Text size="sm" fw={500}>Status</Text>
          <Badge color={statusColor[project.status]} mt={4}>{project.status}</Badge>
        </Paper>
        <Paper p="md" withBorder>
          <Text size="sm" fw={500}>Created by</Text>
          <Text mt={4}>{project.createdBy?.name}</Text>
        </Paper>
        <Paper p="md" withBorder>
          <Text size="sm" fw={500}>Statistics</Text>
          <Text mt={4}>Members: {project._count?.members ?? 0}</Text>
          <Text size="xs">Test Cases: {project._count?.testCases ?? 0}</Text>
          <Text size="xs">Test Runs: {project._count?.testRuns ?? 0}</Text>
          <Text size="xs">Bugs: {project._count?.bugReports ?? 0}</Text>
        </Paper>
      </SimpleGrid>

      {project.description && (
        <Paper p="md" withBorder>
          <Text size="sm" fw={500} mb={4}>Description</Text>
          <Text size="sm">{project.description}</Text>
        </Paper>
      )}
    </>
  );
}

function MembersTab({ projectId, isManager }: { projectId: string; isManager: boolean }) {
  const { data: members, isLoading: membersLoading } = useProjectMembers(projectId);
  const addMember = useAddMember(projectId);
  const removeMember = useRemoveMember(projectId);
  const { data: candidates = [], isLoading: usersLoading } = useAvailableUsers(projectId);

  const combobox = useCombobox({ onDropdownClose: () => combobox.resetSelectedOption() });
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const filtered = useMemo(
    () => candidates.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())),
    [candidates, search]
  );

  const openRemoveConfirm = (memberName: string, memberUserId: string) =>
    modals.openConfirmModal({
      title: 'Remove Member',
      centered: true,
      children: <Text size="sm">Are you sure you want to remove {memberName} from this project?</Text>,
      labels: { confirm: 'Remove', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => removeMember.mutate(memberUserId),
    });

  const handleAdd = () => {
    if (!selectedUser) return;
    addMember.mutate(selectedUser, {
      onSuccess: () => { setSearch(''); setSelectedUser(null); },
    });
  };

  const selectedUserData = candidates.find((u) => u.id === selectedUser);

  return (
    <Paper p="md" withBorder>
      <Group justify="space-between" mb="md">
        <Text fw={500}>Members ({members?.length ?? 0})</Text>
      </Group>

      {isManager && (
        <Group mb="md" align="flex-start">
          <Box style={{ flex: 1 }}>
          <Combobox
            store={combobox}
            onOptionSubmit={(val) => {
              setSelectedUser(val);
              const user = candidates.find((u) => u.id === val);
              setSearch(user ? user.name : '');
              combobox.closeDropdown();
            }}
            withinPortal
          >
            <Combobox.Target>
              <TextInput
                placeholder="Search for a user to add..."
                value={selectedUser ? (selectedUserData?.name ?? '') : search}
                onChange={(e) => {
                  setSearch(e.currentTarget.value);
                  setSelectedUser(null);
                  combobox.openDropdown();
                  combobox.resetSelectedOption();
                }}
                onClick={() => combobox.openDropdown()}
                onFocus={() => combobox.openDropdown()}
                onBlur={() => combobox.closeDropdown()}
                rightSection={usersLoading ? <Loader size="xs" /> : undefined}
              />
            </Combobox.Target>

            <Combobox.Dropdown>
              <Combobox.Options>
                {filtered.length === 0 ? (
                  <Combobox.Empty>No users found</Combobox.Empty>
                ) : (
                  filtered.map((u) => (
                    <Combobox.Option key={u.id} value={u.id}>
                      <Group gap="sm">
                        <Avatar src={u.avatar} alt={u.name} size="sm" radius="xl" />
                        <div style={{ flex: 1 }}>
                          <Text size="sm">{u.name}</Text>
                          <Text size="xs" c="dimmed">{u.email}</Text>
                        </div>
                        <Badge size="sm" variant="light" color={u.role?.name === 'Developer' ? 'blue' : 'teal'}>{u.role?.name}</Badge>
                      </Group>
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>
          </Box>

          <Button
            leftSection={<IconUserPlus size={16} />}
            onClick={handleAdd}
            loading={addMember.isPending}
            disabled={!selectedUser}
          >
            Add
          </Button>
        </Group>
      )}

      {membersLoading ? (
        <Center py="lg"><Loader /></Center>
      ) : !members?.length ? (
        <Text c="dimmed" size="sm">No members yet</Text>
      ) : (
        members.map((m) => (
          <Group key={m.id} justify="space-between" py="xs">
            <Group gap="sm">
              <Avatar src={m.user.avatar} alt={m.user.name} size="sm" radius="xl" />
              <div>
                <Text size="sm">{m.user.name}</Text>
                <Text size="xs" c="dimmed">{m.user.role?.name}</Text>
              </div>
            </Group>
            {isManager && (
              <Button
                variant="subtle"
                color="red"
                size="xs"
                leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                onClick={() => openRemoveConfirm(m.user.name, m.userId)}
                loading={removeMember.isPending}
              >
                Remove
              </Button>
            )}
          </Group>
        ))
      )}
    </Paper>
  );
}

function EmptyTab({ icon: Icon, message }: { icon: React.ComponentType<{ size?: number; stroke?: number }>; message: string }) {
  return (
    <Paper p="xl" ta="center" withBorder>
      <div style={{ opacity: 0.3 }}>
        <Icon size={40} stroke={1} />
      </div>
      <Text c="dimmed" mt="sm">{message}</Text>
    </Paper>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const isManager = user?.role?.name === 'Manager';
  const { data: project, isLoading } = useProject(id);

  if (isLoading) return <Center h={400}><Loader /></Center>;
  if (!project) return <Center h={400}><Text c="dimmed">Project not found</Text></Center>;

  return (
    <Container size="xl" py="md">
      <PageHeader title={project.name} description={`${project.code} · ${project.slug}`} />

      <Tabs defaultValue="overview" mt="md">
        <Tabs.List mb="md">
          <Tabs.Tab value="overview" leftSection={<IconInfoCircle style={{ width: rem(16), height: rem(16) }} />}>Overview</Tabs.Tab>
          <Tabs.Tab value="members" leftSection={<IconUsers style={{ width: rem(16), height: rem(16) }} />}>Members</Tabs.Tab>
          <Tabs.Tab value="test-cases" leftSection={<IconTestPipe style={{ width: rem(16), height: rem(16) }} />}>Test Cases</Tabs.Tab>
          <Tabs.Tab value="test-runs" leftSection={<IconRocket style={{ width: rem(16), height: rem(16) }} />}>Test Runs</Tabs.Tab>
          <Tabs.Tab value="executions" leftSection={<IconFolder style={{ width: rem(16), height: rem(16) }} />}>Executions</Tabs.Tab>
          <Tabs.Tab value="bug-reports" leftSection={<IconBug style={{ width: rem(16), height: rem(16) }} />}>Bug Reports</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <OverviewTab project={project} />
        </Tabs.Panel>

        <Tabs.Panel value="members">
          <MembersTab projectId={id} isManager={isManager} />
        </Tabs.Panel>

        <Tabs.Panel value="test-cases">
          <EmptyTab icon={IconTestPipe} message="No Test Cases found" />
        </Tabs.Panel>

        <Tabs.Panel value="test-runs">
          <EmptyTab icon={IconRocket} message="No Test Runs found" />
        </Tabs.Panel>

        <Tabs.Panel value="executions">
          <EmptyTab icon={IconFolder} message="No Executions found" />
        </Tabs.Panel>

        <Tabs.Panel value="bug-reports">
          <EmptyTab icon={IconBug} message="No Bug Reports found" />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
