import { Container, Center, Box } from "@mantine/core";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <Container size="xs" h="100vh">
      <Center h="100%">
        <Box w="100%">{children}</Box>
      </Center>
    </Container>
  );
}
