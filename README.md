# Buzzwordmaxxing

Buzzwordmaxxing turns ordinary sentences into absurdly over-engineered, corporate, AI-startup, enterprise-grade technology movements. It is affectionate satire for people who have spent too much time around local AI, homelabs, open source, consulting decks, and founder posts.

The interface supports Autonomous, Directed, and Governed modes. Autonomous mode infers the jargon domains from the sentence, Directed mode adds free-form style direction and removable chips, and Governed mode keeps precise internal category control tucked behind an advanced panel.

## Prerequisites

- Node.js 20+ recommended
- npm
- Ollama installed for local LLM inference

The app never calls a cloud AI API. The browser calls the Next.js backend, and the backend calls Ollama.

## Install

```bash
npm install
```

## Ollama Setup

Download the default model:

```bash
ollama pull llama3.2:3b
```

Start Ollama:

```bash
ollama serve
```

Create a local environment file. Keep this file local and do not commit it:

```bash
cp .env.example .env.local
```

Required variables:

```bash
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
```

`OLLAMA_BASE_URL` should point to the Ollama server reachable from the Next.js backend. `OLLAMA_MODEL` should match an installed local model. To change the model, update `OLLAMA_MODEL` and pull that model with Ollama.

## Development

```bash
npm run dev
```

Open http://localhost:3000.

## Tests

```bash
npm run test
npm run test:coverage
npm run test:e2e
npm run test:a11y
npm run test:visual
```

The optional live Ollama suite is disabled by default unless the local environment is ready:

```bash
RUN_LIVE_MODEL_TESTS=true npm run test:live-model
```

Output-quality reports can be generated with:

```bash
npm run evaluate:outputs
```

## Quality Checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Production Build

```bash
npm run build
npm run start
```

## Deployment Notes

Deploy the Next.js app wherever the server runtime can reach an Ollama endpoint, then configure `OLLAMA_BASE_URL` and `OLLAMA_MODEL` as environment variables in that runtime. Do not expose Ollama credentials, private hostnames, or private network details to the browser. The frontend only calls the app's own `/api/larpify` and `/api/health/ollama` routes.

## Architecture

- `src/components/BuzzwordApp.tsx` contains the interactive MVP UI.
- `src/lib/categories.ts` stores typed category vocabularies and style guidance.
- `src/lib/style.ts` handles generation modes, style chips, duplicate prevention, domain inference, and limited vocabulary sampling.
- `src/lib/prompt.ts` builds the system prompt, user prompt, and repair prompt.
- `src/lib/ollama.ts` keeps all Ollama calls server-side.
- `src/lib/schema.ts` validates requests and structured model output with Zod.
- `src/lib/scoring.ts` applies hybrid scoring using model suggestions plus vocabulary matching and fact retention.
- `src/lib/fallback.ts` provides deterministic fallback generation when Ollama is unavailable.
- `src/app/api/larpify/route.ts` validates requests, rate-limits local usage, calls Ollama, and falls back when appropriate.
- `src/app/api/health/ollama/route.ts` checks local model availability.

## Interface System

The UI uses a small dark enterprise design system defined in `src/app/globals.css`.

- Colour tokens cover page, surface, elevated surface, borders, primary/secondary/muted text, accent, success, warning, error, and focus states.
- Panels use a consistent `rounded-panel`, border, and shadow treatment.
- Buttons use primary, secondary, ghost, and danger variants inside the app component.
- Badges and chips use restrained borders and muted surfaces rather than bright tag clouds.
- Metrics use compact diagnostic rows with a single accent progress treatment and warning only for extreme values.
- Motion is intentionally subtle and respects `prefers-reduced-motion`.

## Fallback Mode

If Ollama is not installed, not running, times out, or the configured model is unavailable, the backend returns a deterministic "Fallback LARP" response. It uses inferred domains, selected presets, custom style chips, and manually selected categories when present. It preserves the original subject, marks the result as fallback, and keeps the demo usable without a model.

Malformed model JSON is handled differently: the backend attempts one repair request. If repair fails, the API returns a controlled error instead of crashing or exposing internals.

## Future Cloud API Notes

A cloud model can be added behind the same server-side generation boundary later. Keep the browser contract pointed at `/api/larpify`, add a provider abstraction beside the Ollama client, and keep request validation, scoring, and output schema enforcement unchanged.
