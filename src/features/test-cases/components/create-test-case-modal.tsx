'use client';

import { useCallback, useEffect } from 'react';
import { Modal, TextInput, Textarea, Select, Group, Button, Stack } from '@mantine/core';
import { useForm, schemaResolver } from '@mantine/form';
import { useRouter } from 'next/navigation';
import { createTestCaseSchema, type CreateTestCaseForm } from '../schemas';
import { useCreateTestCase, useCreateTestCaseGlobal } from '../hooks';
import { useProjects } from '../../projects/hooks';

interface Props {
  projectId?: string;
  projectSlug?: string;
  opened: boolean;
  onClose: () => void;
}

export function CreateTestCaseModal({ projectId, projectSlug, opened, onClose }: Props) {
  const createTestCase = useCreateTestCase(projectId ?? '');
  const createTestCaseGlobal = useCreateTestCaseGlobal();
  const { data: projectsData } = useProjects({ limit: 100 });
  const router = useRouter();

  const isGlobal = !projectId;
  const create = isGlobal ? createTestCaseGlobal : createTestCase;

  const form = useForm<CreateTestCaseForm>({
    validate: schemaResolver(createTestCaseSchema),
    initialValues: {
      code: '',
      title: '',
      description: '',
      module: '',
      priority: 'MEDIUM',
      status: 'DRAFT',
      type: 'MANUAL',
      projectId: projectId ?? '',
    },
  });

  useEffect(() => {
    if (projectId && !isGlobal && form.getValues().projectId !== projectId) {
      form.setFieldValue('projectId', projectId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, isGlobal]);

  const handleSubmit = useCallback((values: CreateTestCaseForm) => {
    create.mutate(values, {
      onSuccess: (data) => {
        form.reset();
        onClose();
        if (projectSlug) {
          router.push(`/projects/${projectSlug}/test-cases/${data.code}`);
        }
      },
    });
  }, [create, form, router, onClose, projectSlug]);

  const projectOptions = (projectsData?.data ?? []).map((p) => ({
    value: p.id,
    label: `${p.code} - ${p.name}`,
  }));

  return (
    <Modal opened={opened} onClose={onClose} title="Create Test Case" size="lg">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {isGlobal && (
            <Select
              label="Project"
              placeholder="Select project"
              data={projectOptions}
              required
              searchable
              {...form.getInputProps('projectId')}
            />
          )}

          <TextInput
            label="Code"
            placeholder="TC-LOGIN-001, TC-001, AUTH-001"
            description="Format: 2-10 huruf besar (opsional: dash + 2-20 huruf besar) + dash + 3 digit"
            required
            {...form.getInputProps('code')}
          />

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
              label="Type"
              data={[
                { value: 'MANUAL', label: 'Manual' },
                { value: 'AUTOMATION', label: 'Automation' },
              ]}
              {...form.getInputProps('type')}
            />

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
          </Group>

          <Group grow>
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
            <Button type="submit" loading={create.isPending}>Create</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
