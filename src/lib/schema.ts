import { z } from "zod";
import { categoryIds, defaultCategories } from "./categories";
import {
  generationModes,
  MAX_STYLE_CHIP_LENGTH,
  MAX_STYLE_CHIPS,
  MAX_STYLE_DIRECTION_LENGTH,
  normaliseStyleChip,
} from "./style";

export const MAX_INPUT_LENGTH = 500;
export const MAX_LOCKED_FACTS = 12;
export const MAX_LOCKED_FACT_LENGTH = 80;

export const scoreSchema = z.object({
  buzzwordDensity: z.number(),
  meaningRetained: z.number(),
  corporateContamination: z.number(),
  larpIntensity: z.number(),
});

export const modelOutputSchema = z.object({
  larpified: z.string().min(1),
  honestTranslation: z.string().min(1),
  scores: scoreSchema,
  classification: z.object({
    primary: z.string().min(1),
    secondary: z.string().min(1),
  }),
  verdict: z.string().min(1),
  usedBuzzwords: z.array(z.string()).default([]),
  detectedDomains: z.array(z.string()).default([]),
});

export type ModelOutput = z.infer<typeof modelOutputSchema>;
export type Scores = z.infer<typeof scoreSchema>;

export const larpifyRequestSchema = z
  .object({
    input: z
      .string()
      .transform((value) => value.trim())
      .pipe(
        z
          .string()
          .min(1, "Enter a sentence before operationalising the void.")
          .max(MAX_INPUT_LENGTH, `Keep it under ${MAX_INPUT_LENGTH} characters.`),
      ),
    categories: z.array(z.enum(categoryIds)).min(1).max(categoryIds.length).default(defaultCategories),
    mode: z.enum(generationModes).default("auto"),
    styleDirection: z
      .string()
      .transform((value) => value.trim())
      .pipe(z.string().max(MAX_STYLE_DIRECTION_LENGTH))
      .default(""),
    presetChips: z
      .array(
        z
          .string()
          .transform((value) => value.trim())
          .pipe(z.string().min(1).max(MAX_STYLE_CHIP_LENGTH)),
      )
      .max(MAX_STYLE_CHIPS)
      .default([]),
    customStyleChips: z
      .array(
        z
          .string()
          .transform((value) => value.trim())
          .pipe(z.string().min(1).max(MAX_STYLE_CHIP_LENGTH)),
      )
      .max(MAX_STYLE_CHIPS)
      .default([]),
    intensity: z.number().int().min(1).max(10),
    lockedFacts: z
      .array(
        z
          .string()
          .transform((value) => value.trim())
          .pipe(z.string().min(1).max(MAX_LOCKED_FACT_LENGTH)),
      )
      .max(MAX_LOCKED_FACTS)
      .default([]),
  })
  .superRefine((value, context) => {
    const chips = [...value.presetChips, ...value.customStyleChips].map((chip) => normaliseStyleChip(chip).toLowerCase());

    if (new Set(chips).size !== chips.length) {
      context.addIssue({
        code: "custom",
        message: "Style chips must be unique.",
        path: ["customStyleChips"],
      });
    }
  });

export type LarpifyRequest = z.infer<typeof larpifyRequestSchema>;

export type LarpifyResponse = ModelOutput & {
  mode: "ollama" | "fallback";
  model: string;
  status: "ok" | "fallback";
};

export type ControlledError = {
  joke: string;
  explanation: string;
  status: number;
};
