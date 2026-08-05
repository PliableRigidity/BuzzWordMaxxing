import { NextResponse } from "next/server";
import { mapOllamaError } from "@/lib/errors";
import { checkOllamaHealth, getOllamaConfig } from "@/lib/ollama";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json(await checkOllamaHealth());
  } catch (error) {
    const controlled = mapOllamaError(error);

    return NextResponse.json({
      online: false,
      hasModel: false,
      model: getOllamaConfig().model,
      baseUrl: getOllamaConfig().baseUrl,
      status: "Local Model Unavailable - Fallback LARP Active",
      joke: controlled.joke,
      explanation: controlled.explanation,
    });
  }
}
