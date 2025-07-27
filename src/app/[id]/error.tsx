"use client";

import { Button, Container, Stack, Text, Title } from "@mantine/core";

export default function LocationError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container py="xl" size="sm">
      <Stack align="center" gap="lg" ta="center">
        <Title c="red" order={1} size="h2">
          Location Data Error
        </Title>
        <Text c="dimmed" maw={400} size="md">
          {error.message ||
            "Failed to load the location data. The location may not exist or there was an error retrieving the data."}
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
