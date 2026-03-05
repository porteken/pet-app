import { expect, type Locator, test } from "@playwright/test";

const getRequiredTextContent = async (locator: Locator): Promise<string> => {
  const text = await locator.textContent();
  expect(text).not.toBeNull();
  return text as string;
};

test.describe("City Selection", () => {
  test("should keep city selection visible on mobile viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 667, width: 375 });
    await page.goto("/");

    const citySelect = page.getByTestId("city-selector");
    await expect(citySelect).toBeVisible();
  });

  test("should display city selection dropdown on home page", async ({
    page,
  }) => {
    await page.goto("/");

    const citySelect = page.getByTestId("city-selector");
    await expect(citySelect).toBeVisible();
  });

  test("should display city selection dropdown on location page", async ({
    page,
  }) => {
    await page.goto("/1");

    const citySelect = page.getByTestId("city-selector");
    await expect(citySelect).toBeVisible({ timeout: 10_000 });
  });

  test("should navigate to selected city page", async ({ page }) => {
    await page.goto("/");

    const citySelect = page.getByTestId("city-selector");
    await expect(citySelect).toBeVisible();

    await citySelect.click();
    const firstOption = page.getByTestId("searchable-select-option").first();
    await expect(firstOption).toBeVisible();
    const firstCityValue = await firstOption.getAttribute("data-value");
    expect(firstCityValue).not.toBeNull();
    await firstOption.click();
    await expect(page).toHaveURL(
      new RegExp(String.raw`/${firstCityValue}(\?.*)?$`)
    );
  });

  test("should allow searching for cities", async ({ page }) => {
    await page.goto("/");

    const citySearch = page.getByTestId("city-selector");
    await expect(citySearch).toBeVisible({ timeout: 10_000 });

    await citySearch.click();
    const filteredOptions = page.getByTestId("searchable-select-option");
    await expect(filteredOptions.first()).toBeVisible({ timeout: 10_000 });
    const firstOptionLabel = await getRequiredTextContent(
      filteredOptions.first()
    );
    const cityQuery = firstOptionLabel.trim().slice(0, 3).toLowerCase();

    expect(cityQuery.length).toBeGreaterThan(0);

    await citySearch.fill(cityQuery);

    await expect(filteredOptions.first()).toBeVisible({ timeout: 15_000 });
    expect(await filteredOptions.count()).toBeGreaterThan(0);
    await expect(filteredOptions.first()).toContainText(
      new RegExp(cityQuery, "i")
    );
  });

  test("should allow searching for states", async ({ page }) => {
    await page.goto("/");

    const citySearch = page.getByTestId("city-selector");
    await expect(citySearch).toBeVisible({ timeout: 10_000 });

    await citySearch.click();
    const filteredOptions = page.getByTestId("searchable-select-option");
    await expect(filteredOptions.first()).toBeVisible({ timeout: 10_000 });
    const firstGroupLabel = page
      .getByTestId("searchable-select-group-label")
      .first();
    const firstStateLabel = await getRequiredTextContent(firstGroupLabel);
    const stateQuery = firstStateLabel.trim().toLowerCase();

    expect(stateQuery.length).toBeGreaterThan(0);

    await citySearch.fill(stateQuery);

    await expect(filteredOptions.first()).toBeVisible({ timeout: 15_000 });
    expect(await filteredOptions.count()).toBeGreaterThan(0);
  });
});
