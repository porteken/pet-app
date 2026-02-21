import { expect, test } from "@playwright/test";

test.describe("City Selection", () => {
  test("should keep city selection visible on mobile viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 667, width: 375 });
    await page.goto("/");

    await page.waitForLoadState("domcontentloaded");

    const citySelect = page.locator("[placeholder*='City']").first();
    await expect(citySelect).toBeVisible();
  });

  test("should display city selection dropdown on home page", async ({
    page,
  }) => {
    await page.goto("/");

    await page.waitForLoadState("domcontentloaded");

    const citySelect = page.locator("[placeholder*='City']").first();
    await expect(citySelect).toBeVisible();
  });

  test("should display city selection dropdown on location page", async ({
    page,
  }) => {
    await page.goto("/1");

    await page.waitForLoadState("domcontentloaded");

    const citySelect = page.locator("[placeholder*='City']").first();
    await expect(citySelect).toBeVisible();
  });

  test("should navigate to selected city page", async ({ page }) => {
    await page.goto("/");

    await page.waitForLoadState("domcontentloaded");

    const citySelect = page.locator("[placeholder*='City']").first();
    await expect(citySelect).toBeVisible();

    await citySelect.click();

    const options = page.locator("[role='option']");
    await options.first().waitFor({ timeout: 5000 });

    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(0);

    const firstOption = page.locator("[role='option']").first();
    await firstOption.click();

    await expect(page).toHaveURL(/\/\d+/);
  });

  test("should allow searching for cities", async ({ page }) => {
    await page.goto("/");

    await page.waitForLoadState("domcontentloaded");

    const citySelect = page.locator("[placeholder*='City']").first();
    await expect(citySelect).toBeVisible();

    await citySelect.fill("New York");

    await citySelect.click();

    const options = page.locator("[role='option']");
    await options.first().waitFor({ timeout: 5000 });

    const filteredOptions = page
      .locator("[role='option']")
      .filter({ hasText: "New York" });
    const optionCount = await filteredOptions.count();
    expect(optionCount).toBeGreaterThan(0);
  });
});
