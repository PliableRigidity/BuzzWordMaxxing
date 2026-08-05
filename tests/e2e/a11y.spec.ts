import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { mockGeneration, mockHealth, successfulResponse } from "./helpers";

async function expectNoSeriousAxeViolations(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""));

  expect(serious).toEqual([]);
}

test.describe("@a11y accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await mockHealth(page, true);
    await mockGeneration(page, successfulResponse);
  });

  test("empty homepage has no serious axe violations and labelled controls", async ({ page }) => {
    await page.goto("/");
    await expectNoSeriousAxeViolations(page);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByLabel("Source statement")).toBeVisible();
    await expect(page.getByLabel("Abstraction intensity")).toBeVisible();
    await expect(page.getByRole("button", { name: /Transformation direction/i })).toHaveAttribute("aria-expanded", "false");
  });

  test("directed mode and profile library remain accessible", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: "Directed" }).click();
    await page.getByRole("button", { name: "Browse capability library" }).click();
    await expect(page.getByRole("combobox", { name: /search professional/i })).toBeFocused();
    await expectNoSeriousAxeViolations(page);
    await page.keyboard.press("Escape");
    await expect(page.getByPlaceholder(/Search professional subcultures/i)).not.toBeVisible();
  });

  test("successful output and mobile layout pass axe scan", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Operationalise" }).click();
    await expect(page.getByText(/We are operationalising/i)).toBeVisible();
    await expectNoSeriousAxeViolations(page);
  });

  test("error state is announced with recovery action", async ({ page }) => {
    await page.route("**/api/larpify", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ joke: "The local model is unavailable.", explanation: "Try again after restarting Ollama." }),
      });
    });
    await page.goto("/");
    await page.getByRole("button", { name: "Operationalise" }).click();
    await expect(page.getByText("Local alignment dependency unavailable.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Retry inference" })).toBeVisible();
    await expectNoSeriousAxeViolations(page);
  });
});
