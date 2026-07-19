import type { Page, Response } from "@playwright/test";

const DEFAULT_RESPONSE_TIMEOUT = 15_000;

type DataEndpoint = "forecast" | "reference" | "trend";

export function waitForDataResponse(
  page: Page,
  endpoint: DataEndpoint,
  params: Record<string, string>,
): Promise<Response> {
  return page.waitForResponse(
    (response) => {
      const url = new URL(response.url());

      if (!url.pathname.endsWith(`/api/data/${endpoint}`)) {
        return false;
      }

      const matchesParams = Object.entries(params).every(
        ([key, value]) => url.searchParams.get(key) === value,
      );

      return matchesParams && response.ok();
    },
    { timeout: DEFAULT_RESPONSE_TIMEOUT },
  );
}
