import { allBuzzwords, categories, type CategoryId } from "./categories";
import { allInjectorVocabulary } from "./injectors";
import { abstractionDelta, getIntensityPolicy, originalWordingRetention } from "./intensity";
import type { ModelOutput, Scores } from "./schema";

const corporateTerms = categories.corporate.vocabulary;

export function clampScore(score: number) {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function detectBuzzwords(text: string, vocabulary: readonly string[] = [...allBuzzwords, ...allInjectorVocabulary]) {
  const normalized = text.toLowerCase();
  const found = new Set<string>();

  for (const term of vocabulary) {
    const pattern = new RegExp(`\\b${escapeRegExp(term.toLowerCase())}\\b`, "i");

    if (pattern.test(normalized)) {
      found.add(term);
    }
  }

  return [...found];
}

function extractPreservedKeywords(input: string) {
  const matches = input.match(/\b(?:[A-Z]{2,}\d*|\d+(?:\.\d+)?[A-Za-z]*|[A-Za-z][A-Za-z0-9+#.-]{4,})\b/g);
  return [...new Set(matches ?? [])];
}

function scoreMeaningRetention(input: string, output: string, lockedFacts: readonly string[]) {
  const required = [...lockedFacts, ...extractPreservedKeywords(input)];

  if (required.length === 0) {
    return 80;
  }

  const normalizedOutput = output.toLowerCase();
  const retained = required.filter((fact) => normalizedOutput.includes(fact.toLowerCase()));

  return (retained.length / required.length) * 100;
}

export function adjustScores(params: {
  input: string;
  output: ModelOutput;
  categories: readonly CategoryId[];
  intensity: number;
  lockedFacts: readonly string[];
}): Scores & { usedBuzzwords: string[]; recoverability: number } {
  const selectedVocabulary = params.categories.flatMap((id) => categories[id].vocabulary);
  const detected = detectBuzzwords(params.output.larpified, selectedVocabulary);
  const modelTerms = params.output.usedBuzzwords.filter((term) =>
    params.output.larpified.toLowerCase().includes(term.toLowerCase()),
  );
  const usedBuzzwords = [...new Set([...detected, ...modelTerms])];
  const wordCount = Math.max(1, params.output.larpified.split(/\s+/).filter(Boolean).length);
  const wordingRetained = originalWordingRetention(params.input, params.output.larpified);
  const abstraction = abstractionDelta(params.input, params.output.larpified);
  const policy = getIntensityPolicy(params.intensity);
  const density = clampScore((usedBuzzwords.length / wordCount) * 420 + params.intensity * 4);
  const meaningRetained = clampScore(
    params.output.scores.meaningRetained * 0.35 +
      scoreMeaningRetention(params.input, params.output.larpified, params.lockedFacts) * 0.35 +
      wordingRetained * 0.3,
  );
  const corporateHits = detectBuzzwords(params.output.larpified, corporateTerms).length;
  const corporateContamination = clampScore(
    params.output.scores.corporateContamination * 0.55 + corporateHits * 16 + params.intensity * 3,
  );
  const larpIntensity = clampScore(
    params.output.scores.larpIntensity * 0.45 + density * 0.25 + abstraction * 0.2 + params.intensity * 10 * 0.1,
  );
  const recoverability = clampScore(
    meaningRetained * 0.55 +
      wordingRetained * 0.3 +
      (100 - density) * 0.15 +
      (params.intensity <= 5 ? 8 : params.intensity >= 9 ? -8 : 0),
  );

  return {
    buzzwordDensity: density,
    meaningRetained: clampScore((meaningRetained + policy.meaningRetentionTarget[0]) / 2),
    corporateContamination,
    larpIntensity,
    originalWordingRetained: wordingRetained,
    abstractionDelta: abstraction,
    usedBuzzwords,
    recoverability,
  };
}
