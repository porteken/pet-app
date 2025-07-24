import { expect, test } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load the home page", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Historical PET USA/);
  });

  test("should display the map container", async ({ page }) => {
    await page.goto("/");

    const mapContainer = page.locator(".leaflet-container");
    await expect(mapContainer).toBeVisible();
  });

  test("should have navigation elements", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("header").first()).toBeVisible();
  });

  test("should handle page navigation", async ({ page }) => {
    await page.goto("/");

    const aboutButton = page.locator(
      'a[href="/about"], button:has-text("About")'
    );
    await expect(aboutButton).toBeVisible();
    await aboutButton.click();
    await expect(page).toHaveURL(/.*about/);
  });

  test("should have searchable city dropdown", async ({ page }) => {
    await page.goto("/");

    const citySearch = page.getByRole("combobox");
    await expect(citySearch).toBeVisible();
    await citySearch.click();
    const dropdown = page.getByRole("listbox");
    await expect(dropdown).toBeVisible();
  });
});
