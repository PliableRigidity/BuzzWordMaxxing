import { expect, type Page } from "@playwright/test";

export const successfulResponse = {
  larpified:
    "We are operationalising a locally governed transformation layer for the submitted source while preserving ESP32 and 30M parameter constraints.",
  honestTranslation: "The original thing still happened.",
  scores: {
    buzzwordDensity: 82,
    meaningRetained: 88,
    corporateContamination: 74,
    larpIntensity: 80,
  },
  classification: {
    primary: "Local-AI LARP",
    secondary: "Corporate LARP",
  },
  verdict: "Technically coherent. Spiritually enterprise.",
  usedBuzzwords: ["operationalising", "transformation layer", "locally governed"],
  detectedDomains: ["Local AI", "Corporate Strategy"],
  mode: "ollama",
  model: "llama3.2:3b",
  status: "ok",
};

export const fallbackResponse = {
  ...successfulResponse,
  larpified: "Fallback LARP: We are operationalising ESP32 as a sovereign local inference capability.",
  mode: "fallback",
  status: "fallback",
};

export async function mockHealth(page: Page, online = true) {
  await page.route("**/api/health/ollama", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        online,
        hasModel: online,
        model: "llama3.2:3b",
        status: online ? "Local Model Online" : "Local Model Unavailable - Fallback LARP Active",
        explanation: online ? "Ollama is reachable." : "Ollama is unavailable.",
      }),
    });
  });
}

export async function mockGeneration(page: Page, response: unknown = successfulResponse, status = 200) {
  await page.route("**/api/larpify", async (route) => {
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(response),
    });
  });
}

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}
