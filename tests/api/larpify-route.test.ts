import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET as healthGet } from "@/app/api/health/ollama/route";
import { POST } from "@/app/api/larpify/route";
import { resetRateLimits } from "@/lib/rate-limit";
import { modelOutputSchema } from "@/lib/schema";
import {
  commentaryJson,
  fencedJson,
  localAiOutput,
  modelMissingResponse,
  ollamaResponse,
  scoreOverflowOutput,
} from "../fixtures/model-fixtures";

const validRequest = {
  input: "I ran a 30M parameter LLM on an ESP32.",
  intensity: 7,
  lockedFacts: ["ESP32", "30M parameter"],
  mode: "auto",
};

function request(body: unknown, init?: RequestInit) {
  return new Request("http://localhost/api/larpify", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": `test-${crypto.randomUUID()}` },
    body: typeof body === "string" ? body : JSON.stringify(body),
    ...init,
  }) as never;
}

function jsonResponse(payload: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(payload), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  ) as never;
}

describe("larpify API route", () => {
  beforeEach(() => {
    resetRateLimits();
    vi.stubEnv("OLLAMA_MODEL", "llama3.2:3b");
    vi.stubEnv("OLLAMA_BASE_URL", "http://ollama.test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns a valid schema response for a mocked Ollama success", async () => {
    vi.stubGlobal("fetch", vi.fn(() => jsonResponse(ollamaResponse(localAiOutput))));

    const response = await POST(request(validRequest));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(modelOutputSchema.safeParse(payload).success).toBe(true);
    expect(payload.larpified).toContain("ESP32");
    expect(payload.detectedDomains).toContain("Local AI");
    expect(JSON.stringify(payload)).not.toContain("OLLAMA_BASE_URL");
  });

  it("parses markdown-fenced and commentary-wrapped JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementationOnce(() => jsonResponse(ollamaResponse(fencedJson)))
        .mockImplementationOnce(() => jsonResponse(ollamaResponse(commentaryJson))),
    );

    const fenced = await POST(request(validRequest));
    const commentary = await POST(request({ ...validRequest, input: "I made a script that renames files." }));

    expect((await fenced.json()).larpified).toContain("ESP32");
    expect((await commentary.json()).larpified).toContain("file-renaming");
  });

  it("repairs malformed model JSON once, then validates the repaired output", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => jsonResponse(ollamaResponse("{ nope")))
      .mockImplementationOnce(() => jsonResponse(ollamaResponse(localAiOutput)));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(request(validRequest));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(payload.larpified).toContain("ESP32");
  });

  it("returns a controlled error when malformed JSON repair also fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementationOnce(() => jsonResponse(ollamaResponse("{ nope")))
        .mockImplementationOnce(() => jsonResponse(ollamaResponse("{ still nope"))),
    );

    const response = await POST(request(validRequest));
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload.joke).toContain("JSON");
    expect(payload.explanation).toContain("malformed JSON");
    expect(JSON.stringify(payload)).not.toContain("SyntaxError");
  });

  it("clamps invalid model scores", async () => {
    vi.stubGlobal("fetch", vi.fn(() => jsonResponse(ollamaResponse(scoreOverflowOutput))));

    const response = await POST(request(validRequest));
    const payload = await response.json();

    expect(payload.scores.buzzwordDensity).toBeLessThanOrEqual(100);
    expect(payload.scores.meaningRetained).toBeGreaterThanOrEqual(0);
    expect(payload.scores.larpIntensity).toBeLessThanOrEqual(100);
  });

  it("rejects invalid and malformed requests with controlled 4xx responses", async () => {
    vi.stubGlobal("fetch", vi.fn());

    const empty = await POST(request({ ...validRequest, input: "" }));
    const overlong = await POST(request({ ...validRequest, input: "x".repeat(501) }));
    const badJson = await POST(request("{ not json"));
    const badIntensity = await POST(request({ ...validRequest, intensity: 99 }));
    const badMode = await POST(request({ ...validRequest, mode: "chaos" }));

    for (const response of [empty, overlong, badJson, badIntensity, badMode]) {
      const payload = await response.json();
      expect(response.status).toBe(400);
      expect(payload.joke).toBeTruthy();
      expect(JSON.stringify(payload)).not.toContain("Error:");
    }

    expect(fetch).not.toHaveBeenCalled();
  });

  it("falls back cleanly when Ollama is unavailable, empty, timed out, or missing a model", async () => {
    for (const implementation of [
      () => Promise.reject(new Error("fetch failed ECONNREFUSED")),
      () => jsonResponse({ response: "" }),
      () => Promise.reject(new DOMException("The operation was aborted.", "AbortError")),
      () => jsonResponse(modelMissingResponse, 404),
    ]) {
      resetRateLimits();
      vi.stubGlobal("fetch", vi.fn(implementation as never));
      const response = await POST(request(validRequest));
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload.mode).toBe("fallback");
      expect(JSON.stringify(payload)).not.toContain("ECONNREFUSED");
    }
  });

  it("rate limits excessive requests without leaking internals", async () => {
    vi.stubGlobal("fetch", vi.fn(() => jsonResponse(ollamaResponse(localAiOutput))));
    const headers = { "Content-Type": "application/json", "x-forwarded-for": "rate-limit-test" };

    const responses = await Promise.all(
      Array.from({ length: 31 }, () =>
        POST(
          new Request("http://localhost/api/larpify", {
            method: "POST",
            headers,
            body: JSON.stringify(validRequest),
          }) as never,
        ),
      ),
    );

    expect(responses.at(-1)?.status).toBe(429);
    expect(await responses.at(-1)?.json()).toMatchObject({ joke: expect.any(String), explanation: expect.any(String) });
  });
});

describe("health API route", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("reports online and missing-model states", async () => {
    vi.stubEnv("OLLAMA_MODEL", "llama3.2:3b");
    vi.stubGlobal("fetch", vi.fn(() => jsonResponse({ models: [{ name: "llama3.2:3b" }] })));

    const online = await healthGet();
    expect(await online.json()).toMatchObject({ online: true, hasModel: true });

    vi.stubGlobal("fetch", vi.fn(() => jsonResponse({ models: [{ name: "other" }] })));
    const missing = await healthGet();
    expect(await missing.json()).toMatchObject({ online: true, hasModel: false });
  });

  it("reports unavailable health without sensitive stack traces", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("fetch failed ECONNREFUSED"))));

    const response = await healthGet();
    const payload = await response.json();

    expect(payload.online).toBe(false);
    expect(payload.hasModel).toBe(false);
    expect(JSON.stringify(payload)).not.toContain("stack");
    expect(JSON.stringify(payload)).not.toContain("ECONNREFUSED");
  });
});
