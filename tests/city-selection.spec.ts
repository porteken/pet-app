import { expect, test } from "@playwright/test";

test.describe("City Selection", () => {
  test("should keep city selection visible on mobile viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 667, width: 375 });
    await page.goto("/");

    await page.waitForLoadState("domcontentloaded");

    const citySelect = page.getByTestId("city-selector");
    const citySearch = page.getByRole("searchbox");
    await expect(citySelect).toBeVisible();
    await expect(citySearch).toBeVisible();
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

    const firstCityValue = await citySelect.evaluate(
      (select: HTMLSelectElement) =>
        [...select.options].find(option => option.value !== "")?.value
    );
    expect(firstCityValue).toBeDefined();
    await citySelect.selectOption(firstCityValue as string);
    await expect(page).toHaveURL(new RegExp(`/${firstCityValue}(\\?.*)?$`));
  });

  test("should allow searching for cities", async ({ page }) => {
    await page.goto("/");

    await page.waitForLoadState("domcontentloaded");

    const citySelect = page.getByTestId("city-selector");
    const citySearch = page.getByRole("searchbox");
    await expect(citySelect).toBeVisible();
    await expect(citySearch).toBeVisible();

    const firstOptionLabel = await citySelect.evaluate(
      (select: HTMLSelectElement) =>
        [...select.options].find(option => option.value !== "")?.text
    );
    expect(firstOptionLabel).toBeDefined();
    const query = (firstOptionLabel as string)
      .split(/[\s,]+/)
      .find(part => part.length >= 3)
      ?.slice(0, 3)
      .toLowerCase();

    expect(query).toBeDefined();
    await citySearch.fill(query as string);

    const filteredOptionCount = await citySelect.evaluate(
      (select: HTMLSelectElement, searchQuery: string) =>
        [...select.options].filter(
          option =>
            option.value !== "" &&
            !option.disabled &&
            option.text.toLowerCase().includes(searchQuery)
        ).length,
      query as string
    );

    expect(filteredOptionCount).toBeGreaterThan(0);
  });
});
