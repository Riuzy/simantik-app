'use client';

import { useEffect } from 'react';
import {
  Button, SegmentedControl, Stack, Group, SimpleGrid, Text, useMantineColorScheme, ActionIcon, Center, Loader,
} from '@mantine/core';
import { IconDeviceFloppy, IconMoonStars, IconCheck } from '@tabler/icons-react';
import { useSettings, useBulkUpsertSetting } from '../hooks';
import { SettingsSection } from './settings-section';
import {
  useAppearanceStore, AccentColor, AppearanceTheme, BorderRadiusOption, SidebarStyle,
} from '../store/appearance-store';

const ACCENT_COLORS: { value: AccentColor; label: string; css: string }[] = [
  { value: 'blue', label: 'Blue', css: '#228be6' },
  { value: 'violet', label: 'Violet', css: '#7950f2' },
  { value: 'indigo', label: 'Indigo', css: '#4c6ef5' },
  { value: 'cyan', label: 'Cyan', css: '#22b8cf' },
  { value: 'teal', label: 'Teal', css: '#20c997' },
  { value: 'green', label: 'Green', css: '#40c057' },
  { value: 'orange', label: 'Orange', css: '#fd7e14' },
  { value: 'red', label: 'Red', css: '#fa5252' },
  { value: 'pink', label: 'Pink', css: '#e64980' },
];

const THEME_OPTIONS: { value: AppearanceTheme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const RADIUS_OPTIONS: { value: BorderRadiusOption; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

const SIDEBAR_OPTIONS: { value: SidebarStyle; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'normal', label: 'Normal' },
];

export function AppearanceSettings() {
  const { data: persisted, isLoading } = useSettings();
  const save = useBulkUpsertSetting();
  const { setColorScheme } = useMantineColorScheme();

  const theme = useAppearanceStore((s) => s.theme);
  const accentColor = useAppearanceStore((s) => s.accentColor);
  const borderRadius = useAppearanceStore((s) => s.borderRadius);
  const sidebarStyle = useAppearanceStore((s) => s.sidebarStyle);
  const setTheme = useAppearanceStore((s) => s.setTheme);
  const setAccentColor = useAppearanceStore((s) => s.setAccentColor);
  const setBorderRadius = useAppearanceStore((s) => s.setBorderRadius);
  const setSidebarStyle = useAppearanceStore((s) => s.setSidebarStyle);
  const applySaved = useAppearanceStore((s) => s.applySaved);

  useEffect(() => {
    if (!persisted) return;
    const rawTheme = persisted['appearance.theme'];
    applySaved({
      theme: rawTheme === 'auto' ? 'system' : (rawTheme as AppearanceTheme),
      accentColor: persisted['appearance.accentColor'] as AccentColor,
      borderRadius: persisted['appearance.borderRadius'] as BorderRadiusOption,
      sidebarStyle: persisted['appearance.sidebarStyle'] as SidebarStyle,
    });
  }, [persisted, applySaved]);

  const handleThemeChange = (value: string) => {
    const next = value as AppearanceTheme;
    setTheme(next);
    setColorScheme(next === 'system' ? 'auto' : next);
  };

  const handleSave = () => {
    save.mutate({
      'appearance.theme': theme,
      'appearance.accentColor': accentColor,
      'appearance.borderRadius': borderRadius,
      'appearance.sidebarStyle': sidebarStyle,
    });
  };

  if (isLoading) {
    return <Center h={200}><Loader /></Center>;
  }

  return (
    <Stack gap="md">
      <SettingsSection
        icon={<IconMoonStars size={20} />}
        title="Theme"
        description="Choose how SIMANTIK looks on your screen."
      >
        <Stack gap="md">
          <div>
            <Text size="sm" fw={500} mb={6} c="dimmed">
              Theme
            </Text>
            <SegmentedControl fullWidth data={THEME_OPTIONS} value={theme} onChange={handleThemeChange} />
          </div>

          <div>
            <Text size="sm" fw={500} mb={6} c="dimmed">
              Sidebar Style
            </Text>
            <SegmentedControl
              fullWidth={false}
              data={SIDEBAR_OPTIONS}
              value={sidebarStyle}
              onChange={(v) => setSidebarStyle(v as SidebarStyle)}
            />
          </div>

          <div>
            <Text size="sm" fw={500} mb={6} c="dimmed">
              Accent Color
            </Text>
            <SimpleGrid cols={9} spacing="sm">
              {ACCENT_COLORS.map((c) => {
                const selected = accentColor === c.value;
                return (
                  <ActionIcon
                    key={c.value}
                    size={34}
                    radius="sm"
                    title={c.label}
                    aria-label={c.label}
                    style={{ backgroundColor: c.css }}
                    onClick={() => setAccentColor(c.value)}
                  >
                    {selected && <IconCheck size={18} style={{ color: '#fff' }} />}
                  </ActionIcon>
                );
              })}
            </SimpleGrid>
            <Text size="xs" c="dimmed" mt={6}>
              {ACCENT_COLORS.find((c) => c.value === accentColor)?.label}
            </Text>
          </div>

          <div>
            <Text size="sm" fw={500} mb={6} c="dimmed">
              Border Radius
            </Text>
            <SegmentedControl data={RADIUS_OPTIONS} value={borderRadius} onChange={(v) => setBorderRadius(v as BorderRadiusOption)} />
          </div>
        </Stack>
      </SettingsSection>

      <Group justify="flex-end">
        <Button leftSection={<IconDeviceFloppy size={16} />} loading={save.isPending} onClick={handleSave}>
          Save Appearance
        </Button>
      </Group>
    </Stack>
  );
}