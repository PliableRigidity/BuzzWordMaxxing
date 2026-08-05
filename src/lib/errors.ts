import type { ControlledError } from "./schema";

export class AppError extends Error {
  readonly controlled: ControlledError;

  constructor(controlled: ControlledError) {
    super(controlled.explanation);
    this.name = "AppError";
    this.controlled = controlled;
  }
}

export function mapOllamaError(error: unknown): ControlledError {
  if (error instanceof AppError) {
    return error.controlled;
  }

  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("timeout") || message.includes("aborted")) {
    return {
      joke: "The model entered a strategic thinking offsite.",
      explanation: "The local model took too long to respond. Try a shorter input or a smaller Ollama model.",
      status: 504,
    };
  }

  if (message.includes("empty response")) {
    return {
      joke: "The model returned a beautifully formatted absence.",
      explanation: "The local model did not return usable text, so deterministic fallback can preserve availability.",
      status: 503,
    };
  }

  if (message.includes("model") && (message.includes("not found") || message.includes("pull"))) {
    return {
      joke: "The selected model is still in stealth mode.",
      explanation: "Download the configured model with `ollama pull llama3.2:3b` or update OLLAMA_MODEL.",
      status: 503,
    };
  }

  if (
    message.includes("econnrefused") ||
    message.includes("fetch failed") ||
    message.includes("failed to fetch") ||
    message.includes("connect")
  ) {
    return {
      joke: "Ollama is currently experiencing a local alignment opportunity.",
      explanation: "Make sure Ollama is installed, running, and reachable at the configured base URL.",
      status: 503,
    };
  }

  return {
    joke: "The local intelligence substrate failed to socialise a response.",
    explanation: "The app caught the model error and kept internal details out of the browser.",
    status: 500,
  };
}

export const malformedJsonError: ControlledError = {
  joke: "The model produced artisanal JSON-adjacent thought leadership.",
  explanation: "The local model returned malformed JSON and the automatic repair attempt also failed.",
  status: 502,
};
