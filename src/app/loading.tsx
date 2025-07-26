import { Container, Loader, Stack, Text } from "@mantine/core";

export default function Loading() {
  return (
    <Container py="xl" size="sm">
      <Stack align="center" gap="lg" ta="center">
        <Loader size="lg" />
        <Text c="dimmed" size="md">
          Loading...
        </Text>
      </Stack>
    </Container>
  );
}
