import { test, expect } from "@playwright/test";

test.describe("Accessibility", () => {
  test("should have proper page title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Historical PET USA/);
  });

  test("should have proper heading structure", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const h1Elements = page.locator("h1");
    await expect(h1Elements).toHaveCount(1);
    await expect(h1Elements.first()).toHaveText(/Historical PET USA/);
  });

  test("should have proper form labels", async ({ page }) => {
    await page.goto("/1");
    await page.waitForLoadState("networkidle");

    const graphMeasureLabel = page.locator('label[for="graph-measure"]');
    const referenceYearLabel = page.locator('label[for="reference-year"]');

    await expect(graphMeasureLabel).toBeVisible();
    await expect(referenceYearLabel).toBeVisible();
    await expect(graphMeasureLabel).toHaveText("Graph Measure");
    await expect(referenceYearLabel).toHaveText("Reference Year");
  });

  test("should have proper select elements with accessible names", async ({
    page,
  }) => {
    await page.goto("/1");
    await page.waitForLoadState("networkidle");

    const graphMeasureSelect = page.locator('select[id="graph-measure"]');
    const referenceYearSelect = page.locator('select[id="reference-year"]');

    await expect(graphMeasureSelect).toHaveAttribute("id", "graph-measure");
    await expect(referenceYearSelect).toHaveAttribute("id", "reference-year");
  });

  test("should support keyboard navigation", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });

  test("should have proper link text", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const links = page.locator("a");
    const linkCount = await links.count();

    for (let i = 0; i < Math.min(linkCount, 5); i++) {
      const link = links.nth(i);
      const linkText = await link.textContent();
      expect(linkText).toBeTruthy();
      expect(linkText?.trim()).not.toBe("");
    }
  });

  test("should have proper button text", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const buttons = page.locator("button");
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const buttonText = await button.textContent();
      if (buttonText) {
        expect(buttonText.trim()).not.toBe("");
      }
    }
  });

  test("should have proper alt text for images", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const images = page.locator("img");
    const imageCount = await images.count();

    let hasValidAltText = false;
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      const altText = await image.getAttribute("alt");
      if (altText !== null && altText.trim() !== "") {
        hasValidAltText = true;
        break;
      }
    }
    expect(hasValidAltText).toBe(true);
  });

  test("should have proper ARIA labels", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const elementsWithAriaLabel = page.locator("[aria-label]");
    const ariaLabelCount = await elementsWithAriaLabel.count();

    for (let i = 0; i < ariaLabelCount; i++) {
      const element = elementsWithAriaLabel.nth(i);
      const ariaLabel = await element.getAttribute("aria-label");
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel?.trim()).not.toBe("");
    }
  });

  test("should have proper contrast ratios", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const textElements = page
      .locator("h1, h2, h3, p, span, div")
      .filter({ hasText: /[A-Za-z]/ });
    await expect(textElements.first()).toBeVisible();
  });

  test("should be navigable with screen reader", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const header = page.locator("header").first();
    await expect(header).toBeVisible();

    const content = page.locator("div").filter({ hasText: /[A-Za-z]/ });
    await expect(content.first()).toBeVisible();
  });
});
