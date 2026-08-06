import { mkdir, writeFile } from "node:fs/promises";
import { generateFallback } from "../src/lib/fallback";
import { getIntensityPolicy, originalWordingRetention, validateIntensityCompliance, wordCount } from "../src/lib/intensity";
import { detectBuzzwords } from "../src/lib/scoring";
import type { LarpifyRequest } from "../src/lib/schema";

const sources = [
  {
    label: "Buzzwordmaxxing project description",
    input:
      "I made a website that turns normal sentences into exaggerated corporate and technology jargon. Users can choose different styles and control how ridiculous the result becomes.",
    lockedFacts: [],
  },
  {
    label: "ESP32 LLM",
    input: "I ran a 30M parameter LLM on an ESP32.",
    lockedFacts: ["30M parameter", "ESP32"],
  },
  {
    label: "File-renaming script",
    input: "I made a script that renames files.",
    lockedFacts: [],
  },
  {
    label: "Delayed corporate project",
    input: "The project is late because nobody finished the report.",
    lockedFacts: [],
  },
  {
    label: "Folder-monitoring email script",
    input: "A script checks a folder every ten minutes and sends an email when a new file appears.",
    lockedFacts: ["ten minutes"],
  },
];

type IntensityEvaluationRow = {
  source: string;
  intensity: number;
  label: string;
  output: string;
  wordCount: number;
  sourceTermRetention: number;
  buzzwordCount: number;
  meaningScore: number;
  lockedFactsPreserved: boolean;
  warnings: string[];
};

function requestFor(input: string, intensity: number, lockedFacts: string[]): LarpifyRequest {
  return {
    input,
    categories: ["ai", "corporate", "enterprise"],
    mode: "auto",
    styleDirection: "",
    presetChips: [],
    customStyleChips: [],
    intensity,
    lockedFacts,
  };
}

async function main() {
  const rows: IntensityEvaluationRow[] = [];

  for (const source of sources) {
    for (let intensity = 1; intensity <= 10; intensity += 1) {
      const request = requestFor(source.input, intensity, source.lockedFacts);
      const result = generateFallback(request, "fallback-intensity-evaluator");
      const compliance = validateIntensityCompliance({
        source: source.input,
        output: result.larpified,
        intensity,
        lockedFacts: source.lockedFacts,
      });

      rows.push({
        source: source.label,
        intensity,
        label: getIntensityPolicy(intensity).label,
        output: result.larpified,
        wordCount: wordCount(result.larpified),
        sourceTermRetention: originalWordingRetention(source.input, result.larpified),
        buzzwordCount: detectBuzzwords(result.larpified).length,
        meaningScore: result.scores.meaningRetained,
        lockedFactsPreserved: compliance.warnings.every((warning) => !warning.startsWith("Missing locked facts")),
        warnings: compliance.warnings,
      });
    }
  }

  const markdown = [
    "# Buzzwordmaxxing Intensity Evaluation",
    "",
    `Generated: ${new Date().toISOString()}`,
    "Mode: deterministic fallback fixtures",
    "",
    ...sources.flatMap((source) => [
      `## ${source.label}`,
      "",
      ...rows
        .filter((row) => row.source === source.label)
        .map((row) =>
          [
            `### ${row.intensity} - ${row.label}`,
            `- Word count: ${row.wordCount}`,
            `- Source-term retention: ${row.sourceTermRetention}%`,
            `- Buzzword count: ${row.buzzwordCount}`,
            `- Meaning score: ${row.meaningScore}`,
            `- Locked facts preserved: ${row.lockedFactsPreserved ? "yes" : "no"}`,
            `- Warnings: ${row.warnings.length ? row.warnings.join("; ") : "none"}`,
            "",
            row.output,
            "",
          ].join("\n"),
        ),
    ]),
  ].join("\n");

  await mkdir("test-results", { recursive: true });
  await writeFile("test-results/intensity-evaluation.json", JSON.stringify({ generatedAt: new Date().toISOString(), rows }, null, 2));
  await writeFile("test-results/intensity-evaluation.md", markdown);
  console.log(`Wrote intensity evaluation for ${rows.length} cases.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
