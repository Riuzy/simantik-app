import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }: Props) {
  return (
    <TextInput
      placeholder={placeholder}
      leftSection={<IconSearch size={16} />}
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      style={{ maxWidth: 320 }}
    />
  );
}
