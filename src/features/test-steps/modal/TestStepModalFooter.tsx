import React from 'react';
import { Group, Button } from '@mantine/core';
import { IconCopy } from '@tabler/icons-react';
import type { TestStepModalMode } from './types';

interface Props {
  mode: TestStepModalMode;
  isSubmitting: boolean;
  isDirty: boolean;
  isReadOnly: boolean;
  onClose: () => void;
  onCopy?: () => void;
}

export function TestStepModalFooter({
  mode,
  isSubmitting,
  isDirty,
  isReadOnly,
  onClose,
  onCopy,
}: Props) {
  const submitLabel = getSubmitLabel(mode);

  return (
    <Group justify="flex-end" mt="md">
      <Button variant="default" onClick={onClose}>
        Cancel
      </Button>
      {mode === 'copy' && onCopy && (
        <Button
          leftSection={<IconCopy size={14} />}
          onClick={onCopy}
          disabled={isReadOnly}
        >
          Copy to Clipboard
        </Button>
      )}
      <Button
        type="submit"
        loading={isSubmitting}
        disabled={isReadOnly || !isDirty}
      >
        {submitLabel}
      </Button>
    </Group>
  );
}

function getSubmitLabel(mode: TestStepModalMode): string {
  switch (mode) {
    case 'create': return 'Add Step';
    case 'edit': return 'Save Changes';
    case 'duplicate': return 'Duplicate';
    case 'copy': return 'Copy to Clipboard';
    case 'preview': return 'Close';
    default: return 'Save';
  }
}