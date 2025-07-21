import { test, expect } from "@playwright/test";

test.describe("About Page", () => {
  test("should load the about page", async ({ page }) => {
    await page.goto("/about");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Check that we're on the about page
    await expect(page).toHaveURL(/.*about/);
  });

  test("should display about page content", async ({ page }) => {
    await page.goto("/about");

    // Wait for content to load
    await page.waitForLoadState("networkidle");

    // Check for the header first, then look for content
    await expect(page.locator("header").first()).toBeVisible();

    // Look for any content on the page
    const mainContent = page
      .locator("main, div")
      .filter({ hasText: /Purpose|PET|Application/ });
    await expect(mainContent.first()).toBeVisible();
  });

  test("should have navigation back to home", async ({ page }) => {
    await page.goto("/about");

    // Look for the Map link that navigates back to home
    const mapLink = page.locator('a[href="/"]').filter({ hasText: "Map" });

    if (await mapLink.isVisible()) {
      await mapLink.click();
      await expect(page).toHaveURL(/^http:\/\/localhost:3000\/?$/);
    }
  });
});
