import { describe, expect, it } from "vitest";
import {
  getRandomReferenceScenario,
  normaliseScenarioSource,
  referenceScenarioCategories,
  referenceScenarios,
  validateReferenceScenarios,
  type ReferenceScenario,
} from "./referenceScenarios";
import { resolveInjectors } from "@/lib/injectors";

describe("reference scenario registry", () => {
  it("has unique ids, labels, categories and normalised source strings", () => {
    expect(validateReferenceScenarios()).toEqual([]);
    expect(referenceScenarios.length).toBe(32);
    expect(new Set(referenceScenarios.map((scenario) => scenario.id)).size).toBe(referenceScenarios.length);
    expect(new Set(referenceScenarios.map((scenario) => normaliseScenarioSource(scenario.source))).size).toBe(
      referenceScenarios.length,
    );
    expect(referenceScenarios.every((scenario) => scenario.label.trim())).toBe(true);
    expect(referenceScenarios.every((scenario) => referenceScenarioCategories.includes(scenario.category))).toBe(true);
  });

  it("does not contain duplicate ESP32 development examples", () => {
    const esp32Scenarios = referenceScenarios.filter((scenario) => /esp32/i.test(scenario.source));

    expect(esp32Scenarios).toHaveLength(1);
    expect(esp32Scenarios[0].source).toBe("An ESP32 reads a temperature sensor.");
  });

  it("validates duplicate scenario data", () => {
    const duplicate: ReferenceScenario[] = [
      referenceScenarios[0],
      { ...referenceScenarios[1], id: referenceScenarios[0].id, source: `${referenceScenarios[0].source} ` },
    ];

    expect(validateReferenceScenarios(duplicate)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Duplicate scenario id"),
        expect.stringContaining("Duplicate scenario source"),
      ]),
    );
  });

  it("returns a valid random scenario and avoids immediate repetition where possible", () => {
    const scenario = getRandomReferenceScenario(referenceScenarios[0].id, referenceScenarios, () => 0);

    expect(scenario).toBeTruthy();
    expect(referenceScenarios).toContain(scenario);
    expect(scenario?.id).not.toBe(referenceScenarios[0].id);
  });

  it("uses built-in injector labels for suggested profiles", () => {
    const suggestions = referenceScenarios.flatMap((scenario) => scenario.suggestedProfiles ?? []);
    const unresolved = suggestions.filter((label) => !resolveInjectors([label]).length);

    expect(unresolved).toEqual([]);
  });
});
