import { expect, test } from "@playwright/test";

test.describe("About Page", () => {
  test("should display about content", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByText("Purpose of the Application")).toBeVisible();
    await expect(page.getByText("What is PET?")).toBeVisible();
    await expect(
      page.locator("text=Physiological Equivalent Temperature").first()
    ).toBeVisible();
  });

  test("should have a link to the PET study", async ({ page }) => {
    await page.goto("/about");
    const link = page.getByRole("link", { name: "this" });
    await expect(link).toHaveAttribute(
      "href",
      "https://bjsm.bmj.com/content/55/15/825"
    );
  });
});
