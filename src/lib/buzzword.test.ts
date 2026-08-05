import { describe, expect, it } from "vitest";
import { mapOllamaError } from "./errors";
import { generateFallback } from "./fallback";
import {
  addRecentInjectorId,
  groupInjectors,
  injectorGroups,
  injectorIds,
  injectorProfiles,
  resolveInjectors,
  sanitiseRecentInjectorIds,
  searchInjectors,
  suggestInjectors,
} from "./injectors";
import { buildUserPrompt } from "./prompt";
import { clampScore, detectBuzzwords } from "./scoring";
import { larpifyRequestSchema, modelOutputSchema, MAX_INPUT_LENGTH, type LarpifyRequest } from "./schema";
import { addUniqueStyleChip, selectVocabulary } from "./style";

const validOutput = {
  larpified:
    "We're operationalising a 30M-parameter intelligence substrate on sovereign ESP32 edge infrastructure.",
  honestTranslation: "A small model runs on an ESP32.",
  scores: {
    buzzwordDensity: 80,
    meaningRetained: 90,
    corporateContamination: 60,
    larpIntensity: 85,
  },
  classification: {
    primary: "Local-AI LARP",
    secondary: "Corporate LARP",
  },
  verdict: "Certified edge-compute LARP.",
  usedBuzzwords: ["operationalising", "intelligence substrate", "sovereign"],
};

const validRequest: LarpifyRequest = {
  input: "I run a 30M parameter LLM on an ESP32.",
  categories: ["ai", "corporate", "localAi"],
  mode: "auto",
  styleDirection: "",
  presetChips: [],
  customStyleChips: [],
  intensity: 7,
  lockedFacts: ["ESP32", "30M parameter"],
};

describe("prompt builder", () => {
  it("auto mode detects relevant domains from an ESP32 local-LLM sentence", () => {
    const selection = selectVocabulary(validRequest);

    expect(selection.detectedDomains).toContain("Local AI");
    expect(selection.detectedDomains).toContain("Embedded Systems");
    expect(selection.detectedDomains).toContain("Edge Computing");
  });

  it("guided mode includes the user's style direction in the model prompt", () => {
    const request: LarpifyRequest = {
      ...validRequest,
      mode: "guided",
      styleDirection: "Make it sound like a McKinsey consultant.",
    };
    const prompt = buildUserPrompt(request, selectVocabulary(request));

    expect(prompt).toContain("Make it sound like a McKinsey consultant.");
    expect(prompt).toContain("Guided maxx");
  });

  it("includes custom chips in the prompt", () => {
    const request: LarpifyRequest = {
      ...validRequest,
      mode: "guided",
      customStyleChips: ["Arch Linux elitism", "Fake benchmark research paper"],
    };
    const prompt = buildUserPrompt(request, selectVocabulary(request));

    expect(prompt).toContain("- Arch Linux elitism");
    expect(prompt).toContain("- Fake benchmark research paper");
    expect(prompt).toContain("Free-form custom direction chips");
  });

  it("includes only active profile data, not the full injector registry", () => {
    const request: LarpifyRequest = {
      ...validRequest,
      presetChips: ["API Call in a Trench Coat"],
      customStyleChips: ["A procurement manager avoiding personal liability"],
    };
    const prompt = buildUserPrompt(request, selectVocabulary(request));

    expect(prompt).toContain("API Call in a Trench Coat");
    expect(prompt).toContain("A procurement manager avoiding personal liability");
    expect(prompt).not.toContain("Chief Synergy Officer");
    expect(prompt).not.toContain("Solar-Powered Synergy");
  });

  it("manual mode continues to support existing categories", () => {
    const request: LarpifyRequest = {
      ...validRequest,
      mode: "manual",
      categories: ["enterprise", "consulting"],
    };
    const selection = selectVocabulary({
      input: request.input,
      intensity: request.intensity,
      mode: request.mode,
      manualCategories: request.categories,
    });
    const prompt = buildUserPrompt(request, selection);

    expect(selection.domainIds).toEqual(["enterprise", "consulting"]);
    expect(prompt).toContain("Enterprise:");
    expect(prompt).toContain("Consulting:");
  });

  it("includes locked facts as hard preservation requirements", () => {
    const prompt = buildUserPrompt(validRequest, selectVocabulary(validRequest));

    expect(prompt).toContain("- ESP32");
    expect(prompt).toContain("- 30M parameter");
  });

  it("domain vocabulary sampling returns a limited subset", () => {
    const selection = selectVocabulary({
      ...validRequest,
      mode: "guided",
      styleDirection: "local AI homelab bro mixed with corporate consulting language",
      presetChips: ["Local Tech", "Consulting"],
    });

    expect(selection.inspirationTerms.length).toBeLessThanOrEqual(10);
    expect(selection.inspirationTerms.length).toBeGreaterThan(0);
  });

  it("vocabulary sampling does not send every stored term", () => {
    const selection = selectVocabulary({
      ...validRequest,
      styleDirection: "AI enterprise open source local homelab consulting founder research web3 climate arch",
    });

    expect(selection.inspirationTerms.length).toBeLessThan(40);
  });
});

