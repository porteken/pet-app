import { expect, test } from "@playwright/test";

import { gotoAndWaitForMapPage, waitForMapPage } from "./utils/map-page";

test.describe("Navigation", () => {
  test("should navigate to Map page from nav button", async ({ page }) => {
    await gotoAndWaitForMapPage(page, "/");

    const mapButton = page.getByRole("link", { name: "Navigate to map view" });
    await expect(mapButton).toBeVisible({ timeout: 10_000 });

    await mapButton.click();

    await expect(page).toHaveURL("/");
    await expect(page.locator(".leaflet-container")).toBeVisible();
  });

  test("should navigate to Rankings page from nav button", async ({ page }) => {
    await gotoAndWaitForMapPage(page, "/");

    const rankingsButton = page.getByRole("link", {
      name: "Navigate to rankings page",
    });
    await expect(rankingsButton).toBeVisible({ timeout: 10_000 });

    await rankingsButton.click();

    await expect(page).toHaveURL("/rankings");
    await expect(
      page.getByRole("heading", { name: "Cities ranked by Average PET" }),
    ).toBeVisible();
  });

  test("should navigate to About page from nav button", async ({ page }) => {
    await gotoAndWaitForMapPage(page, "/");

    const aboutButton = page.getByRole("link", {
      name: "Navigate to about page",
    });
    await expect(aboutButton).toBeVisible({ timeout: 10_000 });

    await aboutButton.click();

    await expect(page).toHaveURL("/about");
    await expect(page.getByText("Purpose of the Application")).toBeVisible();
  });

  test("should display GitHub link with correct attributes", async ({
    page,
  }) => {
    await page.goto("/");

    const githubLink = page.getByRole("link", { name: /github/i }).first();
    await expect(githubLink).toBeVisible({ timeout: 10_000 });

    await expect(githubLink).toHaveAttribute("target", "_blank");
    await expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("should navigate between all main pages", async ({ page }) => {
    await gotoAndWaitForMapPage(page, "/");

    await page.getByRole("link", { name: "Navigate to about page" }).click();
    await expect(page).toHaveURL("/about");
    await expect(page.getByText("Purpose of the Application")).toBeVisible();

    await page.getByRole("link", { name: "Navigate to rankings page" }).click();
    await expect(page).toHaveURL("/rankings");
    await expect(
      page.getByRole("heading", { name: "Cities ranked by Average PET" }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Navigate to map view" }).click();
    await expect(page).toHaveURL("/");
    await waitForMapPage(page);
  });

  test("should maintain navigation on location page", async ({ page }) => {
    await page.goto("/1");

    await expect(
      page.getByRole("link", { name: "Navigate to map view" }),
    ).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByRole("link", { name: "Navigate to rankings page" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Navigate to about page" }),
    ).toBeVisible();
  });

  test("should display about content", async ({ page }) => {
    await page.goto("/about");

    await expect(page.getByText("Purpose of the Application")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("What is PET?")).toBeVisible();
    await expect(
      page.locator("text=Physiological Equivalent Temperature").first(),
    ).toBeVisible();
  });

  test("should have a link to the PET study", async ({ page }) => {
    await page.goto("/about");
    const link = page.getByRole("link", { name: "this" });
    await expect(link).toHaveAttribute(
      "href",
      "https://bjsm.bmj.com/content/55/15/825",
      {
        timeout: 10_000,
      },
    );
  });
});
