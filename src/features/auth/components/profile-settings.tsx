'use client';

import { useEffect, useRef } from 'react';
import {
  Center, Loader, Text, Stack, Paper, Box, SimpleGrid, Title, TextInput, Button, Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconDeviceFloppy, IconShieldLock } from '@tabler/icons-react';
import { useCurrentUser, useChangePassword, useUpdateProfile } from '../hooks/use-auth';
import { uploadAvatar } from '../services';
import { useAuthStore } from '../../../stores/auth-store';
import { useQueryClient } from '@tanstack/react-query';
import { AvatarUpload } from './avatar-upload';

export function ProfileSettings() {
  const { data: user, isLoading } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  const profileForm = useForm({
    initialValues: {
      name: '',
      email: '',
    },
    validate: {
      name: (v: string) => (v.trim().length < 2 ? 'Name must be at least 2 characters' : null),
      email: (v: string) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Invalid email'),
    },
  });

  const passwordForm = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      currentPassword: (v: string) => (v.trim().length < 6 ? 'Current password required' : null),
      newPassword: (v: string) => {
        if (v.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(v)) return 'Must contain at least one uppercase letter';
        if (!/[a-z]/.test(v)) return 'Must contain at least one lowercase letter';
        if (!/[0-9]/.test(v)) return 'Must contain at least one number';
        return null;
      },
      confirmPassword: (v: string, values) =>
        v !== values.newPassword ? 'Passwords do not match' : null,
    },
  });

  const hydratedRef = useRef(false);

  useEffect(() => {
    if (user && !hydratedRef.current) {
      profileForm.setValues({ name: user.name, email: user.email });
      hydratedRef.current = true;
    }
  }, [user, profileForm]);

  if (isLoading) return <Center h={200}><Loader /></Center>;
  if (!user) return <Center h={200}><Text c="dimmed">Not signed in</Text></Center>;

  const handleAvatarUpload = async (file: File) => {
    const updated = await uploadAvatar(file);
    setUser(updated);
    queryClient.setQueryData(['current-user'], updated);
    return { avatarUrl: updated.avatar ?? '' };
  };

  const handleProfileSubmit = (values: typeof profileForm.values) => {
    updateProfile.mutate({
      name: values.name,
      email: values.email,
    });
  };

  const handlePasswordSubmit = (values: typeof passwordForm.values) => {
    changePassword.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  };

  return (
    <Stack gap="md">
      <Paper p="lg" withBorder>
        <Title order={4} mb="md">
          Profile Information
        </Title>

        <AvatarUpload
          currentAvatar={user.avatar}
          userName={user.name}
          onUpload={handleAvatarUpload}
          isLoading={updateProfile.isPending}
        />

        <Divider my="lg" />

        <SimpleGrid cols={{ base: 1, md: 3 }} mt="lg">
          <Paper p="md" withBorder>
            <Text size="xs" c="dimmed">
              Account Status
            </Text>
            <Text size="sm">{user.isActive ? 'Active' : 'Inactive'}</Text>
          </Paper>
          <Paper p="md" withBorder>
            <Text size="xs" c="dimmed">
              Last Login
            </Text>
            <Text size="sm">
              {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '\u2014'}
            </Text>
          </Paper>
          <Paper p="md" withBorder>
            <Text size="xs" c="dimmed">
              Member Since
            </Text>
            <Text size="sm">{new Date(user.createdAt).toLocaleString()}</Text>
          </Paper>
        </SimpleGrid>
      </Paper>

      <Paper p="lg" withBorder>
        <Title order={4} mb="md">
          Edit Profile Information
        </Title>
        <form onSubmit={profileForm.onSubmit(handleProfileSubmit)}>
          <Stack gap="md" maw={480}>
            <TextInput label="Name" placeholder="Full name" {...profileForm.getInputProps('name')} />
            <TextInput label="Email" placeholder="you@example.com" {...profileForm.getInputProps('email')} />
            <Box>
              <Button type="submit" leftSection={<IconDeviceFloppy size={16} />} loading={updateProfile.isPending}>
                Save Changes
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>

      <Paper p="lg" withBorder>
        <Title order={4} mb="md">
          Change Password
        </Title>
        <form onSubmit={passwordForm.onSubmit(handlePasswordSubmit)}>
          <Stack gap="md" maw={480}>
            <TextInput
              label="Current Password"
              type="password"
              {...passwordForm.getInputProps('currentPassword')}
            />
            <TextInput label="New Password" type="password" {...passwordForm.getInputProps('newPassword')} />
            <TextInput
              label="Confirm New Password"
              type="password"
              {...passwordForm.getInputProps('confirmPassword')}
            />
            <Box>
              <Button
                type="submit"
                leftSection={<IconShieldLock size={16} />}
                loading={changePassword.isPending}
              >
                Change Password
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}