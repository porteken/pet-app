import { expect, test } from "./fixtures";
import {
  MAP_CONTAINER_SELECTOR,
  gotoAndWaitForMapPage,
  waitForLocationDetailsPage,
  waitForMapPage,
} from "./utils/map-page";
import { RANKINGS_HEADING } from "./utils/rankings-page";

import type { Page } from "@playwright/test";

const NAVIGATION_TIMEOUT = 30_000;

const navigateToRankingsPage = async (page: Page) => {
  await page.getByRole("link", { name: "Navigate to rankings page" }).click();
  await expect(page).toHaveURL("/rankings", { timeout: NAVIGATION_TIMEOUT });
  await expect(page.getByRole("heading", RANKINGS_HEADING)).toBeVisible();
};

const navigateToMapView = async (page: Page) => {
  await page.getByRole("link", { name: "Navigate to map view" }).click();
  await expect(page).toHaveURL("/", { timeout: NAVIGATION_TIMEOUT });
  await waitForMapPage(page);
};

test.describe("Navigation", () => {
  test("should navigate between all main pages", async ({ page }) => {
    await gotoAndWaitForMapPage(page, "/");

    await page.getByRole("link", { name: "Navigate to about page" }).click();
    await expect(page).toHaveURL("/about", { timeout: NAVIGATION_TIMEOUT });
    await expect(page.getByText("Purpose of the Application")).toBeVisible();

    await navigateToRankingsPage(page);
    await navigateToMapView(page);

    await page.goto("/1");
    await waitForLocationDetailsPage(page, /\/1(?:\?.*)?$/u);
    await expect(
      page.getByRole("link", { name: "Navigate to rankings page" }),
    ).toBeVisible({ timeout: 10_000 });

    await navigateToRankingsPage(page);
    await navigateToMapView(page);
    await expect(page.locator(MAP_CONTAINER_SELECTOR)).toBeVisible({
      timeout: NAVIGATION_TIMEOUT,
    });
  });

  test("should toggle and persist the color theme", async ({ page }) => {
    await page.goto("/about");

    const themeToggle = page.getByRole("button", {
      name: /switch to (?<theme>dark|light) mode/iu,
    });
    await expect(themeToggle).toBeVisible();

    const isDarkMode = () =>
      page
        .locator("html")
        .evaluate((element) => element.classList.contains("dark"));

    const hadDark = await isDarkMode();

    await themeToggle.click();
    await expect.poll(isDarkMode, { timeout: 5000 }).toBe(!hadDark);
    await expect(themeToggle).toHaveAccessibleName(
      hadDark ? /switch to dark mode/iu : /switch to light mode/iu,
    );

    await page.reload();

    await expect.poll(isDarkMode).toBe(!hadDark);
  });
});
