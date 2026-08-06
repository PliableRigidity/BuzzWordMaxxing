export const referenceScenarioCategories = [
  "Simple software",
  "Corporate",
  "AI",
  "Startup",
  "Hardware and homelab",
  "Research",
  "Government and policy",
  "Everyday office tasks",
] as const;

export type ReferenceScenarioCategory = (typeof referenceScenarioCategories)[number];

export type ReferenceScenario = {
  id: string;
  label: string;
  source: string;
  category: ReferenceScenarioCategory;
  lockedFacts?: string[];
  suggestedProfiles?: string[];
};

export const referenceScenarios: ReferenceScenario[] = [
  {
    id: "software-file-renamer",
    label: "File-renaming script",
    source: "I made a script that renames files.",
    category: "Simple software",
    suggestedProfiles: ["Rebranding a Script as a Platform"],
  },
  {
    id: "software-form-database",
    label: "Form submission to database",
    source: "The website sends a form submission to a database.",
    category: "Simple software",
    suggestedProfiles: ["CRUD Pretending to Be AGI"],
  },
  {
    id: "software-sales-dashboard",
    label: "Sales dashboard",
    source: "I built a dashboard that displays sales figures.",
    category: "Simple software",
    suggestedProfiles: ["Rebranding a Dashboard as Intelligence", "Single Pane of Glass"],
  },
  {
    id: "software-morning-email",
    label: "Morning email task",
    source: "A scheduled task sends an email every morning.",
    category: "Simple software",
    suggestedProfiles: ["Platform Engineering"],
  },
  {
    id: "corporate-late-report",
    label: "Late report",
    source: "The project is late because nobody finished the report.",
    category: "Corporate",
    suggestedProfiles: ["Responsibility Avoidance", "Meeting Culture"],
  },
  {
    id: "corporate-no-decision-meeting",
    label: "No-decision meeting",
    source: "We are scheduling another meeting because no decision was made.",
    category: "Corporate",
    suggestedProfiles: ["Meeting Culture", "Strategic Ambiguity"],
  },
  {
    id: "corporate-budget-delay",
    label: "Budget reduction",
    source: "The company reduced the budget and delayed the launch.",
    category: "Corporate",
    suggestedProfiles: ["Corporate Strategy", "Responsibility Avoidance"],
  },
  {
    id: "corporate-deadline-moved",
    label: "Deadline moved",
    source: "The team moved the deadline to next month.",
    category: "Corporate",
    suggestedProfiles: ["Middle Management", "Change Management"],
  },
  {
    id: "ai-llm-api-answer",
    label: "LLM answer box",
    source: "The website sends user text to an LLM API and displays the answer.",
    category: "AI",
    lockedFacts: ["LLM API"],
    suggestedProfiles: ["API Call in a Trench Coat", "CRUD Pretending to Be AGI"],
  },
  {
    id: "ai-document-chatbot",
    label: "Document-search chatbot",
    source: "A chatbot searches company documents before replying.",
    category: "AI",
    suggestedProfiles: ["Rebranding a Chatbot as an Agent", "Retrieval-Augmented Generation"],
  },
  {
    id: "ai-prompt-chain-email",
    label: "Prompt chain email",
    source: "Three prompts call one another before sending an email.",
    category: "AI",
    lockedFacts: ["Three prompts"],
    suggestedProfiles: ["Agentic AI", "Prompt Engineering"],
  },
  {
    id: "ai-ticket-classifier",
    label: "Support-ticket classifier",
    source: "A model classifies support tickets into categories.",
    category: "AI",
    suggestedProfiles: ["AI-Native Product", "Platform Engineering"],
  },
  {
    id: "startup-dentist-reminders",
    label: "Dentist appointment reminders",
    source: "I made appointment-reminder software for dentists.",
    category: "Startup",
    suggestedProfiles: ["B2B SaaS", "Founder Mode"],
  },
  {
    id: "startup-four-trials",
    label: "Four trial customers",
    source: "We have four trial customers and no revenue yet.",
    category: "Startup",
    lockedFacts: ["four trial customers", "no revenue"],
    suggestedProfiles: ["Founder Mode", "Go-to-Market"],
  },
  {
    id: "startup-restaurant-menus",
    label: "Restaurant menu updater",
    source: "The product helps restaurants update their menus.",
    category: "Startup",
    suggestedProfiles: ["B2B SaaS", "AI Founder"],
  },
  {
    id: "startup-waitlist-first",
    label: "Waitlist before product",
    source: "We built a waitlist before finishing the product.",
    category: "Startup",
    suggestedProfiles: ["Founder Mode", "Zero-to-One"],
  },
  {
    id: "hardware-pi-bedroom-light",
    label: "Bedroom light automation",
    source: "A Raspberry Pi turns a bedroom light on and off.",
    category: "Hardware and homelab",
    lockedFacts: ["Raspberry Pi", "bedroom light"],
    suggestedProfiles: ["Raspberry Pi", "Overengineered Home Automation"],
  },
  {
    id: "hardware-home-dashboard-server",
    label: "Home dashboard server",
    source: "A small server hosts a dashboard at home.",
    category: "Hardware and homelab",
    suggestedProfiles: ["Homelab", "Self-Hosted"],
  },
  {
    id: "hardware-esp32-temperature",
    label: "ESP32 temperature sensor",
    source: "An ESP32 reads a temperature sensor.",
    category: "Hardware and homelab",
    lockedFacts: ["ESP32", "temperature sensor"],
    suggestedProfiles: ["Embedded Systems", "Microcontroller LARP"],
  },
  {
    id: "hardware-door-check",
    label: "Door status script",
    source: "A home automation script checks whether a door is open.",
    category: "Hardware and homelab",
    suggestedProfiles: ["Overengineered Home Automation", "Homelab"],
  },
  {
    id: "research-two-methods",
    label: "Two-method comparison",
    source: "We tested two methods on ten examples and one performed slightly better.",
    category: "Research",
    lockedFacts: ["two methods", "ten examples"],
    suggestedProfiles: ["Academic Research", "State of the Art"],
  },
  {
    id: "research-seven-of-ten",
    label: "Seven of ten trials",
    source: "The experiment succeeded seven times out of ten.",
    category: "Research",
    lockedFacts: ["seven times out of ten"],
    suggestedProfiles: ["Academic Research", "Invented Benchmark"],
  },
  {
    id: "research-own-benchmark",
    label: "Homegrown benchmark",
    source: "We created a benchmark using our own test cases.",
    category: "Research",
    suggestedProfiles: ["Invented Benchmark", "Benchmark Paper"],
  },
  {
    id: "research-small-dataset",
    label: "Small dataset comparison",
    source: "We compared two algorithms using a small dataset.",
    category: "Research",
    lockedFacts: ["two algorithms", "small dataset"],
    suggestedProfiles: ["Academic Research", "Ablation Study"],
  },
  {
    id: "policy-online-form",
    label: "Paper form to online form",
    source: "The council replaced a paper form with an online form.",
    category: "Government and policy",
    suggestedProfiles: ["Government Digital Transformation", "Civil Service"],
  },
  {
    id: "policy-service-dashboard",
    label: "Service-request dashboard",
    source: "A public office created a dashboard for service requests.",
    category: "Government and policy",
    suggestedProfiles: ["Government Digital Transformation", "Single Pane of Glass"],
  },
  {
    id: "policy-spreadsheet-portal",
    label: "Spreadsheet moved to portal",
    source: "The department moved a spreadsheet into a web portal.",
    category: "Government and policy",
    suggestedProfiles: ["Civil Service", "Government Digital Transformation"],
  },
  {
    id: "policy-pothole-app",
    label: "Pothole reporting app",
    source: "The city launched an app for reporting potholes.",
    category: "Government and policy",
    suggestedProfiles: ["Digital Public Infrastructure", "Public Policy"],
  },
  {
    id: "office-snack-spreadsheet",
    label: "Office snack spreadsheet",
    source: "I made a spreadsheet to track office snacks.",
    category: "Everyday office tasks",
    suggestedProfiles: ["Rebranding a Spreadsheet as a Single Source of Truth"],
  },
  {
    id: "office-printer-toner",
    label: "Printer toner",
    source: "The printer needed a new toner cartridge.",
    category: "Everyday office tasks",
    suggestedProfiles: ["Enterprise IT", "Operational Excellence"],
  },
  {
    id: "office-room-calendar",
    label: "Meeting-room calendar",
    source: "A shared calendar lists meeting-room bookings.",
    category: "Everyday office tasks",
    suggestedProfiles: ["Change Management", "Middle Management"],
  },
  {
    id: "office-project-notes",
    label: "Project notes document",
    source: "The team stores project notes in one document.",
    category: "Everyday office tasks",
    suggestedProfiles: ["Rebranding a Spreadsheet as a Single Source of Truth", "Rebranding a Database as a Knowledge Graph"],
  },
];

