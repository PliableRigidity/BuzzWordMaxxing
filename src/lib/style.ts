import { categories, categoryIds, type CategoryId } from "./categories";
import {
  getQuickInjectors,
  resolveInjectors,
  suggestInjectors,
  type InjectorProfile,
} from "./injectors";

export const generationModes = ["auto", "guided", "manual"] as const;
export type GenerationMode = (typeof generationModes)[number];

export const quickPresets = getQuickInjectors().map((profile) => profile.label);

export const MAX_STYLE_CHIPS = 20;
export const MAX_STYLE_CHIP_LENGTH = 80;
export const MAX_STYLE_DIRECTION_LENGTH = 280;

export type StyleSelectionInput = {
  input: string;
  intensity: number;
  mode: GenerationMode;
  styleDirection?: string;
  presetChips?: readonly string[];
  customStyleChips?: readonly string[];
  manualCategories?: readonly CategoryId[];
};

export type VocabularySelection = {
  domainIds: CategoryId[];
  detectedDomains: string[];
  inspirationTerms: string[];
  styleSignals: string[];
  activeInjectors: InjectorProfile[];
  suggestedInjectors: InjectorProfile[];
  styleInstructions: string[];
  rhetoricalPatterns: string[];
  humourTags: string[];
};

const presetMappings: Record<string, CategoryId[]> = {
  corporate: ["corporate", "enterprise"],
  "corporate strategy": ["corporate", "enterprise"],
  "ai founder": ["ai", "startup", "founderLinkedIn"],
  "local tech": ["localAi", "homelab", "appleSilicon", "archLinux"],
  "local infrastructure": ["localAi", "homelab", "appleSilicon", "archLinux"],
  consulting: ["consulting", "corporate", "enterprise"],
  "management consulting": ["consulting", "corporate", "enterprise"],
  "open source": ["openSource", "localAi"],
  research: ["research", "ai"],
  "academic research": ["research", "ai"],
  linkedin: ["founderLinkedIn", "startup", "corporate"],
  "executive linkedin": ["founderLinkedIn", "startup", "corporate"],
  homelab: ["homelab", "localAi", "openSource"],
  "homelab operations": ["homelab", "localAi", "openSource"],
};

const domainAliases: Record<CategoryId, readonly string[]> = {
  ai: ["ai", "llm", "model", "agent", "agi", "embedding", "inference", "benchmark", "multimodal"],
  corporate: ["corporate", "manager", "stakeholder", "align", "synergy", "circle back", "boil the ocean", "responsibility"],
  startup: ["startup", "yc", "founder", "saas", "venture", "zero-to-one", "pitch", "product-led"],
  enterprise: ["enterprise", "governance", "compliance", "mission critical", "teams", "platform", "production"],
  openSource: ["open source", "oss", "github", "fork", "maintainer", "protocol", "open-weight", "sovereignty"],
  localAi: ["local ai", "local", "ollama", "on-device", "edge", "esp32", "microcontroller", "offline", "sovereign"],
  homelab: ["homelab", "raspberry pi", "old laptop", "nas", "self-host", "bare metal", "proxmox", "lan"],
  consulting: ["consulting", "mckinsey", "deck", "roadmap", "workstream", "operating model", "maturity"],
  founderLinkedIn: ["linkedin", "founder mode", "build in public", "high agency", "lessons learned", "overconfident"],
  research: ["research", "paper", "benchmark", "ablation", "latent", "evaluation", "methodology"],
  web3: ["web3", "crypto", "wallet", "on-chain", "permissionless", "decentralized", "protocol"],
  appleSilicon: ["apple silicon", "mac", "m-series", "neural engine", "metal", "unified memory"],
  archLinux: ["arch", "linux", "btw", "pacman", "aur", "dotfile", "userland"],
  climateTech: ["climate", "carbon", "green", "sustainability", "decarbon", "grid", "energy"],
};

