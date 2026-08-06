'use client';

import { useState } from 'react';
import { Paper, Stack, Text, Textarea, Button, Group, Tabs, Box } from '@mantine/core';
import { IconDeviceFloppy, IconRotate } from '@tabler/icons-react';
import { usePromptTemplates, useUpdatePromptTemplate } from '../hooks';
import { PromptTemplates } from '../types';

const TEMPLATE_TABS: { key: keyof PromptTemplates; label: string; description: string }[] = [
  { key: 'system', label: 'System Prompt', description: 'Base instructions for the AI as a QA engineer.' },
  { key: 'scriptGenerator', label: 'Script Generator Prompt', description: 'Prompt used to generate Playwright scripts.' },
  { key: 'expectedResult', label: 'Expected Result Prompt', description: 'Prompt used to generate Expected Results.' },
  { key: 'testCase', label: 'Test Case Prompt', description: 'Prompt used to help create Test Cases.' },
  { key: 'locatorGenerator', label: 'Locator Generator Prompt', description: 'Prompt used to generate element locators.' },
  { key: 'executionAnalysis', label: 'Execution Analysis Prompt', description: 'Prompt used to analyze execution results.' },
];

const DEFAULTS: Record<keyof PromptTemplates, string> = {
  system: 'You are an experienced QA Automation Engineer.\nYou produce complete, correct, and runnable Playwright scripts.\nUse stable and self-healing locators.\nDo not add unnecessary comments.',
  scriptGenerator: 'Generate a Playwright automation script for the following test case.\n\nTest Case: {title}\nCode: {code}\nFramework: {framework}\n\nTest Steps:\n{steps}\n\nRules:\n- Output ONLY the raw script, no markdown fences, no explanations.\n- Use `const { chromium } = require(\'playwright\');`.\n- Log progress via console.log with the prefix `LOG:LEVEL:message`.\n- At the end, output `RESULT:{"status":"PASSED"|"FAILED","error":"..."}`.\n- Wrap every step in try/catch.\n- Verify each step against its Expected Result.',
  expectedResult: 'Generate an Expected Result for each step of the following test case.\nFormat: per step show the number, action, and the expected outcome clearly and in detail.',
  testCase: 'Help create a professional test case.\nInclude title, module, priority, steps, and an expected result for every step.',
  locatorGenerator: 'Generate stable Playwright locators for the following element.\nUse data-testid when available, then fall back to label, role, name, placeholder, and CSS.',
  executionAnalysis: 'Analyze the following execution result.\nMention the failed step, the cause, and recommendations for improvement.',
};

export function PromptTemplatesEditor() {
  const { data, isLoading } = usePromptTemplates();
  const update = useUpdatePromptTemplate();
  const [activeKey, setActiveKey] = useState<keyof PromptTemplates>('system');
  const [draft, setDraft] = useState<Partial<Record<keyof PromptTemplates, string>>>({});

  const content = draft[activeKey] ?? data?.[activeKey] ?? DEFAULTS[activeKey];

  if (isLoading) return null;

  const handleSave = () => {
    update.mutate({ key: activeKey, content });
  };

  const handleReset = () => {
    setDraft((prev) => ({ ...prev, [activeKey]: DEFAULTS[activeKey] }));
  };

  return (
    <Paper p="md" withBorder>
      <Text fw={600} mb="md">AI Prompt Template</Text>
       <Text size="sm" c="dimmed" mb="lg">
        Change prompts without modifying source code. Supported placeholders: {`{title}`}, {`{code}`}, {`{framework}`}, {`{steps}`}.
      </Text>

      <Tabs value={activeKey} onChange={(v) => setActiveKey((v as keyof PromptTemplates) ?? 'system')}>
        <Tabs.List>
          {TEMPLATE_TABS.map((tab) => (
            <Tabs.Tab key={tab.key} value={tab.key}>{tab.label}</Tabs.Tab>
          ))}
        </Tabs.List>

        {TEMPLATE_TABS.map((tab) => (
          <Tabs.Panel key={tab.key} value={tab.key} pt="md">
            <Box mb="sm">
              <Text size="xs" c="dimmed">{tab.description}</Text>
            </Box>
            <Textarea
              minRows={10}
              autosize
              value={draft[tab.key] ?? data?.[tab.key] ?? DEFAULTS[tab.key]}
              onChange={(e) => setDraft((prev) => ({ ...prev, [tab.key]: e.currentTarget.value }))}
              ff="monospace"
              style={{ fontSize: 13 }}
            />
            <Group mt="md">
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                loading={update.isPending}
                onClick={handleSave}
              >
                Save Template
              </Button>
              <Button variant="light" leftSection={<IconRotate size={16} />} onClick={handleReset}>
                Reset to Default
              </Button>
            </Group>
          </Tabs.Panel>
        ))}
      </Tabs>
    </Paper>
  );
}
