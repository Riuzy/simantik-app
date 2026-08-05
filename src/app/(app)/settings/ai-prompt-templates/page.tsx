'use client';

import { Container, Stack } from '@mantine/core';
import { PageHeader } from '../../../../components/ui/page-header';
import { PromptTemplatesEditor } from '../../../../features/ai/components/prompt-templates-editor';

export default function AIPromptTemplatesPage() {
  return (
    <Container size="lg" py="md">
      <Stack gap="md">
        <PageHeader
          title="AI Prompt Template"
          description="Ubah prompt AI tanpa mengubah source code"
        />
        <PromptTemplatesEditor />
      </Stack>
    </Container>
  );
}
