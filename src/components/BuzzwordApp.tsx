"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import {
  Check,
  ChevronDown,
  Clipboard,
  Loader2,
  MoreHorizontal,
  Search,
  X,
} from "lucide-react";
import { categories, categoryIds, defaultCategories, type CategoryId } from "@/lib/categories";
import {
  addRecentInjectorId,
  getPopularInjectors,
  getQuickInjectors,
  groupInjectors,
  injectorRegistry,
  resolveInjectors,
  sanitiseRecentInjectorIds,
  searchInjectors,
  suggestInjectors,
  type InjectorProfile,
} from "@/lib/injectors";
import type { LarpifyResponse } from "@/lib/schema";
import { addUniqueStyleChip, generationModes, type GenerationMode } from "@/lib/style";

type HealthState = {
  status: string;
  model: string;
  explanation: string;
  online: boolean;
  hasModel: boolean;
};

type ApiError = {
  joke: string;
  explanation: string;
};

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const sentencePresets = [
  "I ran a 30M parameter LLM on an ESP32.",
  "My Raspberry Pi turns on my bedroom light.",
  "I made a script that renames files.",
  "We installed Microsoft Teams.",
  "The website uses an OpenAI API call.",
  "I host a dashboard on an old laptop.",
];

const referenceScenarios = [
  { label: "30M parameter LLM on an ESP32", value: sentencePresets[0] },
  { label: "Raspberry Pi bedroom light", value: sentencePresets[1] },
  { label: "File-renaming script", value: sentencePresets[2] },
  { label: "Microsoft Teams installation", value: sentencePresets[3] },
  { label: "OpenAI API wrapper", value: sentencePresets[4] },
  { label: "Dashboard hosted on an old laptop", value: sentencePresets[5] },
];

const loadingMessages = [
  "Analysing source statement...",
  "Identifying transformation domains...",
  "Applying enterprise terminology...",
  "Validating factual constraints...",
  "Preparing strategic output...",
  "Calibrating corporate ambiguity...",
  "Converting facts into strategic optionality...",
];

const intensityLabels = [
  "Light Optimisation",
  "Light Optimisation",
  "Organisational",
  "Organisational",
  "Venture-Backed",
  "Venture-Backed",
  "Enterprise Transformation",
  "Enterprise Transformation",
  "Unrecoverable",
  "Post-Language",
];

const intensityDescriptions = [
  "A light coating of professional language with meaning mostly intact.",
  "A light coating of professional language with meaning mostly intact.",
  "The statement begins participating in the operating model.",
  "The statement begins participating in the operating model.",
  "Sufficient abstraction for a confident seed-stage memo.",
  "Sufficient abstraction for a confident seed-stage memo.",
  "Actionability is subordinated to transformation narrative.",
  "Actionability is subordinated to transformation narrative.",
  "Core meaning may remain available through forensic analysis.",
  "Language continues after information has left the room.",
];

const modeLabels: Record<GenerationMode, string> = {
  auto: "Autonomous",
  guided: "Directed",
  manual: "Governed",
};

const modeDescriptions: Record<GenerationMode, string> = {
  auto: "Relevant jargon domains are inferred automatically.",
  guided: "Provide additional strategic language guidance.",
  manual: "Manually control the transformation framework.",
};

const heroSlogan = {
  label: "Operating principle",
  headline: "There is no limit to the LARP.",
  supporting: "Locally inferred. Globally overclaimed.",
};

// Future candidates: Maximum alignment. Minimum meaning. / No use case. Full alignment. / Technically coherent. Spiritually enterprise. / Built for scale. Designed for confusion. / Open-weight. Closed meaning.

const scoreDescriptions: Record<string, string> = {
  buzzwordDensity: "Share of output occupied by strategically valuable terminology.",
  meaningRetained: "Estimated survival rate of the original proposition.",
  corporateContamination: "Detected exposure to organisational language patterns.",
  larpIntensity: "Degree of professional unreality achieved by the transformation.",
  sentenceRecoverability: "Probability that a normal person can reconstruct the source statement.",
};

function recoverability(scores: LarpifyResponse["scores"]) {
  return Math.max(0, Math.min(100, Math.round(scores.meaningRetained * 0.7 + (100 - scores.buzzwordDensity) * 0.3)));
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={className}>{children}</section>;
}

function Disclosure({
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  title: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-border py-5">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-6 text-left"
        aria-expanded={open}
      >
        <span>
          <span className="block text-[15px] font-semibold text-text-primary">+ {title}</span>
          <span className="mt-1 block text-sm leading-6 text-text-muted">{summary}</span>
        </span>
        <ChevronDown className={classNames("h-4 w-4 shrink-0 text-text-muted transition", open && "rotate-180")} aria-hidden />
      </button>
      <div
        className={classNames(
          "grid transition-[grid-template-rows,opacity] duration-200",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-70",
        )}
      >
        <div className={classNames("overflow-hidden", !open && "invisible pointer-events-none")}>
          <div className="pt-4">{children}</div>
        </div>
      </div>
    </section>
  );
}

function FieldLabel({ title, description, htmlFor }: { title: string; description?: string; htmlFor?: string }) {
  const content = (
    <>
      <span className="block text-sm font-medium text-text-primary">{title}</span>
      {description ? <span className="mt-1 block text-sm leading-5 text-text-muted">{description}</span> : null}
    </>
  );

  return htmlFor ? (
    <label htmlFor={htmlFor} className="block">
      {content}
    </label>
  ) : (
    <div>{content}</div>
  );
}

