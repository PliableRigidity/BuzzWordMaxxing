import { categories, type CategoryId } from "./categories";
import { getIntensityPolicy } from "./intensity";
import { adjustScores } from "./scoring";
import type { LarpifyRequest, LarpifyResponse, ModelOutput } from "./schema";
import { selectVocabulary } from "./style";

const verdicts = [
  "Technically impressive, operationally questionable.",
  "No use case detected. Respect awarded.",
  "CRUD application exhibiting early-stage AGI symptoms.",
  "Multi-agent architecture successfully reproduced a shell command.",
  "Financially irrational. Architecturally beautiful.",
  "Certified edge-compute LARP.",
];

function pickTerms(ids: readonly CategoryId[], intensity: number) {
  const terms = ids.flatMap((id) => categories[id].vocabulary);
  const count = Math.min(14, Math.max(1, Math.ceil(intensity * 1.2)));

  return terms.slice(0, count);
}

function lightlyPolish(input: string) {
  return input
    .trim()
    .replace(/\bmade\b/i, "made")
    .replace(/\bturns\b/i, "turns")
    .replace(/\s+/g, " ")
    .replace(/([^.?!])$/u, "$1.");
}

function moderateFallback(subject: string, terms: readonly string[], styleDescription: string) {
  const primaryTerms = terms.slice(0, 4).join(", ");
  const style = styleDescription ? `${styleDescription} ` : "";

  return `Fallback LARP: I built a ${style}configurable capability that reframes ${subject} through ${primaryTerms} while keeping the original function visible.`;
}

function anchorPhrase(input: string, lockedFacts: readonly string[]) {
  const detected = input.match(/\b(?:[A-Z]{2,}\d*|\d+(?:\.\d+)?\s*[A-Za-z]*|Raspberry Pi|ESP32|LLM|API)\b/g) ?? [];
  const anchors = [...new Set([...lockedFacts, ...detected].map((item) => item.trim()).filter(Boolean))].slice(0, 4);

  return anchors.length ? anchors.join(", ") : "the original source activity";
}

function severeFallback(params: {
  subject: string;
  input: string;
  terms: readonly string[];
  styleDescription: string;
  intensity: number;
  lockedFacts: readonly string[];
}) {
  const uniqueTerms = [...new Set(params.terms)];
  const primaryTerms = uniqueTerms.slice(0, params.intensity >= 9 ? 7 : 5).join(", ");
  const secondaryTerms = uniqueTerms.slice(params.intensity >= 9 ? 7 : 5, params.intensity >= 9 ? 12 : 9).join(", ");
  const style = params.styleDescription ? `${params.styleDescription}, ` : "";
  const subjectReference = params.intensity >= 9 ? anchorPhrase(params.input, params.lockedFacts) : params.subject;

  return `Fallback LARP: We're operationalising ${style}${subjectReference} as a category-defining semantic capability layer, combining ${primaryTerms} across an enterprise-grade abstraction surface${secondaryTerms ? ` with ${secondaryTerms} embedded into the strategic delivery motion` : ""}.`;
}

export function generateFallback(request: LarpifyRequest, model: string): LarpifyResponse {
  const selection = selectVocabulary({
    input: request.input,
    intensity: request.intensity,
    mode: request.mode,
    styleDirection: request.styleDirection,
    presetChips: request.presetChips,
    customStyleChips: request.customStyleChips,
    manualCategories: request.categories,
  });
  const selectedCategories = selection.domainIds.map((id) => categories[id]);
  const policy = getIntensityPolicy(request.intensity);
  const terms = selection.inspirationTerms.length ? selection.inspirationTerms : pickTerms(selection.domainIds, request.intensity);
  const primary = selectedCategories[0]?.classification ?? "Corporate LARP";
  const secondary = selectedCategories[1]?.classification ?? "Honourable Engineering LARP";
  const subject = request.input.replace(/[.!?]+$/g, "");
  const styleDescription = [...request.presetChips, ...request.customStyleChips, request.styleDirection]
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4)
    .join(", ");
  const larpified =
    request.intensity <= 2
      ? lightlyPolish(request.input)
      : request.intensity <= 4
        ? `${lightlyPolish(subject)} This adds ${terms.slice(0, Math.min(policy.maxBuzzwordCount, 2)).join(" and ")} framing.`
        : request.intensity <= 6
          ? moderateFallback(subject, terms, styleDescription)
          : severeFallback({
              subject,
              input: request.input,
              terms,
              styleDescription,
              intensity: request.intensity,
              lockedFacts: request.lockedFacts,
            });

  const output: ModelOutput = {
    larpified,
    honestTranslation: subject,
    scores: {
      buzzwordDensity: request.intensity <= 2 ? 5 + request.intensity * 3 : 30 + request.intensity * 6,
      meaningRetained: Math.max(25, 100 - request.intensity * 6),
      corporateContamination: 45 + request.intensity * 3,
      larpIntensity: request.intensity * 10,
    },
    classification: {
      primary: "Fallback LARP",
      secondary: primary === secondary ? "Corporate LARP" : secondary,
    },
    verdict: verdicts[request.intensity % verdicts.length],
    usedBuzzwords: request.intensity <= 2 ? terms.slice(0, policy.maxBuzzwordCount) : terms,
    detectedDomains: selection.detectedDomains,
  };

  const adjusted = adjustScores({
    input: request.input,
    output,
    categories: selection.domainIds,
    intensity: request.intensity,
    lockedFacts: request.lockedFacts,
  });
  const scores = {
    buzzwordDensity: adjusted.buzzwordDensity,
    meaningRetained: adjusted.meaningRetained,
    corporateContamination: adjusted.corporateContamination,
    larpIntensity: adjusted.larpIntensity,
    originalWordingRetained: adjusted.originalWordingRetained,
    abstractionDelta: adjusted.abstractionDelta,
  };

  return {
    ...output,
    scores,
    usedBuzzwords: adjusted.usedBuzzwords,
    detectedDomains: selection.detectedDomains,
    mode: "fallback",
    model,
    status: "fallback",
  };
}