describe("injector registry", () => {
  it("has unique stable ids and non-empty labels", () => {
    expect(new Set(injectorIds).size).toBe(injectorIds.length);
    expect(injectorProfiles.length).toBeGreaterThan(250);
    expect(injectorProfiles.every((profile) => profile.id && profile.label.trim())).toBe(true);
  });

  it("only uses valid taxonomy groups", () => {
    const validGroups = new Set(injectorGroups);

    expect(injectorProfiles.every((profile) => validGroups.has(profile.group))).toBe(true);
    expect(groupInjectors(injectorProfiles).length).toBe(injectorGroups.length);
  });

  it("search finds results by label, alias and description", () => {
    expect(searchInjectors("Middle Management").map((profile) => profile.label)).toContain("Middle Management");
    expect(searchInjectors("AI wrapper").map((profile) => profile.label)).toContain("API Call in a Trench Coat");
    expect(searchInjectors("preserving the original facts").length).toBeGreaterThan(0);
  });

  it("search examples return relevant professional archetypes", () => {
    expect(searchInjectors("manager").map((profile) => profile.label)).toEqual(
      expect.arrayContaining(["Middle Management", "Responsibility Avoidance", "Performance Management"]),
    );
    expect(searchInjectors("government").map((profile) => profile.label)).toEqual(
      expect.arrayContaining(["Government Digital Transformation", "Civil Service", "Public Policy"]),
    );
    expect(searchInjectors("pointless hardware").map((profile) => profile.label)).toEqual(
      expect.arrayContaining(["Microcontroller LARP", "Running Doom on Everything", "Overengineered Home Automation"]),
    );
  });

  it("source-aware suggestions cover hardware, meetings, research and API wrappers", () => {
    expect(suggestInjectors("I ran a model on an ESP32 microcontroller").map((profile) => profile.label)).toEqual(
      expect.arrayContaining(["Embedded Systems", "Edge AI", "Microcontroller LARP", "Local AI"]),
    );
    expect(suggestInjectors("The manager moved the deadline after a meeting").map((profile) => profile.label)).toEqual(
      expect.arrayContaining(["Corporate Strategy", "Responsibility Avoidance", "Meeting Culture"]),
    );
    expect(suggestInjectors("We wrote a benchmark paper with an experiment").map((profile) => profile.label)).toEqual(
      expect.arrayContaining(["Academic Research", "Invented Benchmark", "State of the Art"]),
    );
    expect(suggestInjectors("The website is an API wrapper over a database dashboard").map((profile) => profile.label)).toEqual(
      expect.arrayContaining(["CRUD Pretending to Be AGI", "API Call in a Trench Coat", "Single Pane of Glass"]),
    );
  });

  it("rejects duplicate active built-in profiles during resolution and chip insertion", () => {
    expect(resolveInjectors(["Local AI", "local-ai", "local ai"]).map((profile) => profile.id)).toEqual(["local-ai"]);
    expect(addUniqueStyleChip(["Local AI"], "local ai")).toEqual(["Local AI"]);
  });

  it("sanitises and persists recent injector ids safely", () => {
    const recent = addRecentInjectorId(["local-ai", "missing-id"], "api-call-in-a-trench-coat", 4);

    expect(recent).toEqual(["api-call-in-a-trench-coat", "local-ai"]);
    expect(sanitiseRecentInjectorIds(["not-real", "local-ai"])).toEqual(["local-ai"]);
  });
});

