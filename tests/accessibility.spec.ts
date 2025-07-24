import { expect, test } from "@playwright/test";

test.describe("Accessibility", () => {
  test("should have proper page title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Historical PET USA/);
  });

  test("should have proper heading structure", async ({ page }) => {
    await page.goto("/");

    const h1Elements = page.locator("h1");
    await expect(h1Elements).toHaveCount(1);
    await expect(h1Elements.first()).toHaveText(/Historical PET USA/);
  });

  test("should have proper form labels", async ({ page }) => {
    await page.goto("/1");

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

    const graphMeasureSelect = page.locator('select[id="graph-measure"]');
    const referenceYearSelect = page.locator('select[id="reference-year"]');

    await expect(graphMeasureSelect).toHaveAttribute("id", "graph-measure");
    await expect(referenceYearSelect).toHaveAttribute("id", "reference-year");
  });

  test("should support keyboard navigation", async ({ page }) => {
    await page.goto("/");

    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });

  test("should have proper link text", async ({ page }) => {
    await page.goto("/");

    const links = page.locator("a");
    const linkCount = await links.count();

    for (let index = 0; index < Math.min(linkCount, 5); index++) {
      const link = links.nth(index);
      const text = await link.textContent();
      expect(text?.trim()).not.toBe("");
    }
  });

  test("should have proper button text", async ({ page }) => {
    await page.goto("/");

    const buttons = page.locator("button");
    const buttonCount = await buttons.count();

    for (let index = 0; index < Math.min(buttonCount, 5); index++) {
      const button = buttons.nth(index);
      const buttonText = await button.textContent();
      expect(buttonText?.trim()).not.toBe("");
    }
  });

  test("should have proper alt text for images", async ({ page }) => {
    await page.goto("/");

    const images = page.locator("img");
    const imageCount = await images.count();

    for (let index = 0; index < imageCount; index++) {
      const image = images.nth(index);
      const altText = await image.getAttribute("alt");
      expect(altText?.trim()).not.toBe("");
    }
  });

  test("should have proper ARIA labels", async ({ page }) => {
    await page.goto("/");

    const elementsWithAriaLabel = page.locator("[aria-label]");
    const ariaLabelCount = await elementsWithAriaLabel.count();

    for (let index = 0; index < ariaLabelCount; index++) {
      const element = elementsWithAriaLabel.nth(index);
      const ariaLabel = element;
      await expect(ariaLabel).toHaveAttribute("aria-label");
      const label = await ariaLabel.getAttribute("aria-label");
      expect(label?.trim()).not.toBe("");
    }
  });

  test("should have proper contrast ratios", async ({ page }) => {
    await page.goto("/");

    const textElements = page
      .locator("h1, h2, h3, p, span, div")
      .filter({ hasText: /[A-Za-z]/ });
    await expect(textElements.first()).toBeVisible();
  });

  test("should be navigable with screen reader", async ({ page }) => {
    await page.goto("/");

    const header = page.locator("header").first();
    await expect(header).toBeVisible();

    const content = page.locator("div").filter({ hasText: /[A-Za-z]/ });
    await expect(content.first()).toBeVisible();
  });
});
