"use client";

import { Button, Container, Stack, Text, Title } from "@mantine/core";

export default function ErrorPage({
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
          Something went wrong!
        </Title>
        <Text c="dimmed" maw={400} size="md">
          {error.message || "An unexpected error occurred"}
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

          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>Need help?</strong> Contact Kenneth Porter at{" "}
              <a
                className="text-blue-600 underline hover:text-blue-800"
                href="mailto:porteken@gmail.com"
              >
                porteken@gmail.com
              </a>
            </p>
          </div>
        </Stack>
      </Stack>
    </Container>
  );
}
