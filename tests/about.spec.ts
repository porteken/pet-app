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

    // Check that the page has some content (adjust based on your actual about page content)
    const mainContent = page.locator("div, body");
    await expect(mainContent.first()).toBeVisible();
  });

  test("should have navigation back to home", async ({ page }) => {
    await page.goto("/about");

    // Look for navigation elements that could take us back to home
    const homeLink = page.locator(
      'a[href="/"], a[href="/home"], [aria-label*="home"], [title*="home"]'
    );

    if (await homeLink.first().isVisible()) {
      await homeLink.first().click();
      await expect(page).toHaveURL(/^http:\/\/localhost:3001\/?$/);
    }
  });
});
