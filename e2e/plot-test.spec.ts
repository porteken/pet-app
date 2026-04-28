import { expect, test } from "@playwright/test";

test("mounts, unmounts, and remounts the plot without browser errors", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  const toggle = page.locator("#toggle");
  const plot = page.getByTestId("plot-test-chart");

  await page.goto("/plot-test");

  await expect(toggle).toBeVisible();
  await expect(plot).toHaveCount(1);

  await toggle.click();
  await expect(plot).toHaveCount(0);

  await toggle.click();
  await expect(plot).toHaveCount(1);

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});
