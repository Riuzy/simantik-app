import { Button, Group, Modal, Text } from '@mantine/core';

interface Props {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

export function ConfirmDialog({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
}: Props) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} size="sm">
      <Text size="sm" mb="lg">{message}</Text>
      <Group justify="flex-end">
        <Button variant="light" onClick={onClose} disabled={loading}>{cancelLabel}</Button>
        <Button color="red" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </Group>
    </Modal>
  );
}
