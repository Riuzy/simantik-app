'use client';

import { Center } from '@mantine/core';
import { ChangePasswordForm } from '../../../features/auth/components';
import { ProtectedRoute } from '../../../components/common/route-guards';

export default function ChangePasswordPage() {
  return (
    <ProtectedRoute>
      <Center h="100vh">
        <ChangePasswordForm />
      </Center>
    </ProtectedRoute>
  );
}
