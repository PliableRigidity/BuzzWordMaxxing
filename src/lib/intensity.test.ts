import { describe, expect, it } from "vitest";
import { generateFallback } from "./fallback";
import {
  abstractionDelta,
  getIntensityPolicy,
  originalWordingRetention,
  validateIntensityCompliance,
  wordCount,
} from "./intensity";
import { detectBuzzwords } from "./scoring";
import type { LarpifyRequest } from "./schema";

const source =
  "I made a website that turns normal sentences into exaggerated corporate and technology jargon. Users can choose different styles and control how ridiculous the result becomes.";

function request(intensity: number): LarpifyRequest {
  return {
    input: source,
    categories: ["ai", "corporate", "enterprise"],
    mode: "auto",
    styleDirection: "",
    presetChips: [],
    customStyleChips: [],
    intensity,
    lockedFacts: [],
  };
}

describe("intensity policy", () => {
  it("defines a real gradient from minimal optimisation to post-language", () => {
    expect(getIntensityPolicy(1)).toMatchObject({
      label: "Minimal Optimisation",
      maxBuzzwordCount: 1,
      maxLengthMultiplier: 1.1,
    });
    expect(getIntensityPolicy(10)).toMatchObject({
      label: "Post-Language",
      maxLengthMultiplier: 2.5,
    });
    expect(getIntensityPolicy(1).originalWordingRetention[0]).toBeGreaterThan(getIntensityPolicy(10).originalWordingRetention[0]);
    expect(getIntensityPolicy(10).maxBuzzwordCount).toBeGreaterThan(getIntensityPolicy(1).maxBuzzwordCount);
  });

  it("detects low-intensity policy failures", () => {
    const bad =
      "We're operationalising a paradigm-shifting enterprise-grade orchestration ecosystem for mission-critical applications.";
    const result = validateIntensityCompliance({ source, output: bad, intensity: 1 });

    expect(result.ok).toBe(false);
    expect(result.warnings.join(" ")).toContain("Forbidden");
  });
});

describe("intensity-aware fallback", () => {
  it("keeps level 1 close and level 10 substantially abstract", () => {
    const low = generateFallback(request(1), "test");
    const middle = generateFallback(request(5), "test");
    const high = generateFallback(request(10), "test");

    expect(originalWordingRetention(source, low.larpified)).toBeGreaterThan(originalWordingRetention(source, high.larpified));
    expect(wordCount(low.larpified)).toBeLessThan(wordCount(high.larpified));
    expect(detectBuzzwords(low.larpified).length).toBeLessThan(detectBuzzwords(high.larpified).length);
    expect(abstractionDelta(source, low.larpified)).toBeLessThan(abstractionDelta(source, high.larpified));
    expect(low.larpified).toMatch(/^I made/);
    expect(middle.larpified).toContain("configurable capability");
    expect(high.larpified).toContain("category-defining");
  });

  it("shows monotonic tendencies across levels 1, 3, 5, 7 and 10", () => {
    const levels = [1, 3, 5, 7, 10];
    const outputs = levels.map((level) => generateFallback(request(level), "test").larpified);
    const retentions = outputs.map((output) => originalWordingRetention(source, output));
    const lengths = outputs.map(wordCount);
    const abstractions = outputs.map((output) => abstractionDelta(source, output));

    expect(retentions[0]).toBeGreaterThan(retentions.at(-1) ?? 0);
    expect(lengths[0]).toBeLessThan(lengths.at(-1) ?? 0);
    expect(abstractions[0]).toBeLessThan(abstractions.at(-1) ?? 0);
    expect(detectBuzzwords(outputs[0]).length).toBeLessThan(detectBuzzwords(outputs.at(-1) ?? "").length);
  });

  it("preserves locked facts at high intensity", () => {
    const result = generateFallback(
      {
        ...request(10),
        input: "My Raspberry Pi turns my bedroom light on and off.",
        lockedFacts: ["Raspberry Pi", "bedroom light"],
      },
      "test",
    );

    expect(result.larpified).toContain("Raspberry Pi");
    expect(result.larpified).toContain("bedroom light");
  });
});
