'use client';

import { useState } from 'react';
import { Modal, Stack, Radio, Divider, TextInput, Checkbox, Group, Button, Text } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { DEFAULT_REPORT_DOWNLOAD_OPTIONS } from '../types';
import type { ReportFormat, ReportDownloadOptions } from '../types';

interface Props {
  opened: boolean;
  onClose: () => void;
  isPending: boolean;
  onDownload: (format: ReportFormat, options: ReportDownloadOptions, filename: string) => void;
}

function defaultFilename(): string {
  return `SIMANTIK-Test-Report-${new Date().toISOString().slice(0, 10)}`;
}

export function DownloadReportModal({ opened, onClose, isPending, onDownload }: Props) {
  const [format, setFormat] = useState<ReportFormat>('pdf');
  const [filename, setFilename] = useState(defaultFilename);
  const [includeSummary, setIncludeSummary] = useState(DEFAULT_REPORT_DOWNLOAD_OPTIONS.includeSummary);
  const [includeTestCase, setIncludeTestCase] = useState(DEFAULT_REPORT_DOWNLOAD_OPTIONS.includeTestCase);
  const [includeExpectedResult, setIncludeExpectedResult] = useState(DEFAULT_REPORT_DOWNLOAD_OPTIONS.includeExpectedResult);
  const [includeActualResult, setIncludeActualResult] = useState(DEFAULT_REPORT_DOWNLOAD_OPTIONS.includeActualResult);
  const [includeStatus, setIncludeStatus] = useState(DEFAULT_REPORT_DOWNLOAD_OPTIONS.includeStatus);

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const handleDownload = () => {
    const options: ReportDownloadOptions = {
      includeSummary,
      includeTestCase,
      includeExpectedResult,
      includeActualResult,
      includeStatus,
    };
    const safeFilename = filename.trim() || defaultFilename();
    onDownload(format, options, safeFilename);
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Download Test Case Report" centered>
      <Stack gap="md">
        <Radio.Group
          value={format}
          onChange={(value) => setFormat(value as ReportFormat)}
          label="Format Laporan"
        >
          <Stack mt={8} gap="sm">
            <Radio value="pdf" label="PDF" description="Portable Document Format" />
            <Radio value="xlsx" label="Excel" description="Microsoft Excel (.xlsx)" />
          </Stack>
        </Radio.Group>

        <Divider />

        <TextInput
          label="Nama File"
          value={filename}
          onChange={(e) => setFilename(e.currentTarget.value)}
          description={`File akan diunduh sebagai ${filename.trim() || defaultFilename()}.${format}`}
        />

        <Divider />

        <Stack gap="xs">
          <Text size="sm" fw={500}>Include</Text>
          <Checkbox label="Summary" checked={includeSummary} onChange={(e) => setIncludeSummary(e.currentTarget.checked)} />
          <Checkbox label="Test Case" checked={includeTestCase} onChange={(e) => setIncludeTestCase(e.currentTarget.checked)} />
          <Checkbox label="Expected Result" checked={includeExpectedResult} onChange={(e) => setIncludeExpectedResult(e.currentTarget.checked)} />
          <Checkbox label="Actual Result" checked={includeActualResult} onChange={(e) => setIncludeActualResult(e.currentTarget.checked)} />
          <Checkbox label="Status" checked={includeStatus} onChange={(e) => setIncludeStatus(e.currentTarget.checked)} />
        </Stack>

        <Divider />

        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            leftSection={isPending ? undefined : <IconDownload size={16} />}
            loading={isPending}
            onClick={handleDownload}
          >
            {isPending ? 'Generating...' : 'Download'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
