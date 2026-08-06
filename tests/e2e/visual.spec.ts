import { expect, test } from "@playwright/test";
import { mockGeneration, mockHealth, successfulResponse } from "./helpers";

async function expectNonBlankScreenshot(page: import("@playwright/test").Page) {
  const buffer = await page.screenshot({ fullPage: false, animations: "disabled" });

  expect(buffer.byteLength).toBeGreaterThan(5_000);
}

test.beforeEach(async ({ page }) => {
  await mockHealth(page, true);
  await mockGeneration(page, successfulResponse);
});

test("desktop and mobile stable states render without blank screenshots", async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expectNonBlankScreenshot(page);

    await page.getByLabel("Source statement").fill("I built a dashboard that displays sales figures.");
    await page.getByRole("button", { name: "Operationalise" }).click();
    await expect(page.getByText(/We are operationalising/i)).toBeVisible();
    await expectNonBlankScreenshot(page);
  }
});

test("directed mode, profile library, and error state have stable screenshots", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("tab", { name: "Directed" }).click();
  await expectNonBlankScreenshot(page);

  await page.getByRole("button", { name: "Browse capability library" }).click();
  await page.getByPlaceholder(/Search professional subcultures/i).fill("API wrapper");
  await expectNonBlankScreenshot(page);

  await page.unroute("**/api/larpify");
  await page.route("**/api/larpify", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ joke: "Model timeout.", explanation: "Retry local inference." }),
    });
  });
  await page.keyboard.press("Escape");
  await page.getByLabel("Source statement").fill("The city launched an app for reporting potholes.");
  await page.getByRole("button", { name: "Operationalise" }).click();
  await expect(page.getByText("Local alignment dependency unavailable.")).toBeVisible();
  await expectNonBlankScreenshot(page);
});
