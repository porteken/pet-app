import { expect, test } from "@playwright/test";

const handleConsole = (errors: string[]) => (message: any) => {
  if (
    message.type() === "error" &&
    !message.text().includes("403 (Forbidden)")
  ) {
    errors.push(message.text());
  }
};

test("mounts, unmounts, and remounts the plot without browser errors", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on("console", handleConsole(consoleErrors));
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
