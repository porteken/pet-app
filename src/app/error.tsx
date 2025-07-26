"use client";

import { Alert, Button, Container, Stack, Text, Title } from "@mantine/core";

export default function Error({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <Container py="xl" size="sm">
      <Stack align="center" gap="lg" ta="center">
        <Title c="red" order={1} size="h2">
          Something went wrong!
        </Title>
        <Text c="dimmed" maw={400} size="md">
          {error.message}
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

          <Alert color="blue" title="Need help?" variant="light">
            <Text size="sm">
              Contact Kenneth Porter at{" "}
              <a
                href="mailto:porteken@gmail.com"
                style={{
                  color: "var(--mantine-color-blue-6)",
                  textDecoration: "underline",
                }}
              >
                porteken@gmail.com
              </a>
            </Text>
          </Alert>
        </Stack>
      </Stack>
    </Container>
  );
}