const displaySignals: Array<{ label: string; aliases: readonly string[] }> = [
  { label: "Embedded Systems", aliases: ["esp32", "microcontroller", "arduino", "firmware", "embedded"] },
  { label: "Edge Computing", aliases: ["edge", "on-device", "local", "raspberry pi", "esp32"] },
  { label: "CRUD-as-AGI", aliases: ["crud", "api call", "database", "form", "dashboard"] },
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function hashString(value: string) {
  let hash = 2166136261;

  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function seededOrder(seed: string) {
  return (a: string, b: string) => hashString(`${seed}:${a}`) - hashString(`${seed}:${b}`);
}

export function normaliseStyleChip(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, MAX_STYLE_CHIP_LENGTH);
}

export function addUniqueStyleChip(current: readonly string[], rawValue: string) {
  const chip = normaliseStyleChip(rawValue);

  if (!chip || current.length >= MAX_STYLE_CHIPS) {
    return [...current];
  }

  const exists = current.some((item) => normalize(item) === normalize(chip));

  return exists ? [...current] : [...current, chip];
}

function scoreDomains(input: StyleSelectionInput) {
  const activeInjectors = resolveInjectors(input.presetChips ?? []);
  const suggestedInjectors = suggestInjectors(input.input, input.presetChips ?? [], input.mode === "auto" ? 3 : 1);
  const haystack = [
    input.input,
    input.styleDirection ?? "",
    ...(input.presetChips ?? []),
    ...(input.customStyleChips ?? []),
    ...activeInjectors.flatMap((profile) => [profile.label, ...profile.aliases, ...profile.keywords]),
  ]
    .join(" ")
    .toLowerCase();
  const scores = new Map<CategoryId, number>();

  for (const id of categoryIds) {
    scores.set(id, 0);
  }

  for (const chip of input.presetChips ?? []) {
    for (const id of presetMappings[normalize(chip)] ?? []) {
      scores.set(id, (scores.get(id) ?? 0) + 6);
    }
  }

  for (const profile of [...activeInjectors, ...suggestedInjectors]) {
    for (const id of profile.categoryIds) {
      scores.set(id, (scores.get(id) ?? 0) + (activeInjectors.some((active) => active.id === profile.id) ? 10 : 5));
    }
  }

  for (const id of categoryIds) {
    for (const alias of domainAliases[id]) {
      if (haystack.includes(alias)) {
        scores.set(id, (scores.get(id) ?? 0) + 3);
      }
    }
  }

  if (/\b(esp32|microcontroller|edge|raspberry pi|old laptop|ollama|local)\b/i.test(haystack)) {
    scores.set("localAi", (scores.get("localAi") ?? 0) + 4);
  }

  return [...scores.entries()].sort((a, b) => b[1] - a[1]);
}

function detectDisplaySignals(input: StyleSelectionInput) {
  const haystack = [
    input.input,
    input.styleDirection ?? "",
    ...(input.presetChips ?? []),
    ...(input.customStyleChips ?? []),
  ]
    .join(" ")
    .toLowerCase();

  return displaySignals.filter((signal) => signal.aliases.some((alias) => haystack.includes(alias))).map((signal) => signal.label);
}

export function selectVocabulary(input: StyleSelectionInput): VocabularySelection {
  const activeInjectors = resolveInjectors(input.presetChips ?? []);
  const suggestedInjectors = suggestInjectors(input.input, input.presetChips ?? [], input.mode === "auto" ? 4 : 2);
  const requestedManual = input.manualCategories?.length ? [...input.manualCategories] : [];
  const scored = scoreDomains(input);
  const scoredIds = scored.filter(([, score]) => score > 0).map(([id]) => id);
  const fallbackDomainIds: CategoryId[] = ["corporate", "ai", "startup"];
  const domainIds: CategoryId[] =
    input.mode === "manual"
      ? requestedManual
      : [...new Set<CategoryId>([...scoredIds, "corporate", "ai", "enterprise"])].slice(0, input.mode === "auto" ? 5 : 6);
  const safeDomainIds: CategoryId[] = domainIds.length ? domainIds : fallbackDomainIds;
  const sampleSize = Math.min(10, Math.max(5, Math.ceil(input.intensity / 2) + safeDomainIds.length));
  const seed = [input.input, input.styleDirection, ...(input.presetChips ?? []), ...(input.customStyleChips ?? [])].join("|");
  const intensityProfileLimit = input.intensity >= 8 ? 6 : input.intensity >= 5 ? 4 : 2;
  const promptInjectors = [...activeInjectors, ...suggestedInjectors].slice(0, intensityProfileLimit);
  const terms = [
    ...promptInjectors.flatMap((profile) => profile.vocabulary),
    ...safeDomainIds.flatMap((id) => categories[id].vocabulary),
  ]
    .sort(seededOrder(seed))
    .slice(0, sampleSize);
  const detectedDomains = [
    ...new Set([
      ...promptInjectors.map((profile) => profile.label),
      ...safeDomainIds.map((id) => categories[id].label),
      ...detectDisplaySignals(input),
    ]),
  ];
  const styleSignals = [...new Set([...(input.customStyleChips ?? [])].map(normaliseStyleChip).filter(Boolean))];

  return {
    domainIds: safeDomainIds,
    detectedDomains,
    inspirationTerms: terms,
    styleSignals,
    activeInjectors,
    suggestedInjectors,
    styleInstructions: [...new Set(promptInjectors.flatMap((profile) => profile.styleInstructions))].slice(0, intensityProfileLimit + 2),
    rhetoricalPatterns: [...new Set(promptInjectors.flatMap((profile) => profile.rhetoricalPatterns))].slice(0, input.intensity >= 8 ? 8 : 4),
    humourTags: [...new Set(promptInjectors.flatMap((profile) => profile.humourTags ?? []))].slice(0, 6),
  };
}
