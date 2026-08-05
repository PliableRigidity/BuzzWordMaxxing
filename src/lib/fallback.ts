import { categories, type CategoryId } from "./categories";
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
  const count = Math.min(8, Math.max(3, Math.ceil(intensity / 2) + 2));

  return terms.slice(0, count);
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
  const terms = selection.inspirationTerms.length ? selection.inspirationTerms : pickTerms(selection.domainIds, request.intensity);
  const primary = selectedCategories[0]?.classification ?? "Corporate LARP";
  const secondary = selectedCategories[1]?.classification ?? "Honourable Engineering LARP";
  const subject = request.input.replace(/[.!?]+$/g, "");
  const styleDescription = [...request.presetChips, ...request.customStyleChips, request.styleDirection]
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4)
    .join(", ");
  const abstraction =
    request.intensity >= 8
      ? "post-actionability value-creation movement"
      : request.intensity >= 5
        ? "enterprise-ready capability surface"
        : "lightly optimised workflow";

  const output: ModelOutput = {
    larpified: `Fallback LARP: We're operationalising ${subject} as a ${styleDescription ? `${styleDescription} ` : ""}${terms
      .slice(0, 3)
      .join(", ")} ${abstraction}, with ${terms.slice(3, 6).join(", ")} embedded across the delivery motion.`,
    honestTranslation: subject,
    scores: {
      buzzwordDensity: 55 + request.intensity * 4,
      meaningRetained: 88,
      corporateContamination: 45 + request.intensity * 3,
      larpIntensity: request.intensity * 10,
    },
    classification: {
      primary: "Fallback LARP",
      secondary: primary === secondary ? "Corporate LARP" : secondary,
    },
    verdict: verdicts[request.intensity % verdicts.length],
    usedBuzzwords: terms,
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
