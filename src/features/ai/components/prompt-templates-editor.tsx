'use client';

import { useState } from 'react';
import { Paper, Stack, Text, Textarea, Button, Group, Tabs, Box } from '@mantine/core';
import { IconDeviceFloppy, IconRotate } from '@tabler/icons-react';
import { usePromptTemplates, useUpdatePromptTemplate } from '../hooks';
import { PromptTemplates } from '../types';

const TEMPLATE_TABS: { key: keyof PromptTemplates; label: string; description: string }[] = [
  { key: 'system', label: 'System Prompt', description: 'Instruksi dasar untuk AI sebagai QA engineer.' },
  { key: 'scriptGenerator', label: 'Script Generator Prompt', description: 'Prompt untuk menghasilkan script Playwright.' },
  { key: 'expectedResult', label: 'Expected Result Prompt', description: 'Prompt untuk menghasilkan Expected Result.' },
  { key: 'testCase', label: 'Test Case Prompt', description: 'Prompt untuk membantu membuat Test Case.' },
  { key: 'locatorGenerator', label: 'Locator Generator Prompt', description: 'Prompt untuk menghasilkan lokator elemen.' },
  { key: 'executionAnalysis', label: 'Execution Analysis Prompt', description: 'Prompt untuk menganalisis hasil eksekusi.' },
];

const DEFAULTS: Record<keyof PromptTemplates, string> = {
  system: 'Kamu adalah QA Automation Engineer berpengalaman.\nKamu menghasilkan script Playwright yang lengkap, benar, dan siap dijalankan.\nGunakan lokator yang stabil dan self-healing.\nJangan menambahkan komentar yang tidak perlu.',
  scriptGenerator: 'Buatkan script automation Playwright untuk test case berikut.\n\nTest Case: {title}\nKode: {code}\nFramework: {framework}\n\nTest Steps:\n{steps}\n\nAturan:\n- Output HANYA kode script mentah, tanpa markdown fence, tanpa penjelasan.\n- Gunakan `const { chromium } = require(\'playwright\');`.\n- Kirim log lewat console.log dengan awalan `LOG:LEVEL:pesan`.\n- Di akhir, kirim `RESULT:{"status":"PASSED"|"FAILED","error":"..."}`.\n- Bungkus semua langkah dalam try/catch.\n- Verifikasi hasil sesuai Expected Result setiap langkah.',
  expectedResult: 'Buatkan Expected Result untuk setiap langkah test case berikut.\nFormat: per langkah tampilkan nomor, action, dan hasil yang diharapkan secara jelas dan rinci.',
  testCase: 'Bantu buatkan test case profesional.\nSertakan judul, modul, prioritas, langkah-langkah, dan expected result untuk setiap langkah.',
  locatorGenerator: 'Buatkan lokator Playwright yang stabil untuk elemen berikut.\nGunakan data-testid bila ada, lalu fallback ke label, role, name, placeholder, dan CSS.',
  executionAnalysis: 'Analisis hasil eksekusi berikut.\nSebutkan langkah yang gagal, penyebab, dan rekomendasi perbaikan.',
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
        Ubah prompt tanpa mengubah source code. Placeholder yang didukung: {`{title}`}, {`{code}`}, {`{framework}`}, {`{steps}`}.
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
