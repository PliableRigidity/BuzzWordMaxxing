import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, mockGeneration, mockHealth, successfulResponse } from "./helpers";

const viewports = [
  { width: 1920, height: 1080 },
  { width: 1600, height: 900 },
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 1280, height: 800 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 320, height: 700 },
];

for (const viewport of viewports) {
  test(`layout has no overflow and key controls are reachable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await mockHealth(page, true);
    await mockGeneration(page, successfulResponse);
    await page.goto("/");

    await expectNoHorizontalOverflow(page);
    await expect(page.getByRole("heading", { name: "Buzzwordmaxxing" })).toBeVisible();
    await expect(page.getByText("There is no limit to the LARP.")).toBeVisible();
    await expect(page.getByLabel("Source statement")).toBeVisible();
    await page.getByRole("button", { name: /Transformation direction/i }).click();
    await page.getByRole("button", { name: "Browse capability library" }).click();
    await expect(page.getByPlaceholder(/Search professional subcultures/i)).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: "Operationalise" }).scrollIntoViewIfNeeded();
    await expect(page.getByRole("button", { name: "Operationalise" })).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });
}

test("essential content remains usable with enlarged text simulation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockHealth(page, true);
  await mockGeneration(page, successfulResponse);
  await page.goto("/");
  await page.addStyleTag({ content: "html { font-size: 125%; }" });

  await expectNoHorizontalOverflow(page);
  await expect(page.getByLabel("Source statement")).toBeVisible();
  await page.getByRole("button", { name: "Operationalise" }).scrollIntoViewIfNeeded();
  await expect(page.getByRole("button", { name: "Operationalise" })).toBeVisible();
});
