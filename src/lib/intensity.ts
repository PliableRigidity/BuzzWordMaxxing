import { allBuzzwords } from "./categories";
import { allInjectorVocabulary } from "./injectors";

export type IntensityPolicy = {
  intensity: number;
  label: string;
  meaningRetentionTarget: [number, number];
  originalWordingRetention: [number, number];
  maxBuzzwordCount: number;
  maxLengthMultiplier: number;
  abstractionLevel: string;
  structuralFreedom: string;
  allowedRhetoricalPatterns: string[];
  forbiddenTerms?: string[];
  promptInstructions: string[];
};

const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "because",
  "before",
  "by",
  "can",
  "for",
  "from",
  "has",
  "have",
  "i",
  "in",
  "into",
  "is",
  "it",
  "my",
  "of",
  "on",
  "or",
  "our",
  "that",
  "the",
  "their",
  "this",
  "to",
  "users",
  "we",
  "when",
  "with",
]);

const lowIntensityForbiddenTerms = [
  "paradigm-shifting",
  "paradigm",
  "ecosystem",
  "orchestration",
  "orchestration ecosystem",
  "mission-critical",
  "category-defining",
  "synergy",
  "synergistically",
  "existential synergy",
  "enterprise-grade",
  "transformation platform",
  "digital-transformation platform",
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function detectPolicyBuzzwords(text: string) {
  const normalized = text.toLowerCase();
  const found = new Set<string>();

  for (const term of [...allBuzzwords, ...allInjectorVocabulary]) {
    const pattern = new RegExp(`\\b${escapeRegExp(term.toLowerCase())}\\b`, "i");

    if (pattern.test(normalized)) {
      found.add(term);
    }
  }

  return [...found];
}

const policies: IntensityPolicy[] = [
  {
    intensity: 1,
    label: "Minimal Optimisation",
    meaningRetentionTarget: [90, 100],
    originalWordingRetention: [80, 100],
    maxBuzzwordCount: 1,
    maxLengthMultiplier: 1.1,
    abstractionLevel: "Minimal wording polish only.",
    structuralFreedom: "Preserve the original subject, framing, and sentence structure wherever possible.",
    allowedRhetoricalPatterns: ["Minor clarity edit", "One mild professional phrase at most"],
    forbiddenTerms: lowIntensityForbiddenTerms,
    promptInstructions: [
      "Preserve nearly all source wording and meaning.",
      "Use the original subject and sentence structure.",
      "Add at most one mild professional phrase.",
      "Do not call the project a platform, ecosystem, movement, paradigm, or transformation.",
      "Output length must remain within approximately 110% of source length.",
      "Do not use extreme corporate or technology terminology.",
      "If the input uses first person, preserve that first-person framing.",
    ],
  },
  {
    intensity: 2,
    label: "Professional Polish",
    meaningRetentionTarget: [85, 95],
    originalWordingRetention: [70, 95],
    maxBuzzwordCount: 2,
    maxLengthMultiplier: 1.2,
    abstractionLevel: "Light professional polish.",
    structuralFreedom: "Keep the same subject and general sentence structure.",
    allowedRhetoricalPatterns: ["Minor wording polish", "One or two mild professional phrases"],
    forbiddenTerms: lowIntensityForbiddenTerms,
    promptInstructions: [
      "Preserve most source wording and meaning.",
      "Use minor wording polish only.",
      "Use at most one or two mild professional phrases.",
      "Avoid major abstraction and do not invent capabilities.",
      "Output length must remain within approximately 120% of source length.",
    ],
  },
  {
    intensity: 3,
    label: "Corporate Language",
    meaningRetentionTarget: [80, 90],
    originalWordingRetention: [60, 90],
    maxBuzzwordCount: 3,
    maxLengthMultiplier: 1.3,
    abstractionLevel: "Modest corporate polish.",
    structuralFreedom: "Small structural changes are allowed, but the source should remain immediately understandable.",
    allowedRhetoricalPatterns: ["Modest professional framing", "Clear business wording"],
    forbiddenTerms: ["paradigm-shifting", "category-defining", "existential synergy"],
    promptInstructions: [
      "Preserve the original functionality and meaning.",
      "Add modest professional framing.",
      "Use no more than two or three buzzwords.",
      "Remain immediately understandable.",
      "Do not invent capabilities, customers, performance, funding, or adoption.",
    ],
  },
  {
    intensity: 4,
    label: "Business Transformation",
    meaningRetentionTarget: [75, 85],
    originalWordingRetention: [50, 85],
    maxBuzzwordCount: 4,
    maxLengthMultiplier: 1.4,
    abstractionLevel: "Business-language abstraction.",
    structuralFreedom: "One sentence may be restructured.",
    allowedRhetoricalPatterns: ["Configurable capability", "Professional style framing", "User-controlled process"],
    promptInstructions: [
      "Preserve the source meaning while introducing mild abstraction.",
      "Use business language such as configurable, professional styles, or user-controlled intensity only when relevant.",
      "Avoid extreme claims and keep the result clearly explainable.",
    ],
  },
  {
    intensity: 5,
    label: "Startup-Ready",
    meaningRetentionTarget: [65, 80],
    originalWordingRetention: [40, 80],
    maxBuzzwordCount: 5,
    maxLengthMultiplier: 1.5,
    abstractionLevel: "Moderate startup/product reframing.",
    structuralFreedom: "May reframe a website or script as a tool or platform while preserving functionality.",
    allowedRhetoricalPatterns: ["Platform framing", "Configurable product language", "Capability framing"],
    promptInstructions: [
      "Introduce several relevant buzzwords.",
      "A modest platform/tool framing is allowed.",
      "Still clearly explain the original functionality.",
      "Moderate sentence expansion is permitted.",
    ],
  },
  {
    intensity: 6,
    label: "Venture-Backed",
    meaningRetentionTarget: [55, 70],
    originalWordingRetention: [30, 70],
    maxBuzzwordCount: 6,
    maxLengthMultiplier: 1.7,
    abstractionLevel: "Startup and enterprise terminology.",
    structuralFreedom: "Restructure freely while keeping the result decipherable.",
    allowedRhetoricalPatterns: ["Workflow", "Scalable platform", "Professional discourse", "Configurable system"],
    promptInstructions: [
      "Use startup and enterprise terminology.",
      "Allow platform, workflow, scalable, configurable, and professional discourse language.",
      "The result must remain decipherable without the honest translation.",
    ],
  },
  {
    intensity: 7,
    label: "Enterprise Transformation",
    meaningRetentionTarget: [45, 65],
    originalWordingRetention: [25, 65],
    maxBuzzwordCount: 8,
    maxLengthMultiplier: 1.9,
    abstractionLevel: "Substantial abstraction.",
    structuralFreedom: "Reframe features as capabilities, but keep the source subject present.",
    allowedRhetoricalPatterns: ["Strategic narratives", "Orchestration", "Enterprise-aligned capability", "Transformation platform"],
    promptInstructions: [
      "Use substantial abstraction and multiple selected-domain phrases.",
      "Reframe features as capabilities.",
      "Terms such as linguistic transformation platform, strategic narratives, orchestration, and enterprise-aligned are allowed.",
      "Do not completely discard the source subject.",
    ],
  },
  {
    intensity: 8,
    label: "Severe Abstraction",
    meaningRetentionTarget: [35, 55],
    originalWordingRetention: [15, 55],
    maxBuzzwordCount: 10,
    maxLengthMultiplier: 2.1,
    abstractionLevel: "High buzzword-density abstraction.",
    structuralFreedom: "Longer, compound sentence structures are permitted.",
    allowedRhetoricalPatterns: ["Jargon-domain stacking", "Deliberately excessive abstraction", "Meaning requires effort to recover"],
    promptInstructions: [
      "Use high buzzword density and longer sentence structures.",
      "Combine several selected jargon domains.",
      "Meaning should require effort to recover.",
      "Include at least one deliberately excessive abstraction.",
    ],
  },
  {
    intensity: 9,
    label: "Unrecoverable",
    meaningRetentionTarget: [20, 40],
    originalWordingRetention: [5, 40],
    maxBuzzwordCount: 12,
    maxLengthMultiplier: 2.3,
    abstractionLevel: "Highly abstract corporate, startup, and technical language.",
    structuralFreedom: "Preserve only factual anchors and locked facts.",
    allowedRhetoricalPatterns: ["Extreme nominalisation", "Responsibility avoidance", "Grandiose overclaiming"],
    promptInstructions: [
      "Preserve locked facts and factual anchors.",
      "Use highly abstract corporate, startup, and technical language.",
      "Allow extreme nominalisation and grandiosity.",
      "The original meaning should be recoverable primarily through the honest translation.",
    ],
  },
  {
    intensity: 10,
    label: "Post-Language",
    meaningRetentionTarget: [10, 35],
    originalWordingRetention: [0, 25],
    maxBuzzwordCount: 14,
    maxLengthMultiplier: 2.5,
    abstractionLevel: "Nearly post-language strategic fog.",
    structuralFreedom: "Maximise abstraction while indirectly referring to the source subject.",
    allowedRhetoricalPatterns: ["Jargon stacking", "Semantic orchestration", "Category-defining transformation", "Post-language alignment"],
    forbiddenTerms: [],
    promptInstructions: [
      "Preserve only core factual anchors and locked facts.",
      "Maximise abstraction and buzzword density.",
      "Combine multiple selected jargon domains naturally.",
      "Use polished but nearly unrecoverable enterprise language.",
      "Output may be up to approximately 250% of source length.",
      "Do not invent facts, measurements, customers, revenue, performance claims, or adoption.",
      "Avoid random word salad; remain grammatically polished.",
    ],
  },
];

export function getIntensityPolicy(intensity: number): IntensityPolicy {
  const clamped = Math.max(1, Math.min(10, Math.round(intensity)));

  return policies[clamped - 1];
}

function meaningfulTerms(text: string) {
  const words = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s+#.-]/gu, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 3 && !stopWords.has(word));

  return [...new Set(words)];
}

export function originalWordingRetention(source: string, output: string) {
  const sourceTerms = meaningfulTerms(source);

  if (!sourceTerms.length) {
    return 100;
  }

  const outputTerms = new Set(meaningfulTerms(output));
  const retained = sourceTerms.filter((term) => outputTerms.has(term)).length;

  return Math.round((retained / sourceTerms.length) * 100);
}

export function wordCount(text: string) {
  return text.split(/\s+/).filter(Boolean).length;
}

export function abstractionDelta(source: string, output: string) {
  const sourceWords = wordCount(source);
  const outputWords = wordCount(output);
  const retention = originalWordingRetention(source, output);
  const buzzwordCount = detectPolicyBuzzwords(output).length;
  const lengthExpansion = sourceWords ? Math.max(0, outputWords / sourceWords - 1) : 0;

  return Math.max(0, Math.min(100, Math.round((100 - retention) * 0.55 + buzzwordCount * 5 + lengthExpansion * 20)));
}

export function validateIntensityCompliance(params: {
  source: string;
  output: string;
  intensity: number;
  lockedFacts?: readonly string[];
}) {
  const policy = getIntensityPolicy(params.intensity);
  const outputWordCount = wordCount(params.output);
  const sourceWordCount = Math.max(1, wordCount(params.source));
  const retention = originalWordingRetention(params.source, params.output);
  const buzzwords = detectPolicyBuzzwords(params.output);
  const forbidden = (policy.forbiddenTerms ?? []).filter((term) => params.output.toLowerCase().includes(term.toLowerCase()));
  const missingLockedFacts = (params.lockedFacts ?? []).filter((fact) => !params.output.toLowerCase().includes(fact.toLowerCase()));
  const warnings: string[] = [];

  if (params.intensity <= 5 && retention < policy.originalWordingRetention[0]) {
    warnings.push(`Original wording retention ${retention}% is below the level-${params.intensity} floor.`);
  }

  if (params.intensity <= 3 && outputWordCount > Math.ceil(sourceWordCount * policy.maxLengthMultiplier) + 2) {
    warnings.push(`Output is too long for level ${params.intensity}.`);
  }

  if (params.intensity <= 3 && buzzwords.length > policy.maxBuzzwordCount) {
    warnings.push(`Too many buzzwords for level ${params.intensity}.`);
  }

  if (forbidden.length) {
    warnings.push(`Forbidden low-intensity terms used: ${forbidden.join(", ")}.`);
  }

  if (missingLockedFacts.length) {
    warnings.push(`Missing locked facts: ${missingLockedFacts.join(", ")}.`);
  }

  return {
    ok: warnings.length === 0,
    warnings,
    retention,
    buzzwordCount: buzzwords.length,
    wordCount: outputWordCount,
    maxRecommendedWords: Math.ceil(sourceWordCount * policy.maxLengthMultiplier),
  };
}

export function formatIntensityPolicy(policy: IntensityPolicy) {
  return [
    `INTENSITY POLICY (${policy.intensity} - ${policy.label}):`,
    `- Meaning retention target: ${policy.meaningRetentionTarget[0]}-${policy.meaningRetentionTarget[1]}%.`,
    `- Original wording retention target: ${policy.originalWordingRetention[0]}-${policy.originalWordingRetention[1]}%.`,
    `- Maximum buzzword count guidance: ${policy.maxBuzzwordCount}.`,
    `- Maximum output length guidance: ${policy.maxLengthMultiplier}x source length.`,
    `- Abstraction level: ${policy.abstractionLevel}`,
    `- Structural freedom: ${policy.structuralFreedom}`,
    `- Allowed rhetorical patterns: ${policy.allowedRhetoricalPatterns.join("; ")}.`,
    policy.forbiddenTerms?.length ? `- Forbidden terms: ${policy.forbiddenTerms.join(", ")}.` : "",
    ...policy.promptInstructions.map((instruction) => `- ${instruction}`),
  ]
    .filter(Boolean)
    .join("\n");
}
