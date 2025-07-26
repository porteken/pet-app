import { Container, Stack, Text, Title } from "@mantine/core";

export default function NotFound() {
  return (
    <Container py="xl" size="sm">
      <Stack align="center" gap="lg" ta="center">
        <Title order={1} size="h2">
          404 - Not Found
        </Title>
        <Text c="dimmed" size="md">
          The page you are looking for does not exist.
        </Text>
      </Stack>
    </Container>
  );
}
