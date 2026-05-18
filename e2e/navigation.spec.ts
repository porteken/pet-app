import { expect, test } from "@playwright/test";

import {
  MAP_CONTAINER_SELECTOR,
  gotoAndWaitForMapPage,
  waitForMapPage,
} from "./utils/map-page";

const NAVIGATION_TIMEOUT = 30_000;

test.describe("Navigation", () => {
  test("should navigate between all main pages", async ({ page }) => {
    await gotoAndWaitForMapPage(page, "/");

    await page.getByRole("link", { name: "Navigate to about page" }).click();
    await expect(page).toHaveURL("/about", { timeout: NAVIGATION_TIMEOUT });
    await expect(page.getByText("Purpose of the Application")).toBeVisible();

    await page.getByRole("link", { name: "Navigate to rankings page" }).click();
    await expect(page).toHaveURL("/rankings", { timeout: NAVIGATION_TIMEOUT });
    await expect(
      page.getByRole("heading", { name: "Cities ranked by Average PET" }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Navigate to map view" }).click();
    await expect(page).toHaveURL("/", { timeout: NAVIGATION_TIMEOUT });
    await waitForMapPage(page);
  });

  test("should navigate away from a location page", async ({ page }) => {
    await page.goto("/1");
    await expect(
      page.getByRole("heading", { name: "Trend Analysis" }),
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page.getByRole("link", { name: "Navigate to rankings page" }),
    ).toBeVisible({ timeout: 10_000 });

    await page.getByRole("link", { name: "Navigate to rankings page" }).click();

    await expect(page).toHaveURL("/rankings", { timeout: NAVIGATION_TIMEOUT });
    await expect(
      page.getByRole("heading", { name: "Cities ranked by Average PET" }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Navigate to map view" }).click();
    await expect(page).toHaveURL("/", { timeout: NAVIGATION_TIMEOUT });
    await expect(page.locator(MAP_CONTAINER_SELECTOR)).toBeVisible({
      timeout: NAVIGATION_TIMEOUT,
    });
    await waitForMapPage(page);
  });
});
