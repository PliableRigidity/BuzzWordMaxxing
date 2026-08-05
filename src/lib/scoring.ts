import { allBuzzwords, categories, type CategoryId } from "./categories";
import { allInjectorVocabulary } from "./injectors";
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
  const density = clampScore((usedBuzzwords.length / wordCount) * 420 + params.intensity * 4);
  const meaningRetained = clampScore(
    (params.output.scores.meaningRetained + scoreMeaningRetention(params.input, params.output.larpified, params.lockedFacts)) /
      2,
  );
  const corporateHits = detectBuzzwords(params.output.larpified, corporateTerms).length;
  const corporateContamination = clampScore(
    params.output.scores.corporateContamination * 0.55 + corporateHits * 16 + params.intensity * 3,
  );
  const larpIntensity = clampScore(
    params.output.scores.larpIntensity * 0.6 + density * 0.25 + params.intensity * 10 * 0.15,
  );
  const recoverability = clampScore(meaningRetained * 0.7 + (100 - density) * 0.3);

  return {
    buzzwordDensity: density,
    meaningRetained,
    corporateContamination,
    larpIntensity,
    usedBuzzwords,
    recoverability,
  };
}
