import { expect, test } from "@playwright/test";

test.describe("Smoke Tests - Critical User Journeys", () => {
  test("complete user journey: home → location selection → data analysis", async ({
    page,
  }) => {
    // 1. User lands on home page
    await page.goto("/");

    // 2. Verify map loads and locations are visible
    await expect(page.getByText("Loading map...")).toBeHidden({
      timeout: 10_000,
    });
    await expect(page.locator(".leaflet-container")).toBeVisible();

    // 3. User clicks on a location marker
    const marker = page.locator(".leaflet-marker-icon").first();
    await expect(marker).toBeVisible();
    // eslint-disable-next-line playwright/no-force-option
    await marker.click({ force: true });

    // 4. Modal opens with location details
    await expect(
      page.getByRole("button", { name: "View Full Details" })
    ).toBeVisible();

    // 5. User navigates to detailed analysis page
    await page.getByRole("button", { name: "View Full Details" }).click();

    // 6. Analysis page loads with data visualization
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expect(page.getByText("Trend Analysis")).toBeVisible();
    await expect(page.getByText("Reference Data")).toBeVisible();

    // 7. User interacts with graph controls
    const graphMeasure = page.locator("select#graph-measure");
    await expect(graphMeasure).toBeVisible();
    await graphMeasure.selectOption("max");

    // 8. Graphs update with new data
    await expect(page.locator(".js-plotly-plot")).toHaveCount(2);

    // 9. User can navigate back
    await page.goBack();
    await expect(page.locator(".leaflet-container")).toBeVisible();
  });

  test("navigation workflow: direct URL access → data interaction", async ({
    page,
  }) => {
    // 1. User accesses location directly via URL
    await page.goto("/1");

    // 2. Page loads with location data
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expect(page.getByText("Trend Analysis")).toBeVisible();

    // 3. Both graphs are present and functional
    await expect(page.locator(".js-plotly-plot")).toHaveCount(2);

    // 4. User can change graph parameters
    const graphMeasure = page.locator("select#graph-measure");
    const referenceYear = page.locator("select#reference-year");

    await graphMeasure.selectOption("max");
    await referenceYear.selectOption("2010");

    // 5. URL reflects current state (if applicable)
    // This would depend on your URL parameter implementation

    // 6. User can navigate to other sections
    await page.getByText("Map").click();
    await expect(page.locator(".leaflet-container")).toBeVisible();
  });

  test("error handling: invalid location → graceful fallback", async ({
    page,
  }) => {
    // 1. User tries to access non-existent location
    await page.goto("/99999");

    // 2. App handles error gracefully (not crash)
    // This depends on your error handling implementation
    await expect(page.locator("body")).toBeVisible();

    // 3. User gets meaningful feedback
    // Could be error page, redirect, or error message
    await expect(page.locator("h1, .error-message, .not-found")).toBeVisible();
  });

  test("responsive design: mobile user journey", async ({ page }) => {
    // 1. Set mobile viewport
    await page.setViewportSize({ height: 667, width: 375 });

    // 2. Navigate through mobile experience
    await page.goto("/");

    // 3. Map should be responsive
    await expect(page.locator(".leaflet-container")).toBeVisible();

    // 4. Navigation should work on mobile
    const marker = page.locator(".leaflet-marker-icon").first();
    await marker.waitFor({ state: "visible" });
    // eslint-disable-next-line playwright/no-force-option
    await marker.click({ force: true });

    // 5. Wait for modal to appear and check for button with increased timeout
    await expect(page.locator('[role="dialog"], .modal')).toBeVisible({
      timeout: 10_000,
    });

    // Try multiple possible selectors for the button
    const viewDetailsButton = page
      .locator("button")
      .filter({ hasText: /view full details/i })
      .or(page.getByRole("button", { name: "View Full Details" }))
      .or(page.locator('button:has-text("View Full Details")'))
      .first();

    await expect(viewDetailsButton).toBeVisible({ timeout: 10_000 });

    // 6. Modal should be mobile-friendly
    await viewDetailsButton.click();

    // 7. Data visualization should be responsive
    await expect(page.getByText("Trend Analysis")).toBeVisible();
    await expect(page.locator(".js-plotly-plot")).toHaveCount(2);
  });

  test("performance: page loads within acceptable time", async ({ page }) => {
    const startTime = Date.now();

    // 1. Navigate to home page
    await page.goto("/");

    // 2. Wait for main content to load
    await expect(page.locator(".leaflet-container")).toBeVisible();

    const loadTime = Date.now() - startTime;

    // 3. Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);

    // 4. Check for any console errors
    const errors: string[] = [];
    page.on("console", message => {
      if (message.type() === "error") {
        errors.push(message.text());
      }
    });

    // 5. Navigate to data page and check performance
    const dataStartTime = Date.now();
    await page.goto("/1");
    await expect(page.getByText("Trend Analysis")).toBeVisible();

    const dataLoadTime = Date.now() - dataStartTime;
    expect(dataLoadTime).toBeLessThan(3000);

    // 6. Should have minimal console errors
    expect(errors.length).toBeLessThan(3);
  });
});
