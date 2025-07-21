import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load the home page", async ({ page }) => {
    await page.goto("/");

    await page.waitForLoadState("networkidle");

    await expect(page).toHaveTitle(/Historical PET USA/);
  });

  test("should display the map container", async ({ page }) => {
    await page.goto("/");

    await page.waitForSelector(".leaflet-container", { timeout: 20_000 });

    const mapContainer = page.locator(".leaflet-container");
    await expect(mapContainer).toBeVisible();
  });

  test("should have navigation elements", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("header").first()).toBeVisible();
  });

  test("should handle page navigation", async ({ page }) => {
    await page.goto("/");

    const aboutLink = page.locator('a[href="/about"]');
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await expect(page).toHaveURL(/.*about/);
    }
  });

  test("should have searchable city dropdown", async ({ page }) => {
    await page.goto("/");

    await page.waitForLoadState("networkidle");

    const citySearch = page.locator('input[role="combobox"]');
    await expect(citySearch).toBeVisible();

    await citySearch.click();

    await page.waitForSelector('[role="listbox"]', { timeout: 5000 });

    const dropdown = page.locator('[role="listbox"]');
    await expect(dropdown).toBeVisible();
  });
});
