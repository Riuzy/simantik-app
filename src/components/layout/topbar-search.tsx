'use client';

import { useState, useEffect, useRef } from 'react';
import { TextInput, Popover, UnstyledButton, Group, Text, Loader, Kbd } from '@mantine/core';
import { IconSearch, IconExternalLink } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useTestCases } from '../../features/test-cases/hooks';
import { useDebouncedValue } from '@mantine/hooks';

export function TopbarSearch() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [debounced] = useDebouncedValue(value, 300);
  const [opened, setOpened] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isFetching } = useTestCases('', {
    search: debounced || undefined,
    limit: 8,
    page: 1,
  });

  const results = data?.data ?? [];
  const showDropdown = opened && debounced.length > 0;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const goTo = (slug: string, code: string) => {
    setOpened(false);
    setValue('');
    router.push(`/projects/${slug}/test-cases/${code}`);
  };

  return (
    <Popover opened={showDropdown} onChange={setOpened} width={480} position="bottom-start" shadow="md">
      <Popover.Target>
        <TextInput
          ref={inputRef}
          placeholder="Search test cases..."
          leftSection={<IconSearch size={16} />}
          rightSection={
            debounced.length > 0 && isFetching ? (
              <Loader size={14} />
            ) : (
              <Kbd size="xs" style={{ opacity: 0.6 }}>Ctrl K</Kbd>
            )
          }
          size="sm"
          value={value}
          onChange={(e) => {
            setValue(e.currentTarget.value);
            setOpened(true);
          }}
          onFocus={() => debounced.length > 0 && setOpened(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpened(false);
            if (e.key === 'Enter' && results.length > 0) {
              const first = results[0];
              if (first.project?.slug) goTo(first.project.slug, first.code);
            }
          }}
          w={{ sm: 240, md: 340 }}
          visibleFrom="sm"
          styles={{ input: { fontWeight: 400 } }}
        />
      </Popover.Target>

      <Popover.Dropdown p={4}>
        {isFetching ? (
          <Group px="md" py="sm"><Loader size={16} /> <Text size="sm" c="dimmed">Searching...</Text></Group>
        ) : results.length === 0 ? (
          <Text size="sm" c="dimmed" px="md" py="sm">No test cases found</Text>
        ) : (
          <div>
            {results.map((tc) => (
              <UnstyledButton
                key={tc.id}
                onClick={() => tc.project?.slug && goTo(tc.project.slug, tc.code)}
                style={{
                  display: 'flex',
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Group justify="space-between" w="100%" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap">
                    <Text size="xs" ff="monospace" c="dimmed" fw={600}>{tc.code}</Text>
                    <Text size="sm" fw={500} lineClamp={1}>{tc.title}</Text>
                  </Group>
                  <IconExternalLink size={14} style={{ opacity: 0.4 }} />
                </Group>
              </UnstyledButton>
            ))}
          </div>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}
