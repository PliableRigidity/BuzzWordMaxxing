import { mkdir, writeFile } from "node:fs/promises";
import { generateFallback } from "../src/lib/fallback";
import { validateFactPreservation } from "../src/lib/facts";
import type { LarpifyRequest } from "../src/lib/schema";

const inputs = [
  "I ran a 30M parameter LLM on an ESP32.",
  "My Raspberry Pi turns on my bedroom light.",
  "I made a Python script that sorts my Downloads folder.",
  "We installed Microsoft Teams.",
  "The website sends text to an OpenAI API.",
  "I host a dashboard on an old laptop.",
  "The meeting was postponed because nobody finished the report.",
  "The experiment worked seven times out of ten.",
  "I created a spreadsheet for tracking office snacks.",
  "The printer needed a new toner cartridge.",
];

function lockedFactsFor(input: string) {
  return [
    ...new Set(
      [
        ...(input.match(/\b\d+(?:\.\d+)?\s*(?:M|GB|users?|times?|tokens per second|of ten)?\b/gi) ?? []),
        ...(input.match(/\b(?:ESP32|Raspberry Pi|Microsoft Teams|OpenAI API|offline)\b/gi) ?? []),
      ].map((item) => item.trim()),
    ),
  ];
}

function baseRequest(input: string, variation: number): LarpifyRequest {
  return {
    input,
    categories: ["ai", "corporate", "localAi"],
    mode: "guided",
    styleDirection: variation % 2 ? "Management consulting mixed with local-AI maximalism" : "Academic startup language with responsibility avoidance",
    presetChips: variation % 2 ? ["Management Consulting", "Local AI"] : ["Academic Research", "Corporate Strategy"],
    customStyleChips: variation === 2 ? ["A procurement manager avoiding personal liability"] : [],
    intensity: 5 + variation,
    lockedFacts: lockedFactsFor(input),
  };
}

function similarity(a: string, b: string) {
  const left = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
  const right = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  const intersection = [...left].filter((word) => right.has(word)).length;
  const union = new Set([...left, ...right]).size;

  return union ? intersection / union : 0;
}

function warningsFor(results: Array<{ larpified: string; honestTranslation: string; verdict: string }>) {
  const warnings: string[] = [];
  const openingOperationalising = results.filter((result) => /^Fallback LARP: We're operationalising/i.test(result.larpified)).length;
  const enterpriseGrade = results.filter((result) => /enterprise-grade/i.test(result.larpified)).length;
  const verdicts = new Set(results.map((result) => result.verdict));
  const tooSimilar = results.some((result, index) =>
    results.slice(index + 1).some((other) => similarity(result.larpified, other.larpified) > 0.82),
  );

  if (openingOperationalising > results.length * 0.7) warnings.push("Too many outputs begin with the same operationalising phrase.");
  if (enterpriseGrade > results.length * 0.6) warnings.push("enterprise-grade appears very frequently.");
  if (verdicts.size < Math.max(2, Math.ceil(results.length / 4))) warnings.push("Verdicts are repetitive.");
  if (tooSimilar) warnings.push("Some generated outputs are highly similar.");

  for (const result of results) {
    if (result.larpified.split(/\s+/).length > 80) warnings.push(`Output too long for: ${result.honestTranslation}`);
    if (result.larpified.split(/\s+/).length < 8) warnings.push(`Output too short for: ${result.honestTranslation}`);
    if (result.honestTranslation === result.larpified) warnings.push(`Honest translation duplicates output: ${result.honestTranslation}`);
  }

  return warnings;
}

async function main() {
  const started = Date.now();
  const rows = [];

  for (const input of inputs) {
    for (let variation = 0; variation < 3; variation += 1) {
      const request = baseRequest(input, variation);
      const generationStarted = Date.now();
      const result = generateFallback(request, "fallback-evaluator");
      const latencyMs = Date.now() - generationStarted;
      const facts = validateFactPreservation(result.larpified, request.lockedFacts);

      rows.push({
        input,
        variation,
        latencyMs,
        larpified: result.larpified,
        honestTranslation: result.honestTranslation,
        detectedProfiles: result.detectedDomains,
        scores: result.scores,
        usedBuzzwords: result.usedBuzzwords,
        lockedFacts: request.lockedFacts,
        factsPreserved: facts.ok,
        missingFacts: facts.missingFacts,
        wordCount: result.larpified.split(/\s+/).filter(Boolean).length,
        outputValidity: "valid",
        verdict: result.verdict,
      });
    }
  }

  const warnings = warningsFor(rows);
  const report = {
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    mode: "fallback",
    rows,
    warnings,
  };
  const markdown = [
    "# Buzzwordmaxxing Output Quality Evaluation",
    "",
    `Generated: ${report.generatedAt}`,
    `Mode: ${report.mode}`,
    `Cases: ${rows.length}`,
    "",
    "## Warnings",
    warnings.length ? warnings.map((warning) => `- ${warning}`).join("\n") : "- None",
    "",
    "## Results",
    ...rows.map((row) =>
      [
        `### ${row.input} / variation ${row.variation + 1}`,
        `- Latency: ${row.latencyMs}ms`,
        `- Facts preserved: ${row.factsPreserved ? "yes" : `no (${row.missingFacts.join(", ")})`}`,
        `- Word count: ${row.wordCount}`,
        `- Detected profiles: ${row.detectedProfiles.join(", ")}`,
        `- Scores: ${JSON.stringify(row.scores)}`,
        "",
        row.larpified,
        "",
      ].join("\n"),
    ),
  ].join("\n");

  await mkdir("test-results", { recursive: true });
  await writeFile("test-results/output-quality.json", JSON.stringify(report, null, 2));
  await writeFile("test-results/output-quality.md", markdown);
  console.log(`Wrote output quality reports with ${warnings.length} warning(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
