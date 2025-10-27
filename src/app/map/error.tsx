"use client";

import { Button, Container, Stack, Text, Title } from "@mantine/core";

export default function MapError({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  return (
    <Container py="xl" size="sm">
      <Stack align="center" gap="lg" ta="center">
        <Title c="red" order={1} size="h2">
          Map Error
        </Title>
        <Text c="dimmed" maw={400} size="md">
          {error.message ||
            "An error occurred while loading the map data or rendering the map."}
        </Text>

        <Stack gap="sm" maw={400} w="100%">
          <Button
            color="blue"
            fullWidth
            onClick={() => reset()}
            size="md"
            variant="filled"
          >
            Try again
          </Button>
          <Button
            color="gray"
            component="a"
            fullWidth
            href="/"
            size="md"
            variant="outline"
          >
            Return to homepage
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
