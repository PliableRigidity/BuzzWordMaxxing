import { NextResponse, type NextRequest } from "next/server";
import { generateFallback } from "@/lib/fallback";
import { mapOllamaError } from "@/lib/errors";
import { generateWithOllama, getOllamaConfig } from "@/lib/ollama";
import { checkRateLimit } from "@/lib/rate-limit";
import { validateLarpifyRequest } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      {
        joke: "The synergy pipeline is temporarily saturated.",
        explanation: "Too many local requests arrived in a short window. Wait a minute and try again.",
      },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = validateLarpifyRequest(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        joke: "The input failed basic stakeholder alignment.",
        explanation: parsed.error.issues[0]?.message ?? "Check the sentence, categories, intensity, and locked facts.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await generateWithOllama(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    const controlled = mapOllamaError(error);

    if (controlled.status === 503 || controlled.status === 504) {
      return NextResponse.json(generateFallback(parsed.data, getOllamaConfig().model));
    }

    return NextResponse.json(
      {
        joke: controlled.joke,
        explanation: controlled.explanation,
      },
      { status: controlled.status },
    );
  }
}
