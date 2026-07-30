'use client';

import { useEffect } from 'react';
import { Modal, TextInput, Textarea, Select, Group, Button, Stack } from '@mantine/core';
import { useForm, schemaResolver } from '@mantine/form';
import { updateTestCaseSchema, type UpdateTestCaseForm } from '../schemas';
import { useUpdateTestCase } from '../hooks';

interface Props {
  projectId: string;
  testCase: {
    id: string;
    title: string;
    description: string | null;
    module: string | null;
    priority: string;
    testType: string;
  } | null;
  opened: boolean;
  onClose: () => void;
}

export function EditTestCaseModal({ projectId, testCase, opened, onClose }: Props) {
  const updateTestCase = useUpdateTestCase(projectId);

  const form = useForm<UpdateTestCaseForm>({
    validate: schemaResolver(updateTestCaseSchema),
    initialValues: {
      title: '',
      description: '',
      module: '',
      priority: 'MEDIUM',
      testType: 'MANUAL',
    },
  });

  useEffect(() => {
    if (testCase) {
      form.setValues({
        title: testCase.title,
        description: testCase.description ?? '',
        module: testCase.module ?? '',
        priority: testCase.priority as any,
        testType: testCase.testType as any,
      });
    }
  }, [testCase]);

  const handleSubmit = (values: UpdateTestCaseForm) => {
    if (!testCase) return;
    updateTestCase.mutate({ id: testCase.id, data: values }, {
      onSuccess: () => {
        form.reset();
        onClose();
      },
    });
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Test Case" size="lg">
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
              label="Type"
              data={[
                { value: 'MANUAL', label: 'Manual' },
                { value: 'AUTOMATION', label: 'Automation' },
              ]}
              {...form.getInputProps('testType')}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={updateTestCase.isPending}>Save</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}