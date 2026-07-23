import { Container } from "@mantine/core";

interface PageContainerProps {
  children: React.ReactNode;
}

export default function PageContainer({ children }: PageContainerProps) {
  return (
    <Container size="xl" py="md">
      {children}
    </Container>
  );
}
