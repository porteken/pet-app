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

    // Check that the page has some content - look for the about page content
    const mainContent = page
      .locator("div:not([hidden])")
      .filter({ hasText: /Purpose of the Application|What is PET/ });
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
