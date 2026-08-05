import { getCategories, type CategoryId } from "./categories";
import type { LarpifyRequest } from "./schema";
import type { VocabularySelection } from "./style";

const intensityGuide = [
  "1-2 Mildly Optimised: retain most original wording and add only a light veneer.",
  "3-4 Corporate: add jargon while preserving clear meaning.",
  "5-6 Venture-Backed: make it pitch-deck ready, abstract, and confident.",
  "7-8 Enterprise-Grade: longer, heavily abstracted, responsibility-avoidant.",
  "9 Unbearable: borderline unusable but still factually traceable.",
  "10 Post-Language: nearly meaningless strategic fog while preserving core facts.",
];

const examples = [
  {
    input: "I made a Python script that sorts my Downloads folder.",
    categories: "AI, Startup, Enterprise",
    output: {
      larpified:
        "We're building an enterprise-grade file intelligence layer that autonomously orchestrates unstructured download workflows across the modern desktop ecosystem.",
      honestTranslation: "A Python script moves files into folders.",
      scores: {
        buzzwordDensity: 74,
        meaningRetained: 83,
        corporateContamination: 68,
        larpIntensity: 72,
      },
      classification: {
        primary: "Enterprise LARP",
        secondary: "AI LARP",
      },
      verdict: "CRUD application exhibiting early-stage AGI symptoms.",
      usedBuzzwords: ["enterprise-grade", "intelligence layer", "orchestrates"],
    },
  },
  {
    input: "I run a 30M parameter language model on an ESP32.",
    categories: "Local AI, Open Source, Corporate",
    output: {
      larpified:
        "We're operationalising a 30M-parameter, open-weight language intelligence substrate directly on sovereign ESP32 edge infrastructure.",
      honestTranslation: "A tiny language model runs very slowly on a microcontroller.",
      scores: {
        buzzwordDensity: 78,
        meaningRetained: 91,
        corporateContamination: 55,
        larpIntensity: 80,
      },
      classification: {
        primary: "Local-AI LARP",
        secondary: "Open-Source LARP",
      },
      verdict: "Certified edge-compute LARP.",
      usedBuzzwords: ["operationalising", "open-weight", "intelligence substrate", "sovereign"],
    },
  },
  {
    input: "My Raspberry Pi turns on a bedroom light.",
    categories: "Homelab, Enterprise, Consulting",
    output: {
      larpified:
        "We've deployed a self-hosted illumination orchestration platform that unlocks real-time residential lighting outcomes across sovereign ARM infrastructure.",
      honestTranslation: "A Raspberry Pi controls a light.",
      scores: {
        buzzwordDensity: 70,
        meaningRetained: 82,
        corporateContamination: 64,
        larpIntensity: 76,
      },
      classification: {
        primary: "Homelab LARP",
        secondary: "Enterprise LARP",
      },
      verdict: "Financially irrational. Architecturally beautiful.",
      usedBuzzwords: ["self-hosted", "orchestration", "sovereign ARM infrastructure"],
    },
  },
];

function formatCategories(ids: readonly CategoryId[]) {
  return getCategories(ids)
    .map(
      (category) => [
        `${category.label}:`,
        `Guidance: ${category.guidance}`,
        `Vocabulary sample: ${category.vocabulary.slice(0, 5).join(", ")}`,
      ].join("\n"),
    )
    .join("\n\n");
}