export function normaliseScenarioSource(source: string) {
  return source
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function groupReferenceScenarios(scenarios: ReferenceScenario[] = referenceScenarios) {
  return referenceScenarioCategories
    .map((category) => ({
      category,
      scenarios: scenarios.filter((scenario) => scenario.category === category),
    }))
    .filter((group) => group.scenarios.length > 0);
}

export function findReferenceScenario(id: string, scenarios: ReferenceScenario[] = referenceScenarios) {
  return scenarios.find((scenario) => scenario.id === id);
}

export function findReferenceScenarioBySource(source: string, scenarios: ReferenceScenario[] = referenceScenarios) {
  const normalised = normaliseScenarioSource(source);

  return scenarios.find((scenario) => normaliseScenarioSource(scenario.source) === normalised);
}

export function getRandomReferenceScenario(
  currentId?: string,
  scenarios: ReferenceScenario[] = referenceScenarios,
  random: () => number = Math.random,
) {
  if (!scenarios.length) {
    return null;
  }

  const candidates = scenarios.length > 1 ? scenarios.filter((scenario) => scenario.id !== currentId) : scenarios;
  const index = Math.floor(random() * candidates.length);

  return candidates[Math.min(index, candidates.length - 1)];
}

export function validateReferenceScenarios(scenarios: ReferenceScenario[] = referenceScenarios) {
  const errors: string[] = [];
  const ids = new Set<string>();
  const sources = new Set<string>();
  const validCategories = new Set<string>(referenceScenarioCategories);

  for (const scenario of scenarios) {
    if (!scenario.id.trim()) {
      errors.push("Scenario id cannot be empty.");
    }

    if (ids.has(scenario.id)) {
      errors.push(`Duplicate scenario id: ${scenario.id}`);
    }
    ids.add(scenario.id);

    if (!scenario.label.trim()) {
      errors.push(`Scenario ${scenario.id || "(missing id)"} has an empty label.`);
    }

    if (!validCategories.has(scenario.category)) {
      errors.push(`Scenario ${scenario.id} uses invalid category: ${scenario.category}`);
    }

    const normalisedSource = normaliseScenarioSource(scenario.source);
    if (!normalisedSource) {
      errors.push(`Scenario ${scenario.id} has an empty source.`);
    }

    if (sources.has(normalisedSource)) {
      errors.push(`Duplicate scenario source: ${scenario.source}`);
    }
    sources.add(normalisedSource);
  }

  return errors;
}
