'use client';

import { Container, Paper, Text, Stack } from '@mantine/core';
import { PageHeader } from '../../../../components/ui/page-header';
import { AIIntegrationForm } from '../../../../features/ai/components/ai-integration-form';

export default function AIIntegrationPage() {
  return (
    <Container size="lg" py="md">
      <Stack gap="md">
        <PageHeader
          title="AI Integration"
          description="Konfigurasi provider AI untuk membantu generate script automation"
        />
        <AIIntegrationForm />
      </Stack>
    </Container>
  );
}
