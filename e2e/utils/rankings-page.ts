import { expect, type Locator, type Page } from "@playwright/test";

const RANKINGS_HEADING_TIMEOUT = 15_000;

export const RANKINGS_HEADING = {
  name: "Cities ranked by Average PET",
} as const;

export async function gotoRankingsPage(page: Page): Promise<void> {
  await page.goto("/rankings", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", RANKINGS_HEADING)).toBeVisible({
    timeout: RANKINGS_HEADING_TIMEOUT,
  });

  await expect(getFirstRow(page)).toBeVisible({
    timeout: RANKINGS_HEADING_TIMEOUT,
  });
}

export function getFirstRow(page: Page): Locator {
  return page.locator("table tbody tr").first();
}

/**
 * Expands the thermal-stress legend when it is collapsed behind a toggle.
 *
 * The legend is always shown on wide (xl) viewports but collapses behind a
 * toggle button on narrower ones; expanding it first keeps legend assertions
 * valid on every viewport.
 */
export async function expandHeatStressLegend(page: Page): Promise<void> {
  const legendToggle = page.getByRole("button", {
    name: /Thermal Stress Index/u,
  });

  if (await legendToggle.isVisible().catch(() => false)) {
    await legendToggle.click();
  }
}
