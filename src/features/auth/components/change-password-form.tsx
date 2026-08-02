'use client';

import { Card, PasswordInput, Button, Stack, Title, Text } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useChangePassword } from '../hooks/use-auth';
import { changePasswordSchema, type ChangePasswordFormData } from '../schemas';

export function ChangePasswordForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });
  const changePasswordMutation = useChangePassword();

  const onSubmit = (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate(data);
  };

  return (
    <Card shadow="lg" padding="xl" radius="md" w={420}>
      <Stack gap="md">
        <Title order={2} ta="center">Change Password</Title>
        <Text c="dimmed" size="sm" ta="center">
          You must change your temporary password before continuing
        </Text>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <PasswordInput
              label="Current Password"
              placeholder="Current password"
              {...register('currentPassword')}
              error={errors.currentPassword?.message}
              disabled={changePasswordMutation.isPending}
            />
            <PasswordInput
              label="New Password"
              placeholder="New password"
              {...register('newPassword')}
              error={errors.newPassword?.message}
              disabled={changePasswordMutation.isPending}
            />
            <Button type="submit" fullWidth loading={changePasswordMutation.isPending}>
              Change Password
            </Button>
          </Stack>
        </form>
      </Stack>
    </Card>
  );
}