describe("schema validation", () => {
  it("accepts valid model output", () => {
    expect(modelOutputSchema.safeParse({ ...validOutput, detectedDomains: ["Local AI"] }).success).toBe(true);
  });

  it("rejects invalid model output", () => {
    expect(modelOutputSchema.safeParse({ ...validOutput, scores: { buzzwordDensity: "max" } }).success).toBe(false);
  });

  it("rejects empty input", () => {
    expect(larpifyRequestSchema.safeParse({ ...validRequest, input: "   " }).success).toBe(false);
  });

  it("rejects excessively long input", () => {
    expect(larpifyRequestSchema.safeParse({ ...validRequest, input: "x".repeat(MAX_INPUT_LENGTH + 1) }).success).toBe(
      false,
    );
  });

  it("rejects empty custom chips", () => {
    expect(larpifyRequestSchema.safeParse({ ...validRequest, customStyleChips: [""] }).success).toBe(false);
  });

  it("rejects duplicate chips", () => {
    expect(
      larpifyRequestSchema.safeParse({ ...validRequest, presetChips: ["Corporate"], customStyleChips: ["corporate"] })
        .success,
    ).toBe(false);
  });
});

describe("scoring", () => {
  it("clamps scores to the 0-100 range", () => {
    expect(clampScore(140)).toBe(100);
    expect(clampScore(-12)).toBe(0);
    expect(clampScore(Number.NaN)).toBe(0);
  });

  it("detects buzzword matches from curated vocabulary", () => {
    const found = detectBuzzwords("This is enterprise-grade orchestration with no cloud dependency.");

    expect(found).toContain("enterprise-grade");
    expect(found).toContain("orchestration");
    expect(found).toContain("no cloud dependency");
  });
});

describe("fallback", () => {
  it("returns a non-empty fallback result with custom directions", () => {
    const result = generateFallback(
      {
        ...validRequest,
        mode: "guided",
        styleDirection: "Defensive enterprise architect",
        customStyleChips: ["Post-language corporate abstraction"],
      },
      "llama3.2:3b",
    );

    expect(result.larpified.length).toBeGreaterThan(20);
    expect(result.classification.primary).toBe("Fallback LARP");
    expect(result.mode).toBe("fallback");
    expect(result.larpified).toContain("Defensive enterprise architect");
  });

  it("uses expanded built-in profiles in fallback generation", () => {
    const result = generateFallback(
      {
        ...validRequest,
        presetChips: ["API Call in a Trench Coat", "Rebranding a Dashboard as Intelligence"],
      },
      "llama3.2:3b",
    );

    expect(result.detectedDomains).toEqual(expect.arrayContaining(["API Call in a Trench Coat"]));
    expect(result.usedBuzzwords.length).toBeGreaterThan(0);
  });
});

describe("style chips", () => {
  it("rejects duplicate chips", () => {
    expect(addUniqueStyleChip(["Corporate"], " corporate ")).toEqual(["Corporate"]);
  });
});

describe("controlled errors", () => {
  it("converts Ollama connectivity errors into controlled responses", () => {
    const error = mapOllamaError(new Error("fetch failed ECONNREFUSED"));

    expect(error.status).toBe(503);
    expect(error.joke).toContain("Ollama");
  });
});
