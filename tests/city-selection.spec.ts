import { expect, test } from "@playwright/test";

test.describe("City Selection", () => {
  test("should keep city selection visible on mobile viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 667, width: 375 });
    await page.goto("/");

    await page.waitForLoadState("domcontentloaded");

    const citySelect = page.getByTestId("city-selector");
    await expect(citySelect).toBeVisible();
    await expect(page.getByRole("searchbox")).toBeVisible();
  });

  test("should display city selection dropdown on home page", async ({
    page,
  }) => {
    await page.goto("/");

    await page.waitForLoadState("domcontentloaded");

    const citySelect = page.getByTestId("city-selector");
    await expect(citySelect).toBeVisible();
  });

  test("should display city selection dropdown on location page", async ({
    page,
  }) => {
    await page.goto("/1");

    await page.waitForLoadState("domcontentloaded");

    const citySelect = page.getByTestId("city-selector");
    await expect(citySelect).toBeVisible();
  });

  test("should navigate to selected city page", async ({ page }) => {
    await page.goto("/");

    await page.waitForLoadState("domcontentloaded");

    const citySelect = page.getByTestId("city-selector");
    await expect(citySelect).toBeVisible();

    await citySelect.click();
    const firstOption = page.getByTestId("searchable-select-option").first();
    await expect(firstOption).toBeVisible();
    const firstCityValue = await firstOption.getAttribute("data-value");
    expect(firstCityValue).toBeDefined();
    await firstOption.click();
    await expect(page).toHaveURL(new RegExp(`/${firstCityValue}(\\?.*)?$`));
  });

  test("should allow searching for cities", async ({ page }) => {
    await page.goto("/");

    await page.waitForLoadState("domcontentloaded");

    const citySearch = page.getByRole("searchbox");
    await expect(citySearch).toBeVisible();

    await citySearch.click();
    await citySearch.fill("new");

    const filteredOptions = page.getByTestId("searchable-select-option");
    await expect(filteredOptions.first()).toBeVisible();
    expect(await filteredOptions.count()).toBeGreaterThan(0);
  });

  test("should allow searching for states", async ({ page }) => {
    await page.goto("/");

    await page.waitForLoadState("domcontentloaded");

    const citySearch = page.getByRole("searchbox");
    await expect(citySearch).toBeVisible();

    await citySearch.click();
    await citySearch.fill("california");

    const filteredOptions = page.getByTestId("searchable-select-option");
    await expect(filteredOptions.first()).toBeVisible();
    expect(await filteredOptions.count()).toBeGreaterThan(0);
  });
});
