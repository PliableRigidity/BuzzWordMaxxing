import { describe, expect, it } from "vitest";
import { checkOllamaHealth, generateWithOllama } from "@/lib/ollama";
import type { LarpifyRequest } from "@/lib/schema";

const liveEnabled = process.env.RUN_LIVE_MODEL_TESTS === "true";

async function canReachOllama() {
  if (!liveEnabled) {
    return { ok: false, reason: "RUN_LIVE_MODEL_TESTS is not true." };
  }

  try {
    const health = await checkOllamaHealth();
    return { ok: health.online && health.hasModel, reason: health.explanation };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : "Ollama health check failed." };
  }
}

describe("optional live Ollama integration", () => {
  it("generates one valid local-model response when explicitly enabled", async () => {
    const availability = await canReachOllama();

    if (!availability.ok) {
      console.warn(`Skipping live Ollama test: ${availability.reason}`);
      return;
    }

    const request: LarpifyRequest = {
      input: "I ran a 30M parameter LLM on an ESP32.",
      categories: ["ai", "localAi", "corporate"],
      mode: "auto",
      styleDirection: "",
      presetChips: ["Local AI"],
      customStyleChips: [],
      intensity: 6,
      lockedFacts: ["ESP32", "30M parameter"],
    };
    const result = await generateWithOllama(request);

    expect(result.mode).toBe("ollama");
    expect(result.larpified).toContain("ESP32");
    expect(result.larpified).toContain("30M");
  }, 45_000);
});
