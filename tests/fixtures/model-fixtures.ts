import type { ModelOutput } from "@/lib/schema";

export const localAiOutput: ModelOutput = {
  larpified:
    "We are operationalising a 30M-parameter local inference substrate on ESP32 edge hardware while preserving a 0.2 tokens per second sovereign compute envelope.",
  honestTranslation: "A 30M parameter model runs on an ESP32 at 0.2 tokens per second.",
  scores: {
    buzzwordDensity: 82,
    meaningRetained: 91,
    corporateContamination: 64,
    larpIntensity: 80,
  },
  classification: {
    primary: "Local-AI LARP",
    secondary: "Honourable Engineering LARP",
  },
  verdict: "Certified edge-compute LARP.",
  usedBuzzwords: ["operationalising", "local inference", "sovereign compute", "edge hardware"],
  detectedDomains: ["Local AI", "Embedded Systems"],
};

export const corporateOutput: ModelOutput = {
  larpified:
    "We are aligning the file-renaming workflow into an enterprise-ready operational excellence motion with accountable stakeholder visibility.",
  honestTranslation: "A script renames files.",
  scores: {
    buzzwordDensity: 76,
    meaningRetained: 84,
    corporateContamination: 86,
    larpIntensity: 74,
  },
  classification: {
    primary: "Corporate LARP",
    secondary: "Consulting LARP",
  },
  verdict: "No use case detected. Respect awarded.",
  usedBuzzwords: ["aligning", "enterprise-ready", "operational excellence", "stakeholder visibility"],
  detectedDomains: ["Corporate Strategy", "Management Consulting"],
};

export const academicOutput: ModelOutput = {
  larpified:
    "This work introduces a novel benchmark-adjacent framework with an empirical evaluation across 7 of 10 trials, producing statistically significant vibes.",
  honestTranslation: "The experiment worked seven times out of ten.",
  scores: {
    buzzwordDensity: 79,
    meaningRetained: 88,
    corporateContamination: 38,
    larpIntensity: 78,
  },
  classification: {
    primary: "Research LARP",
    secondary: "Academic Research",
  },
  verdict: "Methodologically confident. Spiritually unreproducible.",
  usedBuzzwords: ["novel framework", "empirical evaluation", "benchmark-adjacent", "statistically significant vibes"],
  detectedDomains: ["Academic Research", "Invented Benchmark"],
};

export const scoreOverflowOutput: ModelOutput = {
  ...corporateOutput,
  scores: {
    buzzwordDensity: 500,
    meaningRetained: -40,
    corporateContamination: 140,
    larpIntensity: 999,
  },
};

export const missingFieldOutput = {
  larpified: "A malformed but enthusiastic transformation.",
  scores: corporateOutput.scores,
};

export const fencedJson = `\`\`\`json
${JSON.stringify(localAiOutput)}
\`\`\``;

export const commentaryJson = `Here is your JSON:\n${JSON.stringify(corporateOutput)}`;

export const malformedJson = "{ larpified: definitely not json";

export const emptyOllamaResponse = { response: "" };

export function ollamaResponse(output: unknown) {
  return {
    response: typeof output === "string" ? output : JSON.stringify(output),
  };
}

export const modelMissingResponse = {
  error: "model 'llama3.2:3b' not found",
};
