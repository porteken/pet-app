import { expect, test } from "@playwright/test";

test.describe("About Page", () => {
  test("should display about page content", async ({ page }) => {
    await page.goto("/about");

    // Look for any content on the page
    const mainContent = page
      .locator("main, div")
      .filter({ hasText: /Purpose|PET|Application/ });
    await expect(mainContent.first()).toBeVisible();
  });

  test("should have navigation back to home", async ({ page }) => {
    await page.goto("/about");

    // Look for the Map link that navigates back to home
    const mapButton = page.locator('a[href="/"], button:has-text("Map")');
    await expect(mapButton).toBeVisible();
    await mapButton.click();
    await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/?$/);
  });
});
