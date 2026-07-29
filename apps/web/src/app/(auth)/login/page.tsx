'use client';

import { Center } from '@mantine/core';
import { LoginForm } from '../../../features/auth/components';
import { GuestRoute } from '../../../components/common/route-guards';

export default function LoginPage() {
  return (
    <GuestRoute>
      <Center h="100vh">
        <LoginForm />
      </Center>
    </GuestRoute>
  );
}