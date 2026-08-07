'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button, Center, Loader, NumberInput, SegmentedControl, Select, Stack, Switch, TextInput, SimpleGrid, Divider, Text, Group,
} from '@mantine/core';
import {
  IconBuilding, IconClock, IconLanguage, IconBrandChrome, IconDeviceFloppy, IconHourglass, IconRobot,
} from '@tabler/icons-react';
import { useSettings, useBulkUpsertSetting } from '../hooks';
import { SettingsSection } from './settings-section';
import { AppSettings } from '../types';

type ExecutionMode = 'headless' | 'headed';

export function GeneralSettings() {
  const { data: settings, isLoading } = useSettings();
  const save = useBulkUpsertSetting();

  const [appName, setAppName] = useState('SIMANTIK');
  const [organization, setOrganization] = useState('');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Asia/Jakarta');
  const [browser, setBrowser] = useState('CHROMIUM');
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('headless');
  const [timeoutMs, setTimeoutMs] = useState(30000);
  const [autoSaveReports, setAutoSaveReports] = useState(false);
  const [autoGenerateScript, setAutoGenerateScript] = useState(false);
  const [showExecutionLogs, setShowExecutionLogs] = useState(true);

  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!settings || hydratedRef.current) return;
    setAppName(settings['app.name']);
    setOrganization(settings['app.organization']);
    setLanguage(settings['app.language']);
    setTimezone(settings['app.timezone']);
    setBrowser(settings['automation.browser']);
    setExecutionMode(settings['automation.headless'] ? 'headless' : 'headed');
    setTimeoutMs(settings['automation.timeout']);
    setAutoSaveReports(settings['automation.autoReport']);
    setAutoGenerateScript(settings['automation.autoGenerate']);
    setShowExecutionLogs(settings['automation.showLogs']);
    hydratedRef.current = true;
  }, [settings]);

  const payload = useMemo(
    (): Partial<AppSettings> => ({
      'app.name': appName,
      'app.organization': organization,
      'app.language': language,
      'app.timezone': timezone,
      'automation.browser': browser,
      'automation.headless': executionMode === 'headless',
      'automation.timeout': timeoutMs,
      'automation.autoReport': autoSaveReports,
      'automation.autoGenerate': autoGenerateScript,
      'automation.showLogs': showExecutionLogs,
    }),
    [appName, organization, language, timezone, browser, executionMode, timeoutMs, autoSaveReports, autoGenerateScript, showExecutionLogs],
  );

  const handleSave = () => {
    save.mutate(payload as Record<string, unknown>);
  };

  if (isLoading) {
    return <Center h={200}><Loader /></Center>;
  }

  return (
    <Stack gap="md">
      <SettingsSection
        icon={<IconBuilding size={20} />}
        title="Application"
        description="General information about your workspace."
      >
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput
            label="Application Name"
            value={appName}
            onChange={(e) => setAppName(e.currentTarget.value)}
            placeholder="SIMANTIK"
          />
          <TextInput
            label="Organization"
            value={organization}
            onChange={(e) => setOrganization(e.currentTarget.value)}
            placeholder="e.g. My Company"
          />
          <Select
            label="Default Language"
            data={[
              { value: 'en', label: 'English' },
              { value: 'id', label: 'Indonesian' },
            ]}
            value={language}
            onChange={(v) => setLanguage(v ?? 'en')}
            leftSection={<IconLanguage size={16} />}
          />
          <Select
            label="Timezone"
            data={[
              { value: 'Asia/Jakarta', label: 'Asia/Jakarta (WIB)' },
              { value: 'UTC', label: 'UTC' },
            ]}
            value={timezone}
            onChange={(v) => setTimezone(v ?? 'Asia/Jakarta')}
            leftSection={<IconClock size={16} />}
          />
        </SimpleGrid>
      </SettingsSection>

      <SettingsSection
        icon={<IconRobot size={20} />}
        title="Automation"
        description="Defaults used when running automated test executions."
      >
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Select
              label="Default Browser"
              data={[
                { value: 'CHROMIUM', label: 'Chromium' },
                { value: 'FIREFOX', label: 'Firefox' },
                { value: 'WEBKIT', label: 'WebKit' },
              ]}
              value={browser}
              onChange={(v) => setBrowser(v ?? 'CHROMIUM')}
              leftSection={<IconBrandChrome size={16} />}
            />
            <div>
              <Text size="sm" fw={500} mb={6} c="dimmed">
                Default Execution Mode
              </Text>
              <SegmentedControl
                fullWidth
                value={executionMode}
                onChange={(v) => setExecutionMode(v as ExecutionMode)}
                data={[
                  { value: 'headless', label: 'Headless' },
                  { value: 'headed', label: 'Headed' },
                ]}
              />
            </div>
          </SimpleGrid>

          <NumberInput
            label="Default Timeout (ms)"
            value={timeoutMs}
            onChange={(v) => setTimeoutMs(typeof v === 'number' && v > 0 ? v : 0)}
            min={0}
            step={1000}
            leftSection={<IconHourglass size={16} />}
            maw={320}
          />

          <Divider />

          <Switch
            label="Auto Save Reports"
            description="Automatically save execution reports when a run finishes."
            checked={autoSaveReports}
            onChange={(e) => setAutoSaveReports(e.currentTarget.checked)}
          />
          <Switch
            label="Automatically Generate Script"
            description="Generate a script automatically when a test case is created."
            checked={autoGenerateScript}
            onChange={(e) => setAutoGenerateScript(e.currentTarget.checked)}
          />
          <Switch
            label="Show Execution Logs"
            description="Display detailed execution logs after a run."
            checked={showExecutionLogs}
            onChange={(e) => setShowExecutionLogs(e.currentTarget.checked)}
          />
        </Stack>
      </SettingsSection>

      <Group justify="flex-end">
        <Button leftSection={<IconDeviceFloppy size={16} />} loading={save.isPending} onClick={handleSave}>
          Save Settings
        </Button>
      </Group>
    </Stack>
  );
}