function Button({
  children,
  variant = "secondary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "border-accent bg-accent text-surface hover:bg-accent-hover hover:border-accent-hover disabled:border-surface-soft disabled:bg-surface-soft disabled:text-text-muted",
    secondary:
      "border-border-strong bg-transparent text-text-primary hover:bg-surface disabled:text-text-muted",
    ghost: "border-transparent bg-transparent text-text-secondary underline-offset-4 hover:text-text-primary hover:underline",
    danger: "border-border-strong bg-transparent text-text-secondary hover:border-error hover:text-error",
  };

  return (
    <button
      {...props}
      className={classNames(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition disabled:cursor-not-allowed",
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

function Badge({
  children,
  tone = "neutral",
  onRemove,
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "warning";
  onRemove?: () => void;
}) {
  const styles = {
    neutral: "text-text-secondary",
    accent: "text-text-primary",
    warning: "text-warning",
  };
  const content = (
    <span className={classNames("inline-flex items-center gap-1.5 text-sm", styles[tone])}>
      {children}
      {onRemove ? <X className="h-3.5 w-3.5" aria-hidden /> : null}
    </span>
  );

  return onRemove ? (
    <button type="button" onClick={onRemove} className="rounded-md focus-visible:outline-focus-ring" aria-label={`Remove ${children}`}>
      {content}
    </button>
  ) : (
    content
  );
}

function ModelStatus({ health }: { health: HealthState }) {
  const statusText =
    health.online && health.hasModel
      ? "Local inference operational"
      : health.status.includes("Checking")
        ? "Evaluating model readiness"
        : "Fallback transformation layer active";

  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-3 text-sm text-text-secondary transition hover:text-text-primary">
        <span
          className={classNames(
            "h-2 w-2 rounded-full",
            health.online && health.hasModel ? "bg-success" : health.status.includes("Checking") ? "bg-warning" : "bg-warning",
          )}
        />
        <span className="hidden sm:inline">{statusText}</span>
        <span className="font-mono text-xs text-text-muted">{health.model}</span>
        <ChevronDown className="h-4 w-4 text-text-muted transition group-open:rotate-180" aria-hidden />
      </summary>
      <div className="absolute right-0 top-8 z-30 w-80 rounded-md border border-border bg-surface p-4 shadow-sm">
        <p className="font-medium text-text-primary">Operational Readiness</p>
        <p className="mt-2 text-sm leading-6 text-text-secondary">{health.explanation}</p>
        <p className="mt-3 font-mono text-xs text-text-muted">Model: {health.model}</p>
      </div>
    </details>
  );
}

function ParodyLogo() {
  return (
    <div className="flex items-start gap-3" aria-label="Buzzwordmaxxing">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-text-primary text-[18px] font-black leading-none tracking-[-0.12em] text-text-primary">
        Bx
      </div>
      <div>
        <p className="text-[20px] font-semibold tracking-tight text-text-primary">
          Buzzwordmaxxing<span className="align-super text-[10px] font-medium tracking-normal text-text-muted">tm</span>
        </p>
        <p className="mt-1 text-sm text-text-muted">Enterprise Linguistic Transformation</p>
      </div>
    </div>
  );
}

function AppHeader({ health }: { health: HealthState }) {
  return (
    <header className="border-b border-border pb-8 pt-6 lg:pb-10">
      <nav className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <ParodyLogo />
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-text-secondary">
          <ModelStatus health={health} />
          <a href="#capability-library" className="hover:text-text-primary">
            Capability Library
          </a>
          <a href="#about" className="hover:text-text-primary">
            About
          </a>
        </div>
      </nav>
      <div className="mt-8 grid gap-10 lg:mt-10 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)] lg:items-center lg:gap-16">
        <div className="min-w-0 max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">Linguistic Transformation System</p>
          <h1 className="mt-3 max-w-full font-display text-[30px] font-semibold leading-[0.95] text-text-primary sm:text-[68px] lg:text-[80px]">
            Buzzwordmaxxing
          </h1>
          <p className="mt-5 max-w-4xl text-[19px] leading-8 text-text-secondary sm:text-[21px]">
            Turn ordinary ideas into unnecessarily venture-backed, enterprise-ready, locally inferred technological
            movements.
          </p>
          <p className="mt-2 max-w-3xl text-base leading-7 text-text-muted">
            A local language system for maximising strategic terminology while reducing actionable meaning.
          </p>
        </div>

        <aside className="min-w-0 border-t border-border pt-7 lg:border-t-0 lg:pt-7">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">{heroSlogan.label}</p>
          <p className="mt-4 max-w-sm text-[28px] font-semibold leading-[1.08] text-text-primary sm:text-[38px] lg:text-[38px] xl:text-[42px]">
            {heroSlogan.headline}
          </p>
          <p className="mt-5 max-w-xs text-base leading-7 text-text-secondary">{heroSlogan.supporting}</p>
        </aside>
      </div>
    </header>
  );
}

function GenerationModeSelector({ mode, setMode }: { mode: GenerationMode; setMode: (mode: GenerationMode) => void }) {
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <FieldLabel title="Transformation mode" />
        <p className="hidden text-right text-sm text-text-muted sm:block">{modeDescriptions[mode]}</p>
      </div>
      <div className="mt-2 flex gap-6 border-b border-border" role="tablist" aria-label="Generation mode">
        {generationModes.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={mode === item}
            onClick={() => setMode(item)}
            title={modeDescriptions[item]}
            className={classNames(
              "-mb-px border-b px-0 pb-2.5 text-sm font-semibold transition",
              mode === item ? "border-accent text-text-primary" : "border-transparent text-text-muted hover:text-text-primary",
            )}
          >
            {modeLabels[item]}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChipInput({
  value,
  setValue,
  onAdd,
  onBackspaceEmpty,
  placeholder,
  label,
  description,
}: {
  value: string;
  setValue: (value: string) => void;
  onAdd: () => void;
  onBackspaceEmpty: () => void;
  placeholder: string;
  label: string;
  description: string;
}) {
  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      onAdd();
    }

    if (event.key === "Backspace" && !value) {
      onBackspaceEmpty();
    }
  }

  return (
    <div>
      <FieldLabel title={label} description={description} htmlFor={label.replace(/\s+/g, "-").toLowerCase()} />
      <input
        id={label.replace(/\s+/g, "-").toLowerCase()}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={onKeyDown}
        maxLength={80}
        className="mt-3 h-12 w-full rounded-md border border-border bg-surface px-4 text-[15px] text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent"
        placeholder={placeholder}
      />
    </div>
  );
}

function IntensityControl({ intensity, setIntensity }: { intensity: number; setIntensity: (value: number) => void }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <FieldLabel title="Abstraction intensity" htmlFor="intensity" />
        <div className="shrink-0 text-right">
          <p className="font-mono text-sm text-text-primary">{intensity} / 10</p>
          <p className="text-xs text-text-muted">{intensityLabels[intensity - 1]}</p>
        </div>
      </div>
      <input
        id="intensity"
        type="range"
        min="1"
        max="10"
        value={intensity}
        onChange={(event) => setIntensity(Number(event.target.value))}
        className="mt-3 w-full accent-accent"
        aria-valuetext={`${intensityLabels[intensity - 1]}. ${intensityDescriptions[intensity - 1]}`}
      />
      <p className="mt-2 text-sm leading-6 text-text-muted">{intensityDescriptions[intensity - 1]}</p>
    </div>
  );
}

function InjectorRow({
  profile,
  active,
  highlighted,
  onSelect,
  id,
}: {
  profile: InjectorProfile;
  active: boolean;
  highlighted: boolean;
  onSelect: (profile: InjectorProfile) => void;
  id?: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="option"
      aria-selected={highlighted}
      onClick={() => onSelect(profile)}
      disabled={active}
      className={classNames(
        "block w-full border-t border-border px-4 py-3 text-left transition first:border-t-0",
        highlighted ? "bg-surface" : "bg-transparent",
        active ? "text-text-muted" : "hover:bg-surface",
      )}
    >
      <span className="flex items-start justify-between gap-4">
        <span>
          <span className="block text-sm font-semibold text-text-primary">{profile.label}</span>
          <span className="mt-1 block text-[13px] leading-5 text-text-muted">{profile.description}</span>
        </span>
        {active ? <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-success">Active</span> : null}
      </span>
    </button>
  );
}

function InjectorCommandMenu({
  open,
  query,
  setQuery,
  input,
  activeChips,
  recentInjectorIds,
  onSelect,
  onClose,
}: {
  open: boolean;
  query: string;
  setQuery: (value: string) => void;
  input: string;
  activeChips: readonly string[];
  recentInjectorIds: readonly string[];
  onSelect: (profile: InjectorProfile) => void;
  onClose: () => void;
}) {
  const activeProfiles = resolveInjectors(activeChips);
  const activeIds = activeProfiles.map((profile) => profile.id);
  const suggested = suggestInjectors(input, activeChips, 8);
  const recent = sanitiseRecentInjectorIds(recentInjectorIds)
    .map((id) => injectorRegistry[id])
    .filter(Boolean);
  const popular = getPopularInjectors(8);
  const searched = searchInjectors(query, activeIds, query.trim() ? 80 : 48);
  const visible = query.trim() ? searched : [...suggested, ...recent, ...popular, ...searched];
  const deduped = visible.filter((profile, index, list) => list.findIndex((item) => item.id === profile.id) === index);
  const grouped = groupInjectors(deduped);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const flatResults = grouped.flatMap((section) => section.profiles);
  const safeHighlightedIndex = Math.min(highlightedIndex, Math.max(0, flatResults.length - 1));

  if (!open) {
    return null;
  }

  function select(profile: InjectorProfile) {
    if (!activeIds.includes(profile.id)) {
      onSelect(profile);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((current) => Math.min(flatResults.length - 1, current + 1));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) => Math.max(0, current - 1));
    }

    if (event.key === "Enter" && flatResults[safeHighlightedIndex]) {
      event.preventDefault();
      select(flatResults[safeHighlightedIndex]);
    }
  }

  return (
    <div className="fixed inset-0 z-40 bg-page/80 p-4 backdrop-blur-sm sm:absolute sm:inset-auto sm:right-0 sm:top-10 sm:w-[min(720px,calc(100vw-4rem))] sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
      <div className="flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-text-primary">Capability Library</p>
            <button type="button" onClick={onClose} className="text-sm text-text-muted hover:text-text-primary">
              Close
            </button>
          </div>
          <div className="mt-3 flex h-11 items-center gap-2 rounded-md border border-border bg-page px-3">
            <Search className="h-4 w-4 text-text-muted" aria-hidden />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onKeyDown}
              className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
              placeholder="Search professional subcultures, technologies and rhetorical failure modes"
              role="combobox"
              aria-expanded
              aria-controls="injector-results"
              aria-activedescendant={flatResults[safeHighlightedIndex] ? `injector-option-${flatResults[safeHighlightedIndex].id}` : undefined}
            />
          </div>
        </div>

        {!query.trim() ? (
          <div className="grid gap-4 border-b border-border p-4 md:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Recommended profiles</p>
              <div className="mt-2 space-y-1">
                {suggested.slice(0, 4).map((profile) => (
                  <button key={profile.id} type="button" onClick={() => select(profile)} className="block text-left text-sm text-text-secondary hover:text-text-primary">
                    {profile.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Recent operating patterns</p>
              <div className="mt-2 space-y-1">
                {recent.length ? (
                  recent.slice(0, 4).map((profile) => (
                    <button key={profile.id} type="button" onClick={() => select(profile)} className="block text-left text-sm text-text-secondary hover:text-text-primary">
                      {profile.label}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-text-muted">No recent profiles yet.</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Frequently operationalised</p>
              <div className="mt-2 space-y-1">
                {popular.slice(0, 4).map((profile) => (
                  <button key={profile.id} type="button" onClick={() => select(profile)} className="block text-left text-sm text-text-secondary hover:text-text-primary">
                    {profile.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div id="injector-results" className="min-h-0 flex-1 overflow-auto" role="listbox" aria-label="Capability library profiles">
          {grouped.length ? (
            grouped.map((section) => (
              <section key={section.group}>
                <p className="sticky top-0 bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                  {query.trim() ? section.group : section.group}
                </p>
                {section.profiles.map((profile) => {
                  const optionIndex = flatResults.findIndex((item) => item.id === profile.id);

                  return (
                    <InjectorRow
                      key={profile.id}
                      id={`injector-option-${profile.id}`}
                      profile={profile}
                      active={activeIds.includes(profile.id)}
                      highlighted={optionIndex === safeHighlightedIndex}
                      onSelect={select}
                    />
                  );
                })}
              </section>
            ))
          ) : (
            <p className="p-6 text-sm text-text-muted">No capability profile matched that search.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SourcePanel({
  input,
  setInput,
  mode,
  setMode,
  styleDirection,
  setStyleDirection,
  presetChips,
  customStyleChips,
  chipInput,
  setChipInput,
  addPresetChip,
  addCustomChip,
  removeChip,
  removeLatestCustomChip,
  selectedCategories,
  toggleCategory,
  showMore,
  setShowMore,
  factualConstraints,
  factInput,
  setFactInput,
  addFact,
  removeFact,
  removeLatestFact,
  intensity,
  setIntensity,
  reset,
  operationalise,
  isLoading,
  loadingMessage,
  directionOpen,
  setDirectionOpen,
  governanceOpen,
  setGovernanceOpen,
  directionInputRef,
  recentInjectorIds,
  setRecentInjectorIds,
}: {
  input: string;
  setInput: (value: string) => void;
  mode: GenerationMode;
  setMode: (mode: GenerationMode) => void;
  styleDirection: string;
  setStyleDirection: (value: string) => void;
  presetChips: string[];
  customStyleChips: string[];
  chipInput: string;
  setChipInput: (value: string) => void;
  addPresetChip: (chip: string) => void;
  addCustomChip: () => void;
  removeChip: (chip: string) => void;
  removeLatestCustomChip: () => void;
  selectedCategories: CategoryId[];
  toggleCategory: (id: CategoryId) => void;
  showMore: boolean;
  setShowMore: (value: boolean | ((value: boolean) => boolean)) => void;
  factualConstraints: string[];
  factInput: string;
  setFactInput: (value: string) => void;
  addFact: () => void;
  removeFact: (fact: string) => void;
  removeLatestFact: () => void;
  intensity: number;
  setIntensity: (value: number) => void;
  reset: () => void;
  operationalise: () => void;
  isLoading: boolean;
  loadingMessage: string;
  directionOpen: boolean;
  setDirectionOpen: (value: boolean | ((value: boolean) => boolean)) => void;
  governanceOpen: boolean;
  setGovernanceOpen: (value: boolean | ((value: boolean) => boolean)) => void;
  directionInputRef: RefObject<HTMLInputElement | null>;
  recentInjectorIds: string[];
  setRecentInjectorIds: (value: string[] | ((value: string[]) => string[])) => void;
}) {
  const activeChips = [...presetChips, ...customStyleChips];
  const activeBuiltIns = resolveInjectors(presetChips);
  const recommendedProfiles = getQuickInjectors(input, recentInjectorIds, activeChips, 8);
  const visibleRecommendedProfiles = recommendedProfiles.slice(0, 3);
  const profileSummary = activeChips.length
    ? `${activeChips.length} transformation ${activeChips.length === 1 ? "profile" : "profiles"} active`
    : "Autonomous profile allocation enabled.";
  const constraintSummary = factualConstraints.length
    ? `${factualConstraints.length} factual ${factualConstraints.length === 1 ? "constraint" : "constraints"} preserved`
    : "No factual constraints declared";
  const [injectorQuery, setInjectorQuery] = useState("");

  function selectInjector(profile: InjectorProfile) {
    addPresetChip(profile.label);
    setRecentInjectorIds((current) => addRecentInjectorId(current, profile.id));
  }

  return (
    <Panel className="flex flex-col py-5 pr-0 lg:min-h-[660px] lg:pr-10 xl:py-7 xl:pr-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-[34px] font-semibold leading-tight tracking-[-0.02em] text-text-primary lg:text-[30px] xl:text-[34px]">
            Source Material
          </h2>
          <p className="mt-2 max-w-md text-[16px] leading-7 text-text-secondary">
            Provide a clear statement before strategic abstraction is applied.
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={reset} className="hidden h-9 self-start px-0 sm:inline-flex">
          Restore Plain English
        </Button>
      </div>

      <div className="mt-6">
        <FieldLabel title="Source statement" htmlFor="source-input" />
        <textarea
          id="source-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          maxLength={500}
          rows={3}
          className="mt-3 h-32 min-h-28 w-full resize-y border-0 border-b border-border bg-transparent px-0 pb-4 pt-1 text-[18px] leading-8 text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent lg:h-24 xl:h-28"
          placeholder="Describe the thing before it becomes a movement."
        />
        <div className="mt-2 flex flex-col gap-1 text-[13px] text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <span className="hidden xl:inline">Plain text stays local; excess significance does not.</span>
          <span className="font-mono">Source material utilisation: {input.length}/500</span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 border-t border-border pt-5 xl:gap-5">
        <GenerationModeSelector mode={mode} setMode={setMode} />
        <div>
          <FieldLabel title="Transformation profile" />
          <p className="mt-2 text-[15px] leading-6 text-text-secondary">
            {activeChips.length ? profileSummary : "Autonomous terminology allocation"}
          </p>
          <p className="mt-1 hidden text-sm leading-6 text-text-muted min-[1320px]:block">
            Recommended:{" "}
            {visibleRecommendedProfiles.map((profile, index) => (
              <span key={profile.id}>
                {index > 0 ? " · " : ""}
                <button
                  type="button"
                  onClick={() => selectInjector(profile)}
                  className="font-medium text-text-secondary underline-offset-4 hover:text-text-primary hover:underline"
                >
                  {profile.label}
                </button>
              </span>
            ))}
          </p>
        </div>
        <IntensityControl intensity={intensity} setIntensity={setIntensity} />
      </div>

      <Button
        type="button"
        variant="primary"
        onClick={operationalise}
        disabled={isLoading || !input.trim()}
        className="mt-5 min-h-12 w-full max-w-[280px] text-base xl:mt-7"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {isLoading ? loadingMessage : "Operationalise"}
      </Button>
      <div className="mt-7 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <label htmlFor="reference-scenario" className="text-sm font-semibold text-text-primary">
          Reference scenario
        </label>
        <select
          id="reference-scenario"
          defaultValue=""
          onChange={(event) => {
            if (event.target.value) {
              setInput(event.target.value);
              event.target.value = "";
            }
          }}
          className="w-full max-w-sm rounded-md border border-border bg-transparent px-3 py-2 text-sm text-text-secondary outline-none transition focus:border-accent sm:text-right"
        >
          <option value="">30M-parameter LLM on an ESP32</option>
          {referenceScenarios.map((scenario) => (
            <option key={scenario.label} value={scenario.value}>
              {scenario.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-5 min-h-0 flex-1 overflow-visible lg:overflow-auto">
        <div>
          <Disclosure
            title="Transformation direction"
            summary={profileSummary}
            open={directionOpen}
            onToggle={() => setDirectionOpen((current) => !current)}
          >
            {mode === "guided" ? (
              <div className="mb-5">
                <FieldLabel
                  title="Strategic direction"
                  description="Describe the desired professional subculture, rhetorical failure mode or technology ideology."
                  htmlFor="style-direction"
                />
                <input
                  ref={directionInputRef}
                  id="style-direction"
                  value={styleDirection}
                  onChange={(event) => setStyleDirection(event.target.value)}
                  maxLength={280}
                  className="mt-3 h-11 w-full rounded-md border border-border bg-surface px-3 text-[15px] text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent"
                  placeholder="e.g. local-AI homelab maximalism combined with management consulting ambiguity"
                />
                <p className="mt-2 text-sm text-text-muted">What kind of nonsense should we inject?</p>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-3">
              <FieldLabel title="Recommended profiles" />
              <div className="relative">
                <Button type="button" variant="ghost" onClick={() => setShowMore((current) => !current)} className="h-8 px-2">
                  <MoreHorizontal className="h-4 w-4" aria-hidden />
                  Browse capability library
                </Button>
                <InjectorCommandMenu
                  open={showMore}
                  query={injectorQuery}
                  setQuery={setInjectorQuery}
                  input={input}
                  activeChips={activeChips}
                  recentInjectorIds={recentInjectorIds}
                  onSelect={(profile) => {
                    selectInjector(profile);
                    setShowMore(false);
                  }}
                  onClose={() => setShowMore(false)}
                />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {recommendedProfiles.slice(0, 6).map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => selectInjector(profile)}
                  className="text-sm font-medium text-text-secondary underline-offset-4 transition hover:text-text-primary hover:underline"
                >
                  {profile.label}
                </button>
              ))}
            </div>
            <div className="mt-5">
              <ChipInput
                value={chipInput}
                setValue={setChipInput}
                onAdd={addCustomChip}
                onBackspaceEmpty={removeLatestCustomChip}
                label="Custom transformation profile"
                description="Use any style phrase. Duplicate profile requests are consolidated."
                placeholder="Defensive enterprise architect"
              />
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-text-primary">Active direction</p>
              <div className="mt-2 flex min-h-9 flex-wrap gap-2">
                {activeChips.length ? (
                  activeChips.map((chip) => (
                    <Badge key={chip} tone="accent" onRemove={() => removeChip(chip)}>
                      {chip}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-text-muted">Autonomous terminology allocation enabled.</span>
                )}
              </div>
              {activeBuiltIns.length ? (
                <p className="mt-2 text-xs leading-5 text-text-muted">
                  Built-in profiles: {activeBuiltIns.map((profile) => profile.group).filter((group, index, list) => list.indexOf(group) === index).join(", ")}
                </p>
              ) : null}
            </div>
          </Disclosure>

          <Disclosure
            title="Factual governance"
            summary={mode === "manual" ? `${constraintSummary}; manual domains available` : constraintSummary}
            open={governanceOpen}
            onToggle={() => setGovernanceOpen((current) => !current)}
          >
            <ChipInput
              value={factInput}
              setValue={setFactInput}
              onAdd={addFact}
              onBackspaceEmpty={removeLatestFact}
              label="Factual constraints"
              description="Statements that must survive the transformation process."
              placeholder="Runs locally"
            />
            <div className="mt-3 flex min-h-9 flex-wrap gap-2">
              {factualConstraints.length ? (
                factualConstraints.map((fact) => (
                  <Badge key={fact} onRemove={() => removeFact(fact)}>
                    {fact}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-text-muted">No factual constraints have been declared.</span>
              )}
            </div>
            {mode === "manual" ? (
              <div className="mt-5 border-t border-border pt-5">
                <FieldLabel
                  title="Manual transformation domains"
                  description="Manually select internal domains for the transformation framework."
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {categoryIds.map((id) => {
                    const active = selectedCategories.includes(id);

                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleCategory(id)}
                        className={classNames(
                          "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition",
                          active
                            ? "border-border-strong bg-surface-soft text-text-primary"
                            : "border-border bg-transparent text-text-muted hover:border-border-strong hover:text-text-primary",
                        )}
                      >
                        <span className={classNames("h-3 w-3 rounded-sm border", active ? "border-accent bg-accent" : "border-border-strong")}>
                          {active ? <Check className="h-3 w-3 text-page" aria-hidden /> : null}
                        </span>
                        {categories[id].label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </Disclosure>
        </div>
      </div>
    </Panel>
  );
}

function ProgressMetric({ label, value, description }: { label: string; value: number; description: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_3rem] items-center gap-5 border-t border-border py-3 first:border-t-0" title={description}>
      <p className="text-[15px] text-text-secondary">{label}</p>
      <span className="text-right font-mono text-sm text-text-primary">{value}</span>
      <div className="col-span-2 h-px bg-surface-soft">
        <div className="h-px bg-accent transition-[width] duration-700" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function LoadingOutputState({ message }: { message: string }) {
  return (
    <div className="mt-16 min-h-[420px] py-6" role="status" aria-live="polite">
      <div className="flex items-center gap-3 border-t border-border pt-8">
        <Loader2 className="h-5 w-5 animate-spin text-accent" aria-hidden />
        <p className="text-lg font-medium text-text-primary">{message}</p>
      </div>
      <p className="mt-6 max-w-xl text-[28px] font-display leading-tight text-text-secondary">
        Converting concrete activity into fundable ambiguity.
      </p>
    </div>
  );
}

function EmptyOutputState({ input }: { input: string }) {
  const preview = input.trim() || "Source material has not been declared.";

  return (
    <div className="mt-16 flex min-h-[460px] flex-col justify-center">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-muted">Strategic Output</p>
      <p className="mt-6 max-w-3xl font-display text-[44px] font-semibold leading-[1.05] tracking-[-0.03em] text-text-primary sm:text-[56px]">
        Plain language remains intact.
      </p>
      <p className="mt-6 max-w-xl text-lg leading-8 text-text-secondary">
        Operationalise the source material to begin enterprise abstraction.
      </p>

      <div className="mt-12 border-t border-border pt-8">
        <div>
          <p className="text-sm font-semibold text-text-muted">Source preview</p>
          <p className="mt-4 max-w-2xl text-[24px] leading-9 text-text-primary">&ldquo;{preview}&rdquo;</p>
        </div>
      </div>

      <p className="mt-8 font-mono text-xs uppercase tracking-[0.16em] text-text-muted">
        {input.trim() ? "Meaning degradation pending." : "Source material pending."}
      </p>
    </div>
  );
}

function ErrorOutputState({ error, retry }: { error: ApiError; retry: () => void }) {
  return (
    <div className="mt-16 border-t border-error/50 pt-8" role="alert">
      <p className="font-display text-[36px] font-semibold leading-tight text-text-primary">
        Local alignment dependency unavailable.
      </p>
      <p className="mt-5 text-lg leading-8 text-text-secondary">{error.joke}</p>
      <p className="mt-3 text-base leading-7 text-text-muted">{error.explanation}</p>
      <div className="mt-8 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={retry}>
          Retry inference
        </Button>
      </div>
    </div>
  );
}

function OutputPanel({
  result,
  error,
  isLoading,
  loadingMessage,
  copied,
  copyResult,
  operationalise,
  mode,
  intensity,
  generatedAt,
  input,
}: {
  result: LarpifyResponse | null;
  error: ApiError | null;
  isLoading: boolean;
  loadingMessage: string;
  copied: boolean;
  copyResult: () => void;
  operationalise: () => void;
  mode: GenerationMode;
  intensity: number;
  generatedAt: string | null;
  input: string;
}) {
  const currentRecoverability = result ? recoverability(result.scores) : 0;
  const domainCaption =
    mode === "auto"
      ? "Automatically selected by the linguistic orchestration layer."
      : mode === "guided"
        ? "Derived from strategic direction."
        : "Selected through transformation governance.";

  return (
    <Panel className="py-10 lg:sticky lg:top-8 lg:min-h-[720px] lg:overflow-auto lg:pl-10 xl:pl-14">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-[34px] font-semibold leading-tight tracking-[-0.02em] text-text-primary">
            Strategic Output
          </h2>
          <p className="mt-3 max-w-xl text-[17px] leading-7 text-text-secondary">
            Enterprise-aligned language generated from the submitted source material.
          </p>
        </div>
        {result ? (
          <Badge tone={result.mode === "fallback" ? "warning" : "neutral"}>
            {result.mode === "fallback" ? "Deterministic continuity layer" : "Local inference"}
          </Badge>
        ) : null}
      </div>

      {isLoading ? <LoadingOutputState message={loadingMessage} /> : null}
      {!isLoading && error ? <ErrorOutputState error={error} retry={operationalise} /> : null}
      {!isLoading && !error && !result ? <EmptyOutputState input={input} /> : null}

      {!isLoading && !error && result ? (
        <div className="mt-14 space-y-12">
          {result.mode === "fallback" ? (
            <div className="border-l-2 border-warning px-5 py-2">
              <p className="font-medium text-text-primary">Deterministic continuity layer</p>
              <p className="mt-1 text-sm leading-6 text-text-muted">
                Local language generation is unavailable. A rule-based transformation has been applied to preserve
                operational availability.
              </p>
            </div>
          ) : null}

          <section>
            <div className="mb-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-[0.14em] text-text-muted">
              <span>{modeLabels[mode]} transformation</span>
              <span>{result.mode === "fallback" ? "Fallback layer" : "Local inference"}</span>
              <span>Intensity {intensity}</span>
              {generatedAt ? <span>{generatedAt}</span> : null}
            </div>
            <p className="max-w-5xl font-display text-[34px] font-semibold leading-[1.12] tracking-[-0.03em] text-text-primary sm:text-[44px]">
              {result.larpified}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button type="button" variant="primary" onClick={copyResult}>
                <Clipboard className="h-4 w-4" aria-hidden />
                {copied ? "Output socialised to clipboard" : "Socialise"}
              </Button>
              <Button type="button" variant="secondary" onClick={operationalise}>
                Reframe Narrative
              </Button>
            </div>
          </section>

          {result.detectedDomains.length ? (
            <section className="border-t border-border pt-8">
              <p className="text-sm font-semibold text-text-primary">Applied transformation domains</p>
              <p className="mt-2 text-sm leading-6 text-text-muted">{domainCaption}</p>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                {result.detectedDomains.map((domain) => (
                  <Badge key={domain}>{domain}</Badge>
                ))}
              </div>
            </section>
          ) : null}

          <details className="border-t border-border pt-8" open>
            <summary className="cursor-pointer text-lg font-semibold text-text-primary">Plain-Language Disclosure</summary>
            <p className="mt-2 text-sm text-text-muted">Material meaning after removal of strategic terminology.</p>
            <p className="mt-5 max-w-3xl text-[22px] leading-9 text-text-secondary">{result.honestTranslation}</p>
          </details>

          <section className="border-t border-border pt-8">
            <h3 className="text-lg font-semibold text-text-primary">Transformation Diagnostics</h3>
            <div className="mt-5">
              <ProgressMetric
                label="Buzzword Density"
                value={result.scores.buzzwordDensity}
                description={scoreDescriptions.buzzwordDensity}
              />
              <ProgressMetric
                label="Meaning Retained"
                value={result.scores.meaningRetained}
                description={scoreDescriptions.meaningRetained}
              />
              <ProgressMetric
                label="Corporate Contamination"
                value={result.scores.corporateContamination}
                description={scoreDescriptions.corporateContamination}
              />
              <ProgressMetric label="LARP Intensity" value={result.scores.larpIntensity} description={scoreDescriptions.larpIntensity} />
              <div className="sm:col-span-2">
                <ProgressMetric
                  label="Sentence Recoverability"
                  value={currentRecoverability}
                  description={scoreDescriptions.sentenceRecoverability}
                />
              </div>
            </div>
          </section>

          <div className="grid gap-10 border-t border-border pt-8 md:grid-cols-[0.8fr_1.2fr]">
            <section>
              <h3 className="text-lg font-semibold text-text-primary">LARP Classification</h3>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 md:grid-cols-1">
                <div>
                  <p className="text-sm text-text-muted">Primary</p>
                  <p className="mt-1 font-medium text-text-primary">{result.classification.primary}</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Secondary</p>
                  <p className="mt-1 font-medium text-text-primary">{result.classification.secondary}</p>
                </div>
              </div>
            </section>
            <section>
              <h3 className="text-lg font-semibold text-text-primary">Analyst Assessment</h3>
              <p className="mt-5 font-display text-[28px] leading-tight text-text-secondary">
                &ldquo;{result.verdict}&rdquo;
              </p>
            </section>
          </div>

          <details className="border-t border-border pt-8">
            <summary className="cursor-pointer text-base font-semibold text-text-primary">
              Terminology Register - <span className="font-mono text-xs text-text-muted">{result.usedBuzzwords.length} phrases</span>
            </summary>
            <div className="mt-5 grid gap-x-8 gap-y-2 sm:grid-cols-2">
              {result.usedBuzzwords.map((word) => (
                <p key={word} className="border-t border-border py-2 text-sm text-text-secondary">
                  {word}
                </p>
              ))}
            </div>
          </details>
        </div>
      ) : null}
    </Panel>
  );
}

export function BuzzwordApp() {
  const [input, setInput] = useState(sentencePresets[0]);
  const [factualConstraints, setFactualConstraints] = useState<string[]>(["ESP32", "30M parameter"]);
  const [factInput, setFactInput] = useState("");
  const [mode, setMode] = useState<GenerationMode>("auto");
  const [styleDirection, setStyleDirection] = useState("");
  const [presetChips, setPresetChips] = useState<string[]>([]);
  const [customStyleChips, setCustomStyleChips] = useState<string[]>([]);
  const [chipInput, setChipInput] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<CategoryId[]>(defaultCategories);
  const [showMore, setShowMore] = useState(false);
  const [recentInjectorIds, setRecentInjectorIds] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const parsed = JSON.parse(window.localStorage.getItem("buzzwordmaxxing:recent-injectors") ?? "[]");
      return sanitiseRecentInjectorIds(Array.isArray(parsed) ? parsed : []);
    } catch {
      return [];
    }
  });
  const [intensity, setIntensity] = useState(7);
  const [result, setResult] = useState<LarpifyResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [directionOpen, setDirectionOpen] = useState(false);
  const [governanceOpen, setGovernanceOpen] = useState(false);
  const directionInputRef = useRef<HTMLInputElement | null>(null);
  const [health, setHealth] = useState<HealthState>({
    status: "Checking Local Alignment...",
    model: "llama3.2:3b",
    explanation: "Checking whether Ollama and the configured model are available.",
    online: false,
    hasModel: false,
  });

  useEffect(() => {
    fetch("/api/health/ollama")
      .then((response) => response.json())
      .then((payload: HealthState) => setHealth(payload))
      .catch(() =>
        setHealth({
          status: "Local Model Unavailable - Fallback LARP Active",
          model: "llama3.2:3b",
          explanation: "Could not reach the health-check endpoint. The app can still use fallback mode.",
          online: false,
          hasModel: false,
        }),
      );
  }, []);

  useEffect(() => {
    window.localStorage.setItem("buzzwordmaxxing:recent-injectors", JSON.stringify(sanitiseRecentInjectorIds(recentInjectorIds)));
  }, [recentInjectorIds]);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const timer = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % loadingMessages.length);
    }, 2200);

    return () => window.clearInterval(timer);
  }, [isLoading]);

  function toggleCategory(id: CategoryId) {
    setSelectedCategories((current) => {
      if (current.includes(id)) {
        return current.length === 1 ? current : current.filter((item) => item !== id);
      }

      return [...current, id];
    });
  }

  function handleModeChange(nextMode: GenerationMode) {
    setMode(nextMode);

    if (nextMode === "guided") {
      setDirectionOpen(true);
      window.setTimeout(() => directionInputRef.current?.focus(), 80);
    }

    if (nextMode === "auto" && !presetChips.length && !customStyleChips.length && !styleDirection) {
      setDirectionOpen(false);
    }
  }

  function addPresetChip(chip: string) {
    setPresetChips((current) => addUniqueStyleChip([...current, ...customStyleChips], chip).filter((item) => !customStyleChips.includes(item)));
  }

  function addCustomChip() {
    setCustomStyleChips((current) => addUniqueStyleChip([...presetChips, ...current], chipInput).filter((chip) => !presetChips.includes(chip)));
    setChipInput("");
  }

  function addFact() {
    setFactualConstraints((current) => addUniqueStyleChip(current, factInput));
    setFactInput("");
  }

  function removeChip(chip: string) {
    setPresetChips((current) => current.filter((item) => item !== chip));
    setCustomStyleChips((current) => current.filter((item) => item !== chip));
  }

  async function operationalise() {
    setIsLoading(true);
    setError(null);
    setCopied(false);

    try {
      const response = await fetch("/api/larpify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          mode,
          styleDirection,
          presetChips,
          customStyleChips,
          categories: selectedCategories,
          intensity,
          lockedFacts: factualConstraints,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload as ApiError);
        return;
      }

      setResult(payload as LarpifyResponse);
      setGeneratedAt(new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date()));

      if ((payload as LarpifyResponse).mode === "fallback") {
        setHealth((current) => ({
          ...current,
          status: "Local Model Unavailable - Fallback LARP Active",
          explanation: "The backend could not use Ollama for this request, so deterministic fallback mode handled it.",
          online: false,
          hasModel: false,
        }));
      }
    } catch {
      setError({
        joke: "The configured inference capability could not be reached.",
        explanation: "Confirm that the Next.js server is running. If Ollama is unavailable, the backend will apply fallback when reached.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function copyResult() {
    if (!result) {
      return;
    }

    await navigator.clipboard.writeText(result.larpified);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function reset() {
    setInput("");
    setFactualConstraints([]);
    setFactInput("");
    setMode("auto");
    setStyleDirection("");
    setPresetChips([]);
    setCustomStyleChips([]);
    setChipInput("");
    setSelectedCategories(defaultCategories);
    setIntensity(5);
    setResult(null);
    setError(null);
    setGeneratedAt(null);
    setDirectionOpen(false);
    setGovernanceOpen(false);
  }

  return (
    <main className="min-h-screen bg-page text-text-primary">
      <div className="relative mx-4 flex max-w-[1580px] flex-col sm:mx-8 xl:mx-12 2xl:mx-auto 2xl:w-[calc(100%-96px)]">
        <AppHeader health={health} />

        <div
          data-testid="workspace-grid"
          className="grid gap-12 border-b border-border lg:min-h-[720px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-0 lg:divide-x lg:divide-border"
        >
          <SourcePanel
            input={input}
            setInput={setInput}
            mode={mode}
            setMode={handleModeChange}
            styleDirection={styleDirection}
            setStyleDirection={setStyleDirection}
            presetChips={presetChips}
            customStyleChips={customStyleChips}
            chipInput={chipInput}
            setChipInput={setChipInput}
            addPresetChip={addPresetChip}
            addCustomChip={addCustomChip}
            removeChip={removeChip}
            removeLatestCustomChip={() => setCustomStyleChips((current) => current.slice(0, -1))}
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            showMore={showMore}
            setShowMore={setShowMore}
            factualConstraints={factualConstraints}
            factInput={factInput}
            setFactInput={setFactInput}
            addFact={addFact}
            removeFact={(fact) => setFactualConstraints((current) => current.filter((item) => item !== fact))}
            removeLatestFact={() => setFactualConstraints((current) => current.slice(0, -1))}
            intensity={intensity}
            setIntensity={setIntensity}
            reset={reset}
            operationalise={operationalise}
            isLoading={isLoading}
            loadingMessage={loadingMessages[messageIndex]}
            directionOpen={directionOpen}
            setDirectionOpen={setDirectionOpen}
            governanceOpen={governanceOpen}
            setGovernanceOpen={setGovernanceOpen}
            directionInputRef={directionInputRef}
            recentInjectorIds={recentInjectorIds}
            setRecentInjectorIds={setRecentInjectorIds}
          />

          <OutputPanel
            result={result}
            error={error}
            isLoading={isLoading}
            loadingMessage={loadingMessages[messageIndex]}
            copied={copied}
            copyResult={copyResult}
            operationalise={operationalise}
            mode={mode}
            intensity={intensity}
            generatedAt={generatedAt}
            input={input}
          />
        </div>

        <footer id="about" className="grid gap-6 py-16 text-sm text-text-muted sm:grid-cols-[1fr_2fr]">
          <div>
            <p className="text-lg font-semibold text-text-primary">Buzzwordmaxxing</p>
            <p className="mt-2">Enterprise-grade linguistic degradation, locally inferred.</p>
          </div>
          <div className="sm:text-right">
            <p>No actionable insights were created during this session.</p>
            <p className="mt-2">Method · Capability Library · Source</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
