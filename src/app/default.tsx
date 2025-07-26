import { Container, Stack, Text, Title } from "@mantine/core";

export default function Default() {
  return (
    <Container py="xl" size="sm">
      <Stack align="center" gap="lg" ta="center">
        <Title order={1} size="h2">
          Default Page
        </Title>
        <Text c="dimmed" size="md">
          This is the default fallback page for parallel routes.
        </Text>
      </Stack>
    </Container>
  );
}