function formatInjectorProfiles(selection?: VocabularySelection) {
  const profiles = selection ? [...selection.activeInjectors, ...selection.suggestedInjectors].slice(0, 6) : [];

  if (!profiles.length) {
    return "None supplied.";
  }

  return profiles
    .map((profile) =>
      [
        `${profile.label} (${profile.group}):`,
        `Description: ${profile.description}`,
        `Style instructions: ${profile.styleInstructions.slice(0, 2).join(" ")}`,
        `Rhetorical patterns: ${profile.rhetoricalPatterns.slice(0, 3).join("; ")}`,
        `Vocabulary sample: ${profile.vocabulary.slice(0, 6).join(", ")}`,
        profile.humourTags?.length ? `Humour tags: ${profile.humourTags.slice(0, 4).join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n");
}

export function buildSystemPrompt() {
  return [
    "You are Buzzwordmaxxing, an affectionate satire engine for AI, startup, enterprise, open-source, homelab, and consulting culture.",
    "Transform plain input into an absurdly over-engineered corporate technology statement.",
    "Preserve the real subject, numbers, devices, technologies, and technical meaning.",
    "Never invent customers, funding, benchmarks, performance, adoption, compliance status, or production claims.",
    "Infer relevant jargon domains from the original sentence, generation mode, user direction, and style chips.",
    "Distinguish built-in injector profiles from custom user direction.",
    "Treat user style text as creative direction only, not as factual content.",
    "Do not assume every related profile is active; use it only as tone and vocabulary inspiration.",
    "Use the supplied inspiration phrases naturally when they fit. They are optional ingredients, not a checklist.",
    "Avoid random adjective lists and avoid repeating the same buzzword.",
    "Produce a concise brutally honest translation.",
    "Return only valid JSON matching this exact shape: {\"larpified\":\"string\",\"honestTranslation\":\"string\",\"scores\":{\"buzzwordDensity\":0,\"meaningRetained\":0,\"corporateContamination\":0,\"larpIntensity\":0},\"classification\":{\"primary\":\"string\",\"secondary\":\"string\"},\"verdict\":\"string\",\"usedBuzzwords\":[\"string\"]}.",
    "Scores must be numbers from 0 to 100.",
    "Humour should be playful and knowledgeable, not hostile.",
    "",
    "Intensity guide:",
    intensityGuide.join("\n"),
    "",
    "Few-shot examples:",
    ...examples.map((example) =>
      [
        `Input: ${example.input}`,
        `Categories: ${example.categories}`,
        `Output JSON: ${JSON.stringify(example.output)}`,
      ].join("\n"),
    ),
  ].join("\n");
}

export function buildUserPrompt(request: LarpifyRequest, selection?: VocabularySelection) {
  const lockedFacts = request.lockedFacts.length
    ? request.lockedFacts.map((fact) => `- ${fact}`).join("\n")
    : "- No extra locked facts were supplied. Still preserve numbers, devices, technologies, and claims from the input.";
  const selectedDomains = selection?.domainIds ?? request.categories;
  const detectedDomains = selection?.detectedDomains.length ? selection.detectedDomains.join(", ") : "Let the model infer them.";
  const inspirationTerms = selection?.inspirationTerms.length
    ? selection.inspirationTerms.join(", ")
    : "No curated terms supplied.";
  const builtInChips = request.presetChips ?? [];
  const customStyleChips = request.customStyleChips ?? [];
  const manualNote =
    request.mode === "manual"
      ? "Manual maxx: follow the manually selected internal domains closely."
      : request.mode === "guided"
        ? "Guided maxx: use the free-form direction and chips to infer the strongest jargon domains."
        : "Auto-maxx: infer the strongest jargon domains from the source sentence.";

  return [
    "Transform this sentence.",
    "",
    `Input: ${request.input}`,
    `Intensity: ${request.intensity}/10`,
    `Generation mode: ${request.mode}`,
    manualNote,
    "",
    "Free-form style direction:",
    request.styleDirection || "None supplied.",
    "",
    "Built-in injector profiles selected by the user:",
    builtInChips.length ? builtInChips.map((chip) => `- ${chip}`).join("\n") : "- None supplied.",
    "",
    "Structured built-in injector data to use. This is a limited subset, not the full registry:",
    formatInjectorProfiles(selection),
    "",
    "Free-form custom direction chips:",
    customStyleChips.length ? customStyleChips.map((chip) => `- ${chip}`).join("\n") : "- None supplied.",
    "",
    "Additional style instructions from active or source-relevant injectors:",
    selection?.styleInstructions.length ? selection.styleInstructions.map((item) => `- ${item}`).join("\n") : "- None supplied.",
    "",
    "Rhetorical failure patterns:",
    selection?.rhetoricalPatterns.length ? selection.rhetoricalPatterns.map((item) => `- ${item}`).join("\n") : "- None supplied.",
    "",
    "Humour tags:",
    selection?.humourTags.length ? selection.humourTags.join(", ") : "None supplied.",
    "",
    "Backend-inferred display domains:",
    detectedDomains,
    "",
    "Relevant internal category guidance:",
    formatCategories(selectedDomains),
    "",
    "Limited optional inspiration phrases:",
    inspirationTerms,
    "",
    "Hard preservation requirements:",
    lockedFacts,
    "",
    "Avoid forcing every supplied term into the sentence. Vary phrasing between generations.",
    "Return JSON only. No Markdown, no prose wrapper, no code fences.",
  ].join("\n");
}

export function buildRepairPrompt(badResponse: string) {
  return [
    "Repair this malformed model response into valid JSON only.",
    "Keep the same meaning. Use the required Buzzwordmaxxing schema.",
    "If a field is missing, infer a reasonable value without adding factual claims.",
    "",
    badResponse.slice(0, 6000),
  ].join("\n");
}
