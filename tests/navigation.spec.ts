import { expect, test } from "@playwright/test";

test.describe("Navigation", () => {
  test("should navigate to Map page from nav button", async ({ page }) => {
    await page.goto("/");

    const mapButton = page.getByRole("link", { name: "Map" });
    await expect(mapButton).toBeVisible({ timeout: 10_000 });

    await mapButton.click();

    await expect(page).toHaveURL("/");
    await expect(page.locator(".leaflet-container")).toBeVisible();
  });

  test("should navigate to Rankings page from nav button", async ({ page }) => {
    await page.goto("/");

    const rankingsButton = page.getByRole("link", { name: /rankings/i });
    await expect(rankingsButton).toBeVisible({ timeout: 10_000 });

    await rankingsButton.click();

    await expect(page).toHaveURL("/rankings");
    await expect(
      page.getByRole("heading", { name: "Cities ranked by Average PET" })
    ).toBeVisible();
  });

  test("should navigate to About page from nav button", async ({ page }) => {
    await page.goto("/");

    const aboutButton = page.getByRole("link", { name: "About" });
    await expect(aboutButton).toBeVisible({ timeout: 10_000 });

    await aboutButton.click();

    await expect(page).toHaveURL("/about");
    await expect(page.getByText("Purpose of the Application")).toBeVisible();
  });

  test("should display GitHub link with correct attributes", async ({
    page,
  }) => {
    await page.goto("/");

    const githubLink = page.getByRole("link", { name: /github/i });
    await expect(githubLink).toBeVisible({ timeout: 10_000 });

    await expect(githubLink).toHaveAttribute("target", "_blank");
    await expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("should navigate between all main pages", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL("/about");

    await page.getByRole("link", { name: /rankings/i }).click();
    await expect(page).toHaveURL("/rankings");

    await page.getByRole("link", { name: "Map" }).click();
    await expect(page).toHaveURL("/");
  });

  test("should maintain navigation on location page", async ({ page }) => {
    await page.goto("/1");

    await expect(page.getByRole("link", { name: "Map" })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole("link", { name: /rankings/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "About" })).toBeVisible();
  });
});
