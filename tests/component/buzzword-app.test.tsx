// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BuzzwordApp } from "@/components/BuzzwordApp";
import { findReferenceScenario } from "@/data/referenceScenarios";
import { localAiOutput } from "../fixtures/model-fixtures";

function mockFetch() {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);

    if (url.includes("/api/health/ollama")) {
      return new Response(
        JSON.stringify({
          status: "Local Model Online",
          model: "llama3.2:3b",
          explanation: "Ollama is reachable.",
          online: true,
          hasModel: true,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    if (url.includes("/api/larpify")) {
      return new Response(JSON.stringify({ ...localAiOutput, mode: "ollama", model: "llama3.2:3b", status: "ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("not found", { status: 404 });
  });
}

describe("BuzzwordApp component", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch());
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("updates source input and disables generation when empty", async () => {
    render(<BuzzwordApp />);
    const input = screen.getByLabelText(/source statement/i);
    const button = screen.getByRole("button", { name: /operationalise/i });

    expect(button).toBeDisabled();
    expect(button).toBeDisabled();
    await userEvent.type(input, "I made a script that renames files.");
    expect(screen.getByText(/Source material utilisation: 37\/500/i)).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  it("starts with an unselected example picker", () => {
    render(<BuzzwordApp />);

    expect(screen.getByLabelText(/try an example/i)).toHaveDisplayValue("Choose an example...");
    expect(screen.getByLabelText(/source statement/i)).toHaveValue("");
  });

  it("selecting an example populates source text without auto-generating", async () => {
    const fetchMock = mockFetch();
    vi.stubGlobal("fetch", fetchMock);
    render(<BuzzwordApp />);
    const scenario = findReferenceScenario("software-form-database");

    await userEvent.selectOptions(screen.getByLabelText(/try an example/i), "software-form-database");

    expect(screen.getByLabelText(/source statement/i)).toHaveValue(scenario?.source);
    expect(screen.getByLabelText(/try an example/i)).toHaveDisplayValue(scenario?.label ?? "");
    expect(screen.getByText(/Operationalise the source material/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining("/api/larpify"), expect.anything());
  });

  it("selecting an example can populate locked facts", async () => {
    render(<BuzzwordApp />);

    await userEvent.selectOptions(screen.getByLabelText(/try an example/i), "hardware-esp32-temperature");

    expect(screen.getByLabelText(/source statement/i)).toHaveValue("An ESP32 reads a temperature sensor.");
    expect(screen.getByRole("button", { name: /remove ESP32/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /remove temperature sensor/i })).toBeInTheDocument();
  });

  it("keeps custom input until the user confirms replacement", async () => {
    render(<BuzzwordApp />);
    const input = screen.getByLabelText(/source statement/i);

    await userEvent.type(input, "My custom source should stay here.");
    await userEvent.selectOptions(screen.getByLabelText(/try an example/i), "office-printer-toner");

    expect(input).toHaveValue("My custom source should stay here.");
    expect(screen.getByText(/Replace your current source/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /replace source with example/i }));
    expect(input).toHaveValue("The printer needed a new toner cartridge.");
  });

  it("randomises to a valid example", async () => {
    render(<BuzzwordApp />);

    await userEvent.click(screen.getByRole("button", { name: /randomise source material/i }));

    expect(screen.getByLabelText(/source statement/i)).not.toHaveValue("");
    expect(screen.getByLabelText(/try an example/i)).not.toHaveDisplayValue("Choose an example...");
  });

  it("switches to directed mode, expands direction controls, and preserves source text", async () => {
    render(<BuzzwordApp />);
    const input = screen.getByLabelText(/source statement/i);
    await userEvent.clear(input);
    await userEvent.type(input, "My dashboard runs on an old laptop.");
    await userEvent.click(screen.getByRole("tab", { name: /directed/i }));

    expect(screen.getByLabelText(/strategic direction/i)).toHaveFocus();
    expect(input).toHaveValue("My dashboard runs on an old laptop.");
  });

  it("opens the capability library, searches, selects a profile, and prevents duplicate active selection", async () => {
    render(<BuzzwordApp />);
    await userEvent.click(screen.getByRole("button", { name: /transformation direction/i }));
    await userEvent.click(screen.getByRole("button", { name: /browse capability library/i }));
    const search = screen.getByPlaceholderText(/search professional subcultures/i);
    await userEvent.type(search, "AI wrapper");
    await userEvent.keyboard("{Enter}");

    expect(await screen.findByText("API Call in a Trench Coat")).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem("buzzwordmaxxing:recent-injectors") ?? "[]")).toContain(
      "api-call-in-a-trench-coat",
    );
  });

  it("adds and removes factual constraints through the disclosure", async () => {
    render(<BuzzwordApp />);
    await userEvent.click(screen.getByRole("button", { name: /factual governance/i }));
    const input = screen.getByLabelText(/factual constraints/i);

    await userEvent.type(input, "entirely offline{Enter}");
    expect(screen.getByText("entirely offline")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /remove entirely offline/i }));
    expect(screen.queryByText("entirely offline")).not.toBeInTheDocument();
  });

  it("generates, shows output sections, and copies larpified text", async () => {
    render(<BuzzwordApp />);
    await userEvent.type(screen.getByLabelText(/source statement/i), "I ran a 30M parameter LLM on an ESP32.");
    await userEvent.click(screen.getByRole("button", { name: /operationalise/i }));

    expect(await screen.findByText(/We are operationalising a 30M-parameter/i)).toBeInTheDocument();
    expect(screen.getByText(/Plain-Language Disclosure/i)).toBeInTheDocument();
    expect(screen.getByText(/Transformation Diagnostics/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /socialise/i }));
    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining("ESP32")));
  });
});
