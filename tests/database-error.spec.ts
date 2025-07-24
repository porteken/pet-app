import { expect, test } from "@playwright/test";

test.describe("Database Error Dummy Page", () => {
  test("should display dummy database error page with contact information", async ({
    page,
  }) => {
    await page.goto("/database-error-test");
    await expect(
      page.getByRole("heading", { name: "Database Connection Error" })
    ).toBeVisible();
    await expect(page.getByText("porteken@gmail.com")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /try again/i })
    ).toBeVisible();
    await expect(page.locator('svg[class*="text-red-500"]')).toBeVisible();
  });
});
