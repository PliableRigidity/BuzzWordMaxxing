import { getCategories, type CategoryId } from "./categories";
import { formatIntensityPolicy, getIntensityPolicy, validateIntensityCompliance } from "./intensity";
import type { LarpifyRequest } from "./schema";
import type { VocabularySelection } from "./style";

const examples = [
  {
    source:
      "I made a website that turns normal sentences into exaggerated corporate and technology jargon. Users can choose different styles and control how ridiculous the result becomes.",
    levels: [
      [
        1,
        "I made a website that turns normal sentences into exaggerated corporate and technology jargon. Users can choose different styles and adjust how ridiculous the result becomes.",
      ],
      [3, "I created a configurable website that transforms ordinary sentences into exaggerated corporate and technology language."],
      [
        5,
        "I built a configurable language-transformation platform that converts ordinary sentences into amplified corporate and technology jargon.",
      ],
      [
        7,
        "We're building a configurable linguistic transformation platform that converts plain-language inputs into strategically aligned corporate and technology narratives.",
      ],
      [
        10,
        "We're catalysing a category-defining linguistic transformation paradigm that autonomously operationalises low-density human intent across a vertically integrated ecosystem of enterprise-grade semantic orchestration layers, unlocking post-language alignment at scale.",
      ],
    ] as const,
  },
  {
    source: "A script checks a folder every ten minutes and sends an email when a new file appears.",
    levels: [
      [1, "A script checks a folder every ten minutes and sends an email when a new file appears."],
      [3, "A scheduled script checks a folder every ten minutes and sends an email when a new file appears."],
      [5, "A configurable monitoring tool checks a folder every ten minutes and triggers an email when new files appear."],
      [
        7,
        "We're building a scheduled file-monitoring capability that converts folder changes into enterprise-aligned notification workflows every ten minutes.",
      ],
      [
        10,
        "We're operationalising a temporal file-state intelligence layer that transforms emergent folder events into automated communication outcomes across a post-manual workflow ecosystem.",
      ],
    ] as const,
  },
  {
    source: "My Raspberry Pi turns my bedroom light on and off.",
    levels: [
      [1, "My Raspberry Pi turns my bedroom light on and off."],
      [3, "My Raspberry Pi controls my bedroom light by turning it on and off."],
      [5, "I built a Raspberry Pi home-automation tool that controls my bedroom light."],
      [
        7,
        "We're deploying a Raspberry Pi-enabled home-automation capability that orchestrates bedroom lighting states through local control workflows.",
      ],
      [
        10,
        "We're catalysing a sovereign Raspberry Pi residential illumination substrate that operationalises bedroom light-state alignment across a vertically integrated home-automation control plane.",
      ],
    ] as const,
  },
  {
    source: "The project is late because nobody finished the report.",
    levels: [
      [1, "The project is late because nobody finished the report."],
      [3, "The project is delayed because the report has not been finished."],
      [5, "The project timeline has shifted because the reporting workstream is still incomplete."],
      [
        7,
        "We're managing a delivery-timeline realignment driven by unresolved reporting dependencies across the project operating cadence.",
      ],
      [
        10,
        "We're operationalising a cross-functional timeline recalibration paradigm in response to unresolved documentation ownership within the broader delivery accountability ecosystem.",
      ],
    ] as const,
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
    "Transform plain input into a level-appropriate corporate technology statement.",
    "Preserve the real subject, numbers, devices, technologies, and technical meaning.",
    "Never invent customers, funding, benchmarks, performance, adoption, compliance status, or production claims.",
    "Infer relevant jargon domains from the original sentence, generation mode, user direction, and style chips.",
    "Distinguish built-in injector profiles from custom user direction.",
    "Treat user style text as creative direction only, not as factual content.",
    "Do not assume every related profile is active; use it only as tone and vocabulary inspiration.",
    "Use the supplied inspiration phrases naturally when they fit and when the intensity policy allows them.",
    "The intensity policy is mandatory. Low intensity must stay close to the source; high intensity may become abstract.",
    "Avoid random adjective lists and avoid repeating the same buzzword.",
    "Produce a concise brutally honest translation.",
    "Return only valid JSON matching this exact shape: {\"larpified\":\"string\",\"honestTranslation\":\"string\",\"scores\":{\"buzzwordDensity\":0,\"meaningRetained\":0,\"corporateContamination\":0,\"larpIntensity\":0},\"classification\":{\"primary\":\"string\",\"secondary\":\"string\"},\"verdict\":\"string\",\"usedBuzzwords\":[\"string\"]}.",
    "Scores must be numbers from 0 to 100.",
    "Humour should be playful and knowledgeable, not hostile.",
    "",
    "Few-shot intensity examples:",
    ...examples.map((example) =>
      [
        `Source: ${example.source}`,
        ...example.levels.map(([level, output]) => `Level ${level}: ${output}`),
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
  const policy = getIntensityPolicy(request.intensity);
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
    formatIntensityPolicy(policy),
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
    "For levels 1-3, prefer source wording and structure over clever jargon.",
    "For levels 8-10, increase abstraction while preserving locked facts and the real subject.",
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

export function buildLowIntensityRepairPrompt(params: {
  request: LarpifyRequest;
  badOutput: string;
  warnings: readonly string[];
  selection?: VocabularySelection;
}) {
  const policy = getIntensityPolicy(params.request.intensity);
  const compliance = validateIntensityCompliance({
    source: params.request.input,
    output: params.badOutput,
    intensity: params.request.intensity,
    lockedFacts: params.request.lockedFacts,
  });

  return [
    "Rewrite this much closer to the original sentence and return valid JSON only.",
    "This is a low-intensity Buzzwordmaxxing repair, not an enterprise transformation pitch.",
    formatIntensityPolicy(policy),
    "",
    `Original source: ${params.request.input}`,
    `Rejected output: ${params.badOutput}`,
    "",
    "Observed policy failures:",
    [...params.warnings, ...compliance.warnings].length
      ? [...new Set([...params.warnings, ...compliance.warnings])].map((warning) => `- ${warning}`).join("\n")
      : "- The output drifted too far from the source.",
    "",
    "Repair requirements:",
    "- Preserve source wording and sentence structure.",
    "- Remove extreme corporate abstractions.",
    "- Preserve locked facts and factual anchors.",
    "- Keep the honest translation concise.",
    "",
    buildUserPrompt(params.request, params.selection),
  ].join("\n");
}
