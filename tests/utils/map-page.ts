import { expect, type Locator, type Page } from "@playwright/test";

import { clickClickableMarker } from "./map-marker";

const MAP_LOAD_TIMEOUT = 30_000;
const LOCATION_DETAILS_TIMEOUT = 45_000;
const MODAL_TIMEOUT = 10_000;

export async function gotoAndWaitForMapPage(
  page: Page,
  route: string,
): Promise<void> {
  await page.goto(route);
  await waitForMapPage(page);
}

export async function navigateToLocationDetailsFromMap(
  page: Page,
  route: string,
): Promise<void> {
  await gotoAndWaitForMapPage(page, route);

  const { viewDetailsButton } = await openLocationDetailsModal(page);

  await expect(viewDetailsButton).toBeEnabled({ timeout: MODAL_TIMEOUT });
  await viewDetailsButton.click();
  await waitForLocationDetailsPage(page);
}

export async function openLocationDetailsModal(
  page: Page,
): Promise<{ modal: Locator; viewDetailsButton: Locator }> {
  await clickClickableMarker(page);

  const modal = page.getByRole("dialog");
  const viewDetailsButton = page.getByRole("button", {
    name: "View Full Details",
  });

  await expect(modal).toBeVisible({ timeout: MODAL_TIMEOUT });
  await expect(viewDetailsButton).toBeVisible({ timeout: MODAL_TIMEOUT });

  return { modal, viewDetailsButton };
}

export async function waitForMapPage(page: Page): Promise<void> {
  await expect(page.getByText("Loading map...").first()).toBeHidden({
    timeout: MAP_LOAD_TIMEOUT,
  });
  await expect(page.locator(".leaflet-container")).toBeVisible();
}

export async function waitForLocationDetailsPage(
  page: Page,
  urlPattern = /\/\d+(?:\?.*)?$/,
): Promise<void> {
  await expect(page).toHaveURL(urlPattern, {
    timeout: LOCATION_DETAILS_TIMEOUT,
  });

  if (
    await page
      .getByRole("heading", { name: "Database Connection Error" })
      .isVisible()
      .catch(() => false)
  ) {
    await page.reload();
    await expect(page).toHaveURL(urlPattern, {
      timeout: LOCATION_DETAILS_TIMEOUT,
    });
  }

  await expect(
    page.getByRole("heading", { level: 2, name: "Trend Analysis" }),
  ).toBeVisible({
    timeout: LOCATION_DETAILS_TIMEOUT,
  });
  await expect(
    page.getByRole("heading", { level: 2, name: "Reference Data" }),
  ).toBeVisible({
    timeout: LOCATION_DETAILS_TIMEOUT,
  });
  await expect(page.locator("select#graph-measure")).toBeVisible({
    timeout: LOCATION_DETAILS_TIMEOUT,
  });
  await expect(page.locator("select#reference-year")).toBeVisible({
    timeout: LOCATION_DETAILS_TIMEOUT,
  });
  await expect(page.locator(".js-plotly-plot")).toHaveCount(2, {
    timeout: LOCATION_DETAILS_TIMEOUT,
  });
}
