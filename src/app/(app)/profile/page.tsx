'use client';

import { Container, Paper, Title, Text, Group, Avatar, SimpleGrid, Loader, Center, Stack, TextInput, Button, Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCurrentUser, useChangePassword } from '../../../features/auth/hooks/use-auth';

export default function ProfilePage() {
  const { data: user, isLoading } = useCurrentUser();
  const changePassword = useChangePassword();

  const form = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      currentPassword: (v: string) => (v.trim().length < 6 ? 'Current password required' : null),
      newPassword: (v: string) => (v.length < 8 ? 'Password must be at least 8 characters' : null),
      confirmPassword: (v: string, values) =>
        v !== values.newPassword ? 'Passwords do not match' : null,
    },
  });

  if (isLoading) return <Center h={400}><Loader /></Center>;
  if (!user) return <Center h={400}><Text c="dimmed">Not signed in</Text></Center>;

  const handleSubmit = (values: typeof form.values) => {
    changePassword.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  };

  return (
    <Container size="lg" py="md">
      <Title order={2} mb="lg">Profile</Title>

      <Paper p="lg" withBorder mb="lg">
        <Group gap="lg">
          <Avatar src={user.avatar} size={80} radius="xl" color="blue">
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Title order={3}>{user.name}</Title>
            <Text c="dimmed">{user.email}</Text>
          </div>
        </Group>

        <SimpleGrid cols={{ base: 1, md: 2 }} mt="lg">
          <Paper p="md" withBorder>
            <Text size="xs" c="dimmed">Account Status</Text>
            <Text size="sm">{user.isActive ? 'Active' : 'Inactive'}</Text>
          </Paper>
          <Paper p="md" withBorder>
            <Text size="xs" c="dimmed">Last Login</Text>
            <Text size="sm">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '\u2014'}</Text>
          </Paper>
          <Paper p="md" withBorder>
            <Text size="xs" c="dimmed">Member Since</Text>
            <Text size="sm">{new Date(user.createdAt).toLocaleString()}</Text>
          </Paper>
        </SimpleGrid>
      </Paper>

      <Paper p="lg" withBorder>
        <Title order={4} mb="md">Change Password</Title>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md" maw={480}>
            <TextInput
              label="Current Password"
              type="password"
              {...form.getInputProps('currentPassword')}
            />
            <TextInput
              label="New Password"
              type="password"
              {...form.getInputProps('newPassword')}
            />
            <TextInput
              label="Confirm New Password"
              type="password"
              {...form.getInputProps('confirmPassword')}
            />
            <Box>
              <Button type="submit" loading={changePassword.isPending}>Change Password</Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
