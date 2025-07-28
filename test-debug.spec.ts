import { expect, test } from "@playwright/test";

test("Debug: marker click with desktop viewport", async ({ page }) => {
  // Use desktop viewport
  await page.setViewportSize({ height: 1024, width: 1280 });

  await page.goto("/");

  await expect(page.locator(".leaflet-container")).toBeVisible();
  await expect(page.getByText("Loading map...")).toBeHidden();

  const marker = page.locator(".leaflet-marker-icon").first();
  await marker.waitFor({ state: "visible" });

  await marker.click({ force: true });

  const viewDetailsButton = page.getByRole("button", {
    name: "View Full Details",
  });
  await expect(viewDetailsButton).toBeVisible({ timeout: 10_000 });
});

test("Debug: marker click with mobile viewport", async ({ page }) => {
  // Use mobile viewport
  await page.setViewportSize({ height: 667, width: 375 });

  await page.goto("/");

  await expect(page.locator(".leaflet-container")).toBeVisible();
  await expect(page.getByText("Loading map...")).toBeHidden();

  const marker = page.locator(".leaflet-marker-icon").first();
  await marker.waitFor({ state: "visible" });

  await marker.click({ force: true });

  const viewDetailsButton = page.getByRole("button", {
    name: "View Full Details",
  });
  await expect(viewDetailsButton).toBeVisible({ timeout: 10_000 });
});
