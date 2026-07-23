import { Group, Box, TextInput, ActionIcon } from "@mantine/core";
import { IconSearch, IconUser } from "@tabler/icons-react";
import Logo from "./logo";

export default function AppHeader() {
  return (
    <Group h="100%" px="md" justify="space-between">
      <Logo />
      <Box style={{ flex: 1, maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
        <TextInput
          placeholder="Search..."
          leftSection={<IconSearch size={16} />}
          disabled
        />
      </Box>
      <ActionIcon variant="default" size="lg">
        <IconUser size={20} />
      </ActionIcon>
    </Group>
  );
}
