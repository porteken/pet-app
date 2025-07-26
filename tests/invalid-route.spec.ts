import { expect, test } from "@playwright/test";

test.describe("Invalid Dynamic Routes", () => {
  test("should show not found error for non-existent location", async ({
    page,
  }) => {
    await page.goto("/999999", {
      timeout: 20_000,
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByText("Location not found")).toBeVisible();
  });
});
