import { generateFallback } from "./fallback";
import { validateIntensityCompliance } from "./intensity";
import { buildLowIntensityRepairPrompt, buildRepairPrompt, buildSystemPrompt, buildUserPrompt } from "./prompt";
import { adjustScores } from "./scoring";
import type { LarpifyRequest, LarpifyResponse, ModelOutput } from "./schema";
import { modelOutputSchema } from "./schema";
import { AppError, malformedJsonError } from "./errors";
import { selectVocabulary } from "./style";

const DEFAULT_BASE_URL = "http://localhost:11434";
const DEFAULT_MODEL = "llama3.2:3b";
const REQUEST_TIMEOUT_MS = 25000;
const HEALTH_TIMEOUT_MS = 2500;

type OllamaGenerateResponse = {
  response?: string;
  error?: string;
};

export function getOllamaConfig() {
  return {
    baseUrl: process.env.OLLAMA_BASE_URL ?? DEFAULT_BASE_URL,
    model: process.env.OLLAMA_MODEL ?? DEFAULT_MODEL,
  };
}

async function postGenerate(params: {
  baseUrl: string;
  model: string;
  prompt: string;
  system?: string;
  timeoutMs?: number;
}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error("timeout")), params.timeoutMs ?? REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${params.baseUrl.replace(/\/$/u, "")}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: params.model,
        prompt: params.prompt,
        system: params.system,
        stream: false,
        format: "json",
        options: {
          temperature: 0.85,
          num_predict: 700,
        },
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as OllamaGenerateResponse;

    if (!response.ok || payload.error) {
      throw new Error(payload.error ?? `Ollama returned ${response.status}`);
    }

    if (!payload.response) {
      throw new Error("Ollama returned an empty response");
    }

    return payload.response;
  } finally {
    clearTimeout(timer);
  }
}

function extractJsonCandidate(response: string) {
  const trimmed = response.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

export function parseModelJson(response: string) {
  const parsed = modelOutputSchema.safeParse(JSON.parse(extractJsonCandidate(response)));

  if (parsed.success) {
    return parsed.data;
  }

  throw new Error("Model JSON failed schema validation");
}

async function parseWithRepair(params: { raw: string; baseUrl: string; model: string }) {
  try {
    return parseModelJson(params.raw);
  } catch {
    const repaired = await postGenerate({
      baseUrl: params.baseUrl,
      model: params.model,
      system: buildSystemPrompt(),
      prompt: buildRepairPrompt(params.raw),
      timeoutMs: 12000,
    });

    try {
      return parseModelJson(repaired);
    } catch {
      throw new AppError(malformedJsonError);
    }
  }
}

async function repairLowIntensityOutput(params: {
  request: LarpifyRequest;
  selection: ReturnType<typeof selectVocabulary>;
  output: ModelOutput;
  warnings: readonly string[];
  baseUrl: string;
  model: string;
}) {
  try {
    const repaired = await postGenerate({
      baseUrl: params.baseUrl,
      model: params.model,
      system: buildSystemPrompt(),
      prompt: buildLowIntensityRepairPrompt({
        request: params.request,
        badOutput: params.output.larpified,
        warnings: params.warnings,
        selection: params.selection,
      }),
      timeoutMs: 12000,
    });

    return parseWithRepair({ raw: repaired, baseUrl: params.baseUrl, model: params.model });
  } catch {
    return null;
  }
}

export async function generateWithOllama(request: LarpifyRequest): Promise<LarpifyResponse> {
  const { baseUrl, model } = getOllamaConfig();
  const selection = selectVocabulary({
    input: request.input,
    intensity: request.intensity,
    mode: request.mode,
    styleDirection: request.styleDirection,
    presetChips: request.presetChips,
    customStyleChips: request.customStyleChips,
    manualCategories: request.categories,
  });
  const raw = await postGenerate({
    baseUrl,
    model,
    system: buildSystemPrompt(),
    prompt: buildUserPrompt(request, selection),
  });
  let output: ModelOutput = await parseWithRepair({ raw, baseUrl, model });
  const compliance = validateIntensityCompliance({
    source: request.input,
    output: output.larpified,
    intensity: request.intensity,
    lockedFacts: request.lockedFacts,
  });

  if (request.intensity <= 3 && !compliance.ok) {
    const repaired = await repairLowIntensityOutput({
      request,
      selection,
      output,
      warnings: compliance.warnings,
      baseUrl,
      model,
    });

    if (!repaired) {
      return generateFallback(request, model);
    }

    output = repaired;
  }
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
    mode: "ollama",
    model,
    status: "ok",
  };
}

export async function checkOllamaHealth() {
  const { baseUrl, model } = getOllamaConfig();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error("timeout")), HEALTH_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/u, "")}/api/tags`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}`);
    }

    const payload = (await response.json()) as { models?: Array<{ name?: string }> };
    const models = payload.models?.map((item) => item.name).filter(Boolean) ?? [];
    const hasModel = models.includes(model);

    return {
      online: true,
      hasModel,
      model,
      baseUrl,
      status: hasModel ? "Local Model Online" : "Local Model Unavailable - Fallback LARP Active",
      explanation: hasModel
        ? "Ollama is reachable and the configured model is installed."
        : "Ollama is reachable, but the configured model has not been downloaded.",
    };
  } finally {
    clearTimeout(timer);
  }
}
