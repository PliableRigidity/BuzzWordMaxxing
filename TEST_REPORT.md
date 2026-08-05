# Buzzwordmaxxing Test Report

Generated: 2026-08-06 00:40 Europe/London

## Summary

The automated test system now covers deterministic unit behavior, API behavior with mocked Ollama responses, component interactions, browser E2E flows, accessibility, responsive layout, visual smoke checks, an optional live Ollama gate, output-quality evaluation, coverage, build verification, linting, typechecking and dependency audit.

## Verified Commands

| Command | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run test` | Pass: 4 files, 51 tests |
| `npm run test:coverage` | Pass |
| `npm run build` | Pass |
| `npm run test:e2e` | Pass: 20 browser tests |
| `npm run test:a11y` | Pass: 4 axe-backed tests |
| `npm run test:visual` | Pass: 2 visual smoke tests |
| `npm run test:live-model` | Pass: optional suite gated unless live tests are enabled |
| `npm run evaluate:outputs` | Pass: wrote output quality artifacts |
| `npm audit --audit-level=moderate` | Pass: 0 vulnerabilities |

## Coverage

Vitest coverage uses the V8 provider and enforces project thresholds.

| Metric | Coverage |
| --- | ---: |
| Statements | 95.57% |
| Branches | 84.38% |
| Functions | 93.07% |
| Lines | 96.44% |

## Browser Coverage

Playwright runs against Chromium with the Next dev server at `http://localhost:3000`.

Covered flows include:

- Default autonomous generation, copy and reframe.
- Directed generation with custom direction and selected injector profile.
- Governed generation with selected profile and locked facts.
- Fallback response rendering.
- Controlled API failure and retry without refresh.
- Prompt-injection text rendered safely.
- Keyboard-only profile selection and generation.
- Refresh during generation recovery.

Responsive checks cover:

- `1920x1080`
- `1600x900`
- `1440x900`
- `1366x768`
- `1280x800`
- `1024x768`
- `768x1024`
- `390x844`
- `320x700`
- `390x844` with enlarged text simulation

## Accessibility

Axe scans pass with no serious or critical violations for:

- Empty homepage.
- Directed mode with the profile library open.
- Successful generated output on mobile.
- Error state with recovery action.

The muted text token was darkened to satisfy WCAG AA contrast on the warm page background.

## Output Quality

`npm run evaluate:outputs` generates:

- `test-results/output-quality.json`
- `test-results/output-quality.md`

The current fallback evaluator produced 30 cases with preserved locked facts. It reported two quality warnings:

- Too many outputs begin with the same operationalising phrase.
- Verdicts are repetitive.

These warnings are intentionally surfaced as product-quality signals rather than test failures.

## CI

GitHub Actions now runs install, Playwright browser setup, typecheck, lint, Vitest, production build, E2E and accessibility tests, and uploads the Playwright report on failure.
