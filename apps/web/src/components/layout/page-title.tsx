import { Box, Text } from "@mantine/core";

interface PageTitleProps {
  title: string;
  subtitle?: string;
}

export default function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <Box mb="lg">
      <Text size="xl" fw={700} mb={subtitle ? "xs" : undefined}>
        {title}
      </Text>
      {subtitle && (
        <Text size="sm" c="dimmed">
          {subtitle}
        </Text>
      )}
    </Box>
  );
}
