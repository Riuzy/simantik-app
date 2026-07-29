'use client';

import {
  Card, TextInput, PasswordInput, Button, Stack, Title, Text,
} from '@mantine/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLogin } from '../hooks/use-auth';
import { loginSchema, type LoginFormData } from '../schemas';

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const loginMutation = useLogin();

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <Card shadow="lg" padding="xl" radius="md" w={420}>
      <Stack gap="md">
        <Title order={2} ta="center">SIMANTIK</Title>
        <Text c="dimmed" size="sm" ta="center">Sign in to your account</Text>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="your@email.com"
              {...register('email')}
              error={errors.email?.message}
              disabled={loginMutation.isPending}
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              {...register('password')}
              error={errors.password?.message}
              disabled={loginMutation.isPending}
            />
            <Button type="submit" fullWidth loading={loginMutation.isPending}>
              Sign in
            </Button>
          </Stack>
        </form>
      </Stack>
    </Card>
  );
}
