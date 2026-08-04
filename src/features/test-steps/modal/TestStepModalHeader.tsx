import React from 'react';
import { Modal, Text, Group, ActionIcon } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import type { TestStepModalMode } from './types';

interface Props {
  mode: TestStepModalMode;
  onClose: () => void;
}

export function TestStepModalHeader({ mode, onClose }: Props) {
  const title = getTitle(mode);

  return (
    <Modal.Header>
      <Group justify="space-between">
        <Text fw={600} size="lg">
          {title}
        </Text>
        <ActionIcon variant="subtle" onClick={onClose} aria-label="Close modal">
          <IconX size={16} />
        </ActionIcon>
      </Group>
    </Modal.Header>
  );
}

function getTitle(mode: TestStepModalMode): string {
  switch (mode) {
    case 'create': return 'Add Test Step';
    case 'edit': return 'Edit Test Step';
    case 'duplicate': return 'Duplicate Test Step';
    case 'copy': return 'Copy Test Step';
    case 'preview': return 'Preview Test Step';
    default: return 'Test Step';
  }
}