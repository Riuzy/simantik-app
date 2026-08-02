'use client';

import { useCallback } from 'react';
import { Modal, TextInput, Textarea, Select, Group, Button, Stack } from '@mantine/core';
import { useForm, schemaResolver } from '@mantine/form';
import { useRouter } from 'next/navigation';
import { createTestCaseSchema, type CreateTestCaseForm } from '../schemas';
import { useCreateTestCase } from '../hooks';

interface Props {
  projectId: string;
  projectSlug?: string;
  opened: boolean;
  onClose: () => void;
}

export function CreateTestCaseModal({ projectId, projectSlug, opened, onClose }: Props) {
  const createTestCase = useCreateTestCase(projectId);
  const router = useRouter();

  const form = useForm<CreateTestCaseForm>({
    validate: schemaResolver(createTestCaseSchema),
    initialValues: {
      title: '',
      description: '',
      module: '',
      priority: 'MEDIUM',
      status: 'DRAFT',
      projectId,
    },
  });

  const handleSubmit = useCallback((values: CreateTestCaseForm) => {
    createTestCase.mutate(values, {
      onSuccess: (data) => {
        form.reset();
        onClose();
        if (projectSlug) {
          router.push(`/projects/${projectSlug}/test-cases/${data.code}`);
        }
      },
    });
  }, [createTestCase, form, router, onClose, projectSlug]);

  return (
    <Modal opened={opened} onClose={onClose} title="Create Test Case" size="lg">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Title"
            placeholder="Enter test case title"
            required
            {...form.getInputProps('title')}
          />

          <Textarea
            label="Description"
            placeholder="Describe the test case"
            minRows={3}
            {...form.getInputProps('description')}
          />

          <TextInput
            label="Module"
            placeholder="e.g. Authentication, Projects"
            {...form.getInputProps('module')}
          />

          <Group grow>
            <Select
              label="Priority"
              data={[
                { value: 'LOW', label: 'Low' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HIGH', label: 'High' },
                { value: 'CRITICAL', label: 'Critical' },
              ]}
              {...form.getInputProps('priority')}
            />

            <Select
              label="Status"
              data={[
                { value: 'DRAFT', label: 'Draft' },
                { value: 'READY', label: 'Ready' },
                { value: 'ARCHIVED', label: 'Archived' },
              ]}
              {...form.getInputProps('status')}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={createTestCase.isPending}>Create</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}