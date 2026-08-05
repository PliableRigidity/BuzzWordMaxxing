import type { CategoryId } from "./categories";

export const injectorGroups = [
  "Corporate and Management",
  "Consulting",
  "Startup and Venture Capital",
  "Artificial Intelligence",
  "Local Computing, Homelab and Hardware",
  "Open Source and Developer Culture",
  "Cloud, Enterprise IT and Infrastructure",
  "Academic and Research Language",
  "Product Management and Design",
  "Finance, Economics and Investing",
  "Sales and Marketing",
  "Government, Policy and NGO Language",
  "Climate, ESG and Sustainability",
  "Cybersecurity",
  "Web3 and Emerging Technology",
  "Professional Internet Archetypes",
  "Rhetorical Failure Modes",
] as const;

export type InjectorGroup = (typeof injectorGroups)[number];

export type InjectorProfile = {
  id: string;
  label: string;
  group: InjectorGroup;
  description: string;
  aliases: readonly string[];
  keywords: readonly string[];
  vocabulary: readonly string[];
  styleInstructions: readonly string[];
  rhetoricalPatterns: readonly string[];
  relatedInjectorIds: readonly string[];
  conflictInjectorIds?: readonly string[];
  humourTags?: readonly string[];
  popularity: number;
  featured?: boolean;
  categoryIds: readonly CategoryId[];
};

type InjectorSeed = {
  id?: string;
  label: string;
  description?: string;
  aliases?: readonly string[];
  keywords?: readonly string[];
  vocabulary?: readonly string[];
  styleInstructions?: readonly string[];
  rhetoricalPatterns?: readonly string[];
  relatedInjectorIds?: readonly string[];
  conflictInjectorIds?: readonly string[];
  humourTags?: readonly string[];
  popularity?: number;
  featured?: boolean;
  categoryIds?: readonly CategoryId[];
};

const groupDefaults: Record<
  InjectorGroup,
  {
    categoryIds: readonly CategoryId[];
    vocabulary: readonly string[];
    styleInstructions: readonly string[];
    rhetoricalPatterns: readonly string[];
    humourTags: readonly string[];
  }
> = {
  "Corporate and Management": {
    categoryIds: ["corporate", "enterprise"],
    vocabulary: [
      "circle back",
      "take this offline",
      "double-click",
      "strategic workstream",
      "operating cadence",
      "future-state operating model",
      "organisational readiness",
      "value creation",
    ],
    styleInstructions: ["Replace accountability with alignment, cadence, readiness and carefully managed ambiguity."],
    rhetoricalPatterns: ["Turn actions into workstreams", "Convert decisions into stakeholder alignment rituals"],
    humourTags: ["corporate", "management"],
  },
  Consulting: {
    categoryIds: ["consulting", "corporate", "enterprise"],
    vocabulary: [
      "current-state assessment",
      "target operating model",
      "capability maturity",
      "value lever",
      "implementation roadmap",
      "transformation office",
      "strategic pillar",
      "executive alignment session",
    ],
    styleInstructions: ["Sound like a concise strategy deck that has discovered a two-by-two matrix inside the sentence."],
    rhetoricalPatterns: ["Frame simple work as a phased programme", "Use frameworks, levers and maturity journeys"],
    humourTags: ["consulting", "deckware"],
  },
  "Startup and Venture Capital": {
    categoryIds: ["startup", "founderLinkedIn"],
    vocabulary: [
      "category-defining",
      "venture-scale",
      "product-led",
      "wedge strategy",
      "founder-market fit",
      "network effects",
      "repeatable go-to-market motion",
      "platform opportunity",
    ],
    styleInstructions: ["Make the source sound fundable, inevitable and suspiciously close to a demo day pitch."],
    rhetoricalPatterns: ["Reframe constraints as wedge strategy", "Present obvious behaviour as category creation"],
    humourTags: ["startup", "vc"],
  },
  "Artificial Intelligence": {
    categoryIds: ["ai", "startup"],
    vocabulary: [
      "agentic workflow",
      "semantic fabric",
      "reasoning engine",
      "cognitive architecture",
      "orchestration layer",
      "model-native",
      "inference stack",
      "emergent capability",
    ],
    styleInstructions: ["Frame mundane computation as intelligence, orchestration, reasoning and autonomy without inventing facts."],
    rhetoricalPatterns: ["Rebrand control flow as agency", "Describe data movement as semantic reasoning"],
    humourTags: ["ai", "hype"],
  },
  "Local Computing, Homelab and Hardware": {
    categoryIds: ["localAi", "homelab", "appleSilicon", "archLinux"],
    vocabulary: [
      "locally inferenced",
      "sovereign edge",
      "self-hosted",
      "bare-metal",
      "fanless compute",
      "constrained silicon",
      "privacy-preserving",
      "home-operated infrastructure",
    ],
    styleInstructions: ["Treat small hardware and home infrastructure as sovereign mission-critical compute."],
    rhetoricalPatterns: ["Elevate hobby hardware into infrastructure", "Celebrate impractical constraints as purity"],
    humourTags: ["local", "hardware"],
  },
  "Open Source and Developer Culture": {
    categoryIds: ["openSource", "enterprise"],
    vocabulary: [
      "community-led",
      "composable",
      "vendor-neutral",
      "production-grade",
      "developer-first",
      "observable",
      "fault-tolerant",
      "standards-compliant",
    ],
    styleInstructions: ["Use developer credibility language, protocols, maintainers and architectural seriousness."],
    rhetoricalPatterns: ["Make preferences sound like standards", "Describe tooling as ecosystem strategy"],
    humourTags: ["developer", "oss"],
  },
  "Cloud, Enterprise IT and Infrastructure": {
    categoryIds: ["enterprise", "corporate"],
    vocabulary: [
      "hybrid cloud",
      "mission-critical infrastructure",
      "single pane of glass",
      "control plane",
      "identity fabric",
      "cloud migration",
      "business continuity",
      "vendor consolidation",
    ],
    styleInstructions: ["Overstate operational readiness, resilience, integration and platform governance."],
    rhetoricalPatterns: ["Turn tools into platforms", "Convert maintenance into modernisation"],
    humourTags: ["enterprise-it"],
  },
  "Academic and Research Language": {
    categoryIds: ["research", "ai"],
    vocabulary: [
      "novel framework",
      "empirical evaluation",
      "methodological contribution",
      "benchmark suite",
      "ablation analysis",
      "generalisable findings",
      "future research directions",
      "state-of-the-art performance",
    ],
    styleInstructions: ["Borrow academic caution, contribution language and evaluation phrasing without inventing results."],
    rhetoricalPatterns: ["Make a simple observation into a contribution", "Treat missing evidence as future work"],
    humourTags: ["research"],
  },
  "Product Management and Design": {
    categoryIds: ["corporate", "startup"],
    vocabulary: [
      "user-centred",
      "frictionless",
      "end-to-end journey",
      "customer pain point",
      "validated learning",
      "experience layer",
      "moments that matter",
      "high-impact roadmap",
    ],
    styleInstructions: ["Translate simple features into customer journeys, validated learning and product surface strategy."],
    rhetoricalPatterns: ["Describe obvious UX as discovery", "Recast scope creep as platform strategy"],
    humourTags: ["product", "design"],
  },
  "Finance, Economics and Investing": {
    categoryIds: ["startup", "corporate"],
    vocabulary: [
      "capital efficiency",
      "unit economics",
      "risk-adjusted returns",
      "value creation plan",
      "synergy realisation",
      "strategic alternatives",
      "portfolio optimisation",
      "liquidity event",
    ],
    styleInstructions: ["Make the sentence sound financially optimised and investor-readable."],
    rhetoricalPatterns: ["Reframe cuts as margin expansion", "Convert risk into portfolio language"],
    humourTags: ["finance"],
  },
  "Sales and Marketing": {
    categoryIds: ["startup", "founderLinkedIn", "corporate"],
    vocabulary: [
      "thought leadership",
      "demand generation",
      "account-based motion",
      "customer-led storytelling",
      "conversion optimisation",
      "brand narrative",
      "community flywheel",
      "pipeline acceleration",
    ],
    styleInstructions: ["Turn the source into a market-facing narrative, funnel or personal-brand opportunity."],
    rhetoricalPatterns: ["Make attention sound like strategy", "Convert usage into community momentum"],
    humourTags: ["marketing", "sales"],
  },
  "Government, Policy and NGO Language": {
    categoryIds: ["corporate", "consulting"],
    vocabulary: [
      "whole-of-government approach",
      "stakeholder consultation",
      "capacity building",
      "evidence-based policy",
      "inclusive growth",
      "mission-oriented innovation",
      "public-private partnership",
      "digital public infrastructure",
    ],
    styleInstructions: ["Use policy, procurement, consultation and public-sector transformation language."],
    rhetoricalPatterns: ["Transform small delivery into a roadmap", "Make consensus sound like implementation"],
    humourTags: ["policy"],
  },
  "Climate, ESG and Sustainability": {
    categoryIds: ["climateTech", "corporate"],
    vocabulary: [
      "net zero",
      "carbon accounting",
      "scope 1, 2 and 3",
      "responsible supply chain",
      "climate resilience",
      "nature positive",
      "circular economy",
      "sustainable transformation",
    ],
    styleInstructions: ["Add sustainability reporting language without inventing environmental impact."],
    rhetoricalPatterns: ["Reframe efficiency as climate posture", "Turn compliance into impact narrative"],
    humourTags: ["climate", "esg"],
  },
  Cybersecurity: {
    categoryIds: ["enterprise"],
    vocabulary: [
      "zero trust",
      "threat intelligence",
      "defence in depth",
      "attack surface reduction",
      "secure by design",
      "identity security",
      "cyber resilience",
      "military-grade encryption",
    ],
    styleInstructions: ["Treat ordinary risk as a serious security perimeter, but do not invent incidents or guarantees."],
    rhetoricalPatterns: ["Describe inconvenience as threat reduction", "Recast setup as resilience posture"],
    humourTags: ["security"],
  },
  "Web3 and Emerging Technology": {
    categoryIds: ["web3", "startup"],
    vocabulary: [
      "decentralised",
      "on-chain",
      "tokenised",
      "coordination primitive",
      "digital twin",
      "spatial computing",
      "quantum-ready",
      "edge intelligence",
    ],
    styleInstructions: ["Use emerging technology hype while preserving the source facts and avoiding fake tokens."],
    rhetoricalPatterns: ["Rebrand centralised things as protocols", "Make infrastructure sound inevitable"],
    humourTags: ["web3", "emerging-tech"],
  },
  "Professional Internet Archetypes": {
    categoryIds: ["founderLinkedIn", "startup", "openSource"],
    vocabulary: [
      "high agency",
      "build in public",
      "taste is the moat",
      "sovereign individual",
      "operator mindset",
      "founder mode",
      "personal operating system",
      "earned secret",
    ],
    styleInstructions: ["Imitate professional internet archetypes with deadpan sincerity and controlled self-mythology."],
    rhetoricalPatterns: ["Turn tiny events into lessons", "Make identity the operating model"],
    humourTags: ["internet-archetype"],
  },
  "Rhetorical Failure Modes": {
    categoryIds: ["corporate", "consulting"],
    vocabulary: [
      "strategic optionality",
      "measured urgency",
      "responsibility diffusion",
      "metric theatre",
      "innovation theatre",
      "abstraction overload",
      "actionable ambiguity",
      "pilot learnings",
    ],
    styleInstructions: ["Control how the sentence fails: vagueness, overclaiming, euphemism, theatre or abstraction."],
    rhetoricalPatterns: ["Replace verbs with nouns", "Treat failure as strategy", "Make precision meaningless"],
    humourTags: ["failure-mode"],
  },
};

function slugify(label: string) {
  return label
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const seedGroups: Array<[InjectorGroup, readonly InjectorSeed[]]> = [
  [
    "Corporate and Management",
    [
      { label: "Corporate Strategy", featured: true, popularity: 99, aliases: ["corporate", "strategy"], keywords: ["manager", "meeting"] },
      { label: "Executive Leadership", popularity: 84 },
      { label: "Middle Management", aliases: ["manager"], keywords: ["manager", "deadline", "meeting"], popularity: 86 },
      { label: "Organisational Transformation", popularity: 78 },
      { label: "Change Management", popularity: 76 },
      { label: "Stakeholder Alignment", popularity: 81 },
      { label: "Cross-Functional Collaboration", popularity: 72 },
      { label: "Operational Excellence", popularity: 75 },
      { label: "Human Resources", aliases: ["hr"], popularity: 68 },
      { label: "Talent Strategy", popularity: 66 },
      { label: "People and Culture", aliases: ["culture"], popularity: 65 },
      { label: "Performance Management", keywords: ["manager"], popularity: 71 },
      { label: "Risk Management", popularity: 70 },
      { label: "Corporate Communications", popularity: 69 },
      { label: "Internal Communications", aliases: ["internal comms"], popularity: 64 },
      { label: "Procurement", keywords: ["vendor", "purchase"], popularity: 67 },
      { label: "Compliance", popularity: 73 },
      { label: "Governance", popularity: 77 },
      { label: "Sustainability Reporting", categoryIds: ["climateTech", "corporate"], popularity: 63 },
      { label: "Diversity and Inclusion", aliases: ["dei"], popularity: 62 },
      { label: "Boardroom Language", popularity: 76 },
      { label: "Responsibility Avoidance", aliases: ["avoid blame"], keywords: ["manager", "deadline"], humourTags: ["avoidance"], popularity: 92 },
      { label: "Meeting Culture", keywords: ["meeting"], popularity: 88 },
      { label: "Email Padding", aliases: ["email"], popularity: 83 },
      { label: "Passive-Aggressive Professionalism", aliases: ["passive aggressive"], popularity: 85 },
      { label: "Strategic Ambiguity", aliases: ["vague"], keywords: ["meeting", "deadline"], humourTags: ["ambiguity"], popularity: 91 },
      { label: "Promotion-Seeking Manager", aliases: ["manager"], keywords: ["manager"], popularity: 82 },
      { label: "Reorganisation Language", aliases: ["reorg"], popularity: 74 },
      { label: "Redundancy Euphemisms", aliases: ["layoffs"], keywords: ["headcount"], popularity: 79 },
    ],
  ],
  [
    "Consulting",
    [
      { label: "Management Consulting", featured: true, popularity: 98, aliases: ["consulting", "consultant", "mckinsey"] },
      { label: "Strategy Consulting", popularity: 89 },
      { label: "Big Four Advisory", aliases: ["deloitte", "pwc", "ey", "kpmg"], popularity: 82 },
      { label: "McKinsey-Style", aliases: ["mckinsey"], popularity: 85 },
      { label: "Bain-Style", aliases: ["bain"], popularity: 74 },
      { label: "BCG-Style", aliases: ["bcg"], popularity: 74 },
      { label: "Digital Transformation Consulting", popularity: 88 },
      { label: "Technology Advisory", popularity: 78 },
      { label: "Implementation Consulting", popularity: 75 },
      { label: "Operational Consulting", popularity: 72 },
      { label: "Public-Sector Consulting", keywords: ["government"], popularity: 70 },
      { label: "Consulting Framework Generator", popularity: 86 },
      { label: "Executive Workshop Language", popularity: 79 },
      { label: "Discovery Phase", popularity: 73 },
      { label: "Current-State Assessment", popularity: 76 },
      { label: "Target Operating Model", aliases: ["tom"], popularity: 84 },
      { label: "Three-Horizon Strategy", popularity: 71 },
      { label: "Five-Workstream Programme", popularity: 70 },
      { label: "Two-by-Two Matrix", aliases: ["2x2"], popularity: 77 },
      { label: "Strategic Pillars", popularity: 74 },
      { label: "Value-Lever Analysis", popularity: 73 },
    ],
  ],
  [
    "Startup and Venture Capital",
    [
      { label: "AI Founder", featured: true, popularity: 97, categoryIds: ["ai", "startup", "founderLinkedIn"], aliases: ["founder"] },
      { label: "YC Founder", aliases: ["y combinator"], popularity: 87 },
      { label: "Stealth Startup", popularity: 82 },
      { label: "B2B SaaS", aliases: ["saas"], popularity: 90 },
      { label: "Consumer Startup", popularity: 71 },
      { label: "Product-Led Growth", aliases: ["plg"], popularity: 86 },
      { label: "Growth Hacking", popularity: 80 },
      { label: "Venture Capital", aliases: ["vc"], popularity: 88 },
      { label: "Series A Pitch", popularity: 84 },
      { label: "Seed-Stage Pitch", popularity: 83 },
      { label: "Founder Mode", popularity: 89 },
      { label: "Category Creation", popularity: 86 },
      { label: "Disruption", popularity: 73 },
      { label: "Go-to-Market", aliases: ["gtm"], popularity: 88 },
      { label: "Hypergrowth", popularity: 79 },
      { label: "Community-Led Growth", popularity: 75 },
      { label: "Marketplace Startup", popularity: 72 },
      { label: "Platform Business", popularity: 76 },
      { label: "API Economy", keywords: ["api"], popularity: 81 },
      { label: "Developer-First Startup", categoryIds: ["startup", "openSource"], popularity: 82 },
      { label: "Zero-to-One", popularity: 78 },
      { label: "Blitzscaling", popularity: 72 },
      { label: "Revenue Operations", aliases: ["revops"], popularity: 80 },
      { label: "Startup Twitter", aliases: ["tech twitter"], popularity: 78 },
      { label: "Product Hunt Launch", popularity: 71 },
      { label: "Demo Day Pitch", popularity: 76 },
      { label: "Pre-Revenue Confidence", humourTags: ["absurd"], popularity: 84 },
      { label: "Pivot Announcement", popularity: 75 },
      { label: "Failed Startup Reframing", humourTags: ["failure-reframing"], popularity: 86 },
    ],
  ],
  [
    "Artificial Intelligence",
    [
      { label: "General AI Hype", popularity: 90 },
      { label: "Agentic AI", keywords: ["agent", "workflow"], popularity: 91 },
      { label: "Multi-Agent Systems", aliases: ["multi agent"], popularity: 83 },
      { label: "RAG", aliases: ["retrieval augmented generation"], keywords: ["search"], popularity: 82 },
      { label: "Multimodal AI", popularity: 77 },
      { label: "Foundation Models", popularity: 84 },
      { label: "Open-Weight AI", categoryIds: ["ai", "openSource"], popularity: 80 },
      { label: "Local AI", featured: true, categoryIds: ["localAi", "ai"], keywords: ["esp32", "raspberry pi", "microcontroller"], popularity: 96 },
      { label: "Edge AI", categoryIds: ["localAi", "ai"], keywords: ["esp32", "edge", "microcontroller"], popularity: 86 },
      { label: "AI Copilot", popularity: 84 },
      { label: "AI Employee", popularity: 78 },
      { label: "AI-Native Product", keywords: ["api wrapper"], popularity: 87 },
      { label: "Autonomous Workflow", popularity: 82 },
      { label: "Reasoning Model", popularity: 79 },
      { label: "Cognitive Architecture", popularity: 83 },
      { label: "AI Safety", popularity: 76 },
      { label: "AI Alignment", popularity: 77 },
      { label: "Synthetic Data", popularity: 72 },
      { label: "Model Distillation", popularity: 73 },
      { label: "Fine-Tuning", popularity: 76 },
      { label: "Prompt Engineering", popularity: 88 },
      { label: "AI Research Lab", popularity: 78 },
      { label: "AI Benchmarking", keywords: ["benchmark"], popularity: 79 },
      { label: "AI Infrastructure", keywords: ["api", "database"], popularity: 85 },
      { label: "Inference Optimisation", aliases: ["inference optimization"], popularity: 75 },
      { label: "Embeddings", popularity: 77 },
      { label: "Vector Database", keywords: ["database"], popularity: 80 },
      { label: "Semantic Search", keywords: ["search"], popularity: 76 },
      { label: "Model Context Protocol", aliases: ["mcp"], popularity: 81 },
      { label: "AI Orchestration", popularity: 84 },
      { label: "Sovereign AI", categoryIds: ["ai", "localAi"], popularity: 83 },
      { label: "Responsible AI", popularity: 74 },
      { label: "Explainable AI", popularity: 71 },
      { label: "Human-in-the-Loop", aliases: ["hitl"], popularity: 73 },
      { label: "AI Transformation", categoryIds: ["ai", "consulting"], popularity: 86 },
      { label: "Chatbot Rebranding", aliases: ["chatbot"], popularity: 84 },
      { label: "CRUD Pretending to Be AGI", aliases: ["crud as agi", "crud"], keywords: ["api", "dashboard", "database"], humourTags: ["absurd"], popularity: 93 },
      { label: "API Call in a Trench Coat", aliases: ["ai wrapper", "api wrapper", "api call"], keywords: ["api"], humourTags: ["absurd"], popularity: 95 },
      { label: "Seven Agents for One Function", aliases: ["too many agents"], humourTags: ["absurd"], popularity: 88 },
    ],
  ],
  [
    "Local Computing, Homelab and Hardware",
    [
      { label: "Homelab", featured: true, popularity: 95, keywords: ["raspberry pi", "old laptop"] },
      { label: "Self-Hosted", popularity: 87 },
      { label: "Raspberry Pi", keywords: ["raspberry pi"], popularity: 85 },
      { label: "ESP32", keywords: ["esp32", "microcontroller"], popularity: 88 },
      { label: "Embedded Systems", keywords: ["esp32", "microcontroller", "firmware"], popularity: 87 },
      { label: "Edge Computing", keywords: ["edge", "esp32"], popularity: 86 },
      { label: "Bare Metal", popularity: 75 },
      { label: "Home Server", keywords: ["server", "old laptop"], popularity: 80 },
      { label: "Kubernetes Homelab", popularity: 78 },
      { label: "Docker Everything", popularity: 76 },
      { label: "Proxmox", popularity: 75 },
      { label: "NAS Enthusiast", aliases: ["nas"], popularity: 74 },
      { label: "Networking Enthusiast", popularity: 72 },
      { label: "Privacy Maximalist", popularity: 77 },
      { label: "No-Cloud Purist", aliases: ["no cloud"], popularity: 78 },
      { label: "ARM Compute", aliases: ["arm"], popularity: 73 },
      { label: "Apple Silicon", categoryIds: ["appleSilicon", "localAi"], popularity: 80 },
      { label: "Arch Linux", categoryIds: ["archLinux", "openSource"], popularity: 82 },
      { label: "NixOS", aliases: ["nix"], popularity: 76 },
      { label: "Linux Desktop", popularity: 74 },
      { label: "Mechanical Keyboard", popularity: 70 },
      { label: "Terminal Maximalist", popularity: 76 },
      { label: "FPGA Enthusiast", aliases: ["fpga"], popularity: 69 },
      { label: "Microcontroller LARP", aliases: ["pointless hardware"], keywords: ["esp32", "microcontroller"], humourTags: ["absurd"], popularity: 90 },
      { label: "Running Doom on Everything", aliases: ["pointless hardware"], humourTags: ["absurd"], popularity: 84 },
      { label: "Overengineered Home Automation", aliases: ["pointless hardware"], keywords: ["raspberry pi", "home automation"], humourTags: ["absurd"], popularity: 89 },
      { label: "900 Pound Solution to 12 Pound Problem", aliases: ["£900 solution to £12 problem", "pointless hardware"], humourTags: ["absurd"], popularity: 86 },
      { label: "Honourable Engineering LARP", aliases: ["honourable engineering", "pointless hardware"], keywords: ["esp32", "microcontroller"], humourTags: ["absurd"], popularity: 92 },
      { label: "Sovereign Compute", popularity: 84 },
      { label: "Fanless Compute", popularity: 78 },
      { label: "Low-Power Computing", popularity: 76 },
      { label: "Local-First Software", popularity: 82 },
    ],
  ],
  [
    "Open Source and Developer Culture",
    [
      { label: "Open Source", featured: true, popularity: 94 },
      { label: "Free Software", aliases: ["foss"], popularity: 77 },
      { label: "Open Weight", popularity: 78 },
      { label: "Open Protocol", popularity: 79 },
      { label: "Community Driven", popularity: 82 },
      { label: "Maintainer Culture", popularity: 78 },
      { label: "GitHub README", aliases: ["readme"], popularity: 76 },
      { label: "Hacker News", aliases: ["hn"], popularity: 81 },
      { label: "Indie Hacker", categoryIds: ["startup", "openSource"], popularity: 83 },
      { label: "DevRel", aliases: ["developer relations"], popularity: 78 },
      { label: "Developer Experience", aliases: ["dx"], popularity: 84 },
      { label: "API-First", keywords: ["api"], popularity: 82 },
      { label: "SDK-First", popularity: 75 },
      { label: "CLI-First", popularity: 76 },
      { label: "Infrastructure as Code", aliases: ["iac"], popularity: 80 },
      { label: "DevOps", popularity: 84 },
      { label: "Platform Engineering", keywords: ["api", "dashboard", "database"], popularity: 88 },
      { label: "Site Reliability Engineering", aliases: ["sre"], popularity: 80 },
      { label: "Cloud Native", popularity: 83 },
      { id: "cloud-serverless", label: "Serverless", popularity: 78 },
      { label: "Microservices", popularity: 76 },
      { label: "Monorepo", popularity: 74 },
      { label: "Rust Rewrite", aliases: ["rewrite it in rust"], popularity: 83 },
      { label: "Type Safety", popularity: 80 },
      { label: "Functional Programming", popularity: 72 },
      { label: "Clean Architecture", popularity: 71 },
      { label: "Event-Driven Architecture", popularity: 73 },
      { label: "Distributed Systems", popularity: 78 },
      { label: "Zero Trust", categoryIds: ["enterprise"], popularity: 78 },
      { label: "Observability", keywords: ["dashboard"], popularity: 82 },
      { label: "GitOps", popularity: 76 },
      { label: "Open-Core Business", popularity: 75 },
      { label: "Vendor Neutrality", popularity: 77 },
      { label: "Standards Body Language", popularity: 72 },
      { label: "RFC Language", aliases: ["rfc"], popularity: 73 },
      { label: "Maintainer Burnout Euphemisms", humourTags: ["absurd"], popularity: 78 },
      { label: "Rewrite It in Rust", aliases: ["rust rewrite"], humourTags: ["absurd"], popularity: 84 },
    ],
  ],
  [
    "Cloud, Enterprise IT and Infrastructure",
    [
      { label: "Enterprise IT", featured: true, popularity: 93 },
      { label: "Cloud Transformation", popularity: 86 },
      { label: "Multi-Cloud", popularity: 80 },
      { label: "Hybrid Cloud", popularity: 82 },
      { label: "Cloud Migration", popularity: 84 },
      { label: "Cloudflare Edge", popularity: 76 },
      { label: "AWS Architecture", aliases: ["aws"], popularity: 84 },
      { label: "Azure Enterprise", aliases: ["azure"], popularity: 82 },
      { label: "Google Cloud", aliases: ["gcp"], popularity: 78 },
      { label: "Kubernetes", aliases: ["k8s"], popularity: 86 },
      { label: "Serverless", popularity: 78 },
      { label: "FinOps", popularity: 76 },
      { id: "cloud-cyber-resilience", label: "Cyber Resilience", categoryIds: ["enterprise"], popularity: 82 },
      { label: "Disaster Recovery", popularity: 78 },
      { label: "Business Continuity", popularity: 77 },
      { label: "Identity and Access Management", aliases: ["iam"], popularity: 80 },
      { id: "cloud-zero-trust", label: "Zero Trust", categoryIds: ["enterprise"], popularity: 81 },
      { label: "Data Platform", keywords: ["database"], popularity: 84 },
      { label: "Data Lakehouse", keywords: ["database"], popularity: 76 },
      { label: "Data Mesh", keywords: ["database"], popularity: 75 },
      { label: "API Management", keywords: ["api"], popularity: 82 },
      { label: "Service Mesh", popularity: 76 },
      { label: "Enterprise Architecture", popularity: 85 },
      { label: "Digital Workplace", popularity: 76 },
      { label: "Microsoft 365 Transformation", aliases: ["teams", "microsoft teams"], popularity: 78 },
      { label: "ERP Modernisation", aliases: ["erp modernization"], popularity: 74 },
      { label: "CRM Transformation", popularity: 73 },
      { label: "Legacy Modernisation", aliases: ["legacy modernization"], popularity: 80 },
      { label: "Mainframe Transformation", popularity: 72 },
      { label: "Single Pane of Glass", keywords: ["dashboard"], popularity: 88 },
      { label: "Mission-Critical Infrastructure", popularity: 84 },
      { label: "Observability Platform", keywords: ["dashboard"], popularity: 82 },
      { label: "Vendor Consolidation", popularity: 76 },
      { label: "Technical Debt Transformation", popularity: 82 },
    ],
  ],
  [
    "Academic and Research Language",
    [
      { label: "Academic Research", featured: true, popularity: 92, aliases: ["research"] },
      { label: "Computer Science Paper", keywords: ["paper"], popularity: 82 },
      { label: "Machine Learning Paper", keywords: ["paper", "benchmark"], popularity: 84 },
      { label: "Robotics Research", popularity: 76 },
      { label: "Systems Paper", keywords: ["paper"], popularity: 78 },
      { label: "Human-Computer Interaction", aliases: ["hci"], popularity: 75 },
      { label: "Social Science Paper", popularity: 71 },
      { label: "Economics Paper", popularity: 70 },
      { label: "Philosophy Paper", popularity: 68 },
      { label: "Literature Review", popularity: 72 },
      { label: "Research Proposal", popularity: 74 },
      { label: "Grant Application", popularity: 75 },
      { label: "PhD Abstract", aliases: ["phd"], popularity: 76 },
      { label: "Peer Review", popularity: 73 },
      { label: "Benchmark Paper", keywords: ["benchmark"], popularity: 82 },
      { label: "Ablation Study", popularity: 77 },
      { label: "Novel Framework", popularity: 80 },
      { label: "State of the Art", aliases: ["sota"], keywords: ["benchmark"], popularity: 82 },
      { label: "Methodological Contribution", popularity: 75 },
      { label: "Interdisciplinary Research", popularity: 70 },
      { label: "Reproducibility", popularity: 74 },
      { label: "Responsible Innovation", popularity: 72 },
      { label: "Ethics Review", popularity: 70 },
      { label: "Pilot Study", popularity: 74 },
      { label: "Exploratory Study", popularity: 73 },
      { label: "Longitudinal Study", popularity: 70 },
      { label: "Mixed Methods", popularity: 70 },
      { label: "Research LARP", humourTags: ["absurd"], keywords: ["paper", "benchmark"], popularity: 86 },
      { label: "Invented Benchmark", keywords: ["benchmark", "experiment"], humourTags: ["absurd"], popularity: 88 },
      { label: "Statistically Significant Vibes", aliases: ["significant vibes"], keywords: ["benchmark", "experiment"], humourTags: ["absurd"], popularity: 87 },
    ],
  ],
  [
    "Product Management and Design",
    [
      { label: "Product Management", popularity: 87 },
      { label: "Product Strategy", popularity: 84 },
      { label: "Product Discovery", popularity: 82 },
      { label: "User Research", popularity: 78 },
      { label: "Design Thinking", popularity: 80 },
      { label: "Human-Centred Design", aliases: ["human-centered design"], popularity: 77 },
      { label: "UX Research", popularity: 77 },
      { label: "Service Design", popularity: 76 },
      { label: "Design Systems", popularity: 82 },
      { label: "Jobs to Be Done", aliases: ["jtbd"], popularity: 78 },
      { label: "Customer Obsession", popularity: 82 },
      { label: "Roadmap Planning", popularity: 80 },
      { label: "North-Star Metrics", aliases: ["north star"], popularity: 79 },
      { label: "Product-Market Fit", popularity: 85 },
      { label: "Feature Prioritisation", aliases: ["feature prioritization"], popularity: 78 },
      { label: "Agile Product", popularity: 76 },
      { label: "Scrum", popularity: 73 },
      { label: "Design Sprint", popularity: 74 },
      { label: "User Journey", popularity: 79 },
      { label: "Persona Creation", popularity: 71 },
      { label: "Accessibility", popularity: 74 },
      { label: "Frictionless Experience", popularity: 80 },
      { label: "Delight", popularity: 70 },
      { label: "Seamless Experience", popularity: 78 },
      { label: "Intuitive Workflow", popularity: 78 },
      { label: "Customer-Centricity", popularity: 79 },
      { label: "MVP Rebranding", humourTags: ["absurd"], popularity: 83 },
      { label: "Feature Creep as Platform Strategy", humourTags: ["absurd"], popularity: 85 },
    ],
  ],
  [
    "Finance, Economics and Investing",
    [
      { label: "Investment Banking", popularity: 78 },
      { label: "Private Equity", aliases: ["pe"], popularity: 80 },
      { id: "finance-venture-capital", label: "Venture Capital", aliases: ["vc"], popularity: 84 },
      { label: "Hedge Fund", popularity: 72 },
      { label: "Asset Management", popularity: 70 },
      { label: "Fintech", popularity: 82 },
      { label: "Quantitative Finance", aliases: ["quant"], popularity: 72 },
      { label: "Crypto Finance", categoryIds: ["web3", "startup"], popularity: 76 },
      { label: "Macroeconomics", popularity: 70 },
      { label: "Market Commentary", popularity: 73 },
      { label: "Earnings Call", popularity: 78 },
      { label: "Shareholder Letter", popularity: 77 },
      { label: "Financial Transformation", popularity: 78 },
      { label: "Cost Optimisation", aliases: ["cost optimization"], popularity: 80 },
      { label: "Capital Efficiency", popularity: 82 },
      { label: "Unit Economics", popularity: 80 },
      { label: "EBITDA Language", aliases: ["ebitda"], popularity: 78 },
      { label: "Synergy Realisation", aliases: ["synergy realization"], popularity: 76 },
      { label: "Value Creation Plan", popularity: 78 },
      { label: "Portfolio Optimisation", aliases: ["portfolio optimization"], popularity: 74 },
      { label: "Risk-Adjusted Returns", popularity: 75 },
      { label: "Alpha Generation", popularity: 76 },
      { label: "Liquidity Event", popularity: 73 },
      { label: "Strategic Alternatives", popularity: 74 },
      { label: "Headcount Reduction as Margin Expansion", aliases: ["layoffs"], humourTags: ["absurd"], popularity: 86 },
    ],
  ],
  [
    "Sales and Marketing",
    [
      { label: "Enterprise Sales", popularity: 82 },
      { label: "SaaS Sales", popularity: 80 },
      { label: "Sales Enablement", popularity: 76 },
      { id: "sales-revenue-operations", label: "Revenue Operations", aliases: ["revops"], popularity: 81 },
      { label: "Growth Marketing", popularity: 80 },
      { label: "Brand Strategy", popularity: 78 },
      { label: "Performance Marketing", popularity: 76 },
      { label: "Content Marketing", popularity: 75 },
      { id: "sales-thought-leadership", label: "Thought Leadership", popularity: 84 },
      { label: "Account-Based Marketing", aliases: ["abm"], popularity: 76 },
      { label: "Demand Generation", popularity: 78 },
      { label: "Lead Generation", popularity: 75 },
      { label: "Customer Success", popularity: 80 },
      { label: "Customer Experience", aliases: ["cx"], popularity: 79 },
      { label: "Marketing Funnel", popularity: 77 },
      { label: "Conversion Optimisation", aliases: ["conversion optimization"], popularity: 76 },
      { label: "Community Building", popularity: 76 },
      { label: "Creator Economy", popularity: 78 },
      { label: "Influencer Marketing", popularity: 74 },
      { label: "Personal Brand", popularity: 82 },
      { id: "sales-newsletter-operator", label: "Newsletter Operator", categoryIds: ["founderLinkedIn", "startup"], popularity: 78 },
      { label: "LinkedIn Thought Leader", aliases: ["linkedin"], popularity: 85 },
      { label: "Executive LinkedIn", featured: true, aliases: ["linkedin"], popularity: 92 },
      { label: "Viral Thread", popularity: 78 },
      { label: "Webinar Language", popularity: 74 },
      { label: "Case Study Language", popularity: 73 },
      { label: "Customer-Led Storytelling", popularity: 76 },
    ],
  ],
  [
    "Government, Policy and NGO Language",
    [
      { label: "Public Policy", aliases: ["government"], popularity: 78 },
      { label: "Government Digital Transformation", keywords: ["government"], popularity: 82 },
      { label: "Civil Service", aliases: ["government"], popularity: 77 },
      { label: "Public-Sector Procurement", aliases: ["government procurement"], popularity: 76 },
      { label: "Regulatory Affairs", popularity: 74 },
      { label: "International Development", popularity: 70 },
      { label: "NGO Language", aliases: ["ngo"], popularity: 70 },
      { label: "Climate Policy", categoryIds: ["climateTech", "corporate"], popularity: 74 },
      { label: "Smart City", popularity: 76 },
      { label: "Digital Public Infrastructure", popularity: 78 },
      { label: "Public-Private Partnership", aliases: ["ppp"], popularity: 76 },
      { label: "Stakeholder Consultation", popularity: 78 },
      { label: "Community Engagement", popularity: 75 },
      { label: "Capacity Building", popularity: 76 },
      { label: "Evidence-Based Policy", popularity: 77 },
      { label: "Inclusive Growth", popularity: 73 },
      { label: "Resilience Strategy", popularity: 75 },
      { label: "Strategic Autonomy", popularity: 74 },
      { label: "National Innovation Strategy", popularity: 76 },
      { label: "Policy Roadmap", popularity: 75 },
      { label: "Whole-of-Government Approach", aliases: ["whole of government"], keywords: ["government"], popularity: 81 },
      { label: "Mission-Oriented Innovation", popularity: 76 },
    ],
  ],
  [
    "Climate, ESG and Sustainability",
    [
      { label: "Climate Tech", popularity: 84 },
      { label: "ESG", popularity: 82 },
      { label: "Net Zero", popularity: 82 },
      { label: "Carbon Accounting", popularity: 78 },
      { label: "Green Finance", popularity: 76 },
      { label: "Circular Economy", popularity: 76 },
      { label: "Energy Transition", popularity: 80 },
      { label: "Sustainable Innovation", popularity: 76 },
      { label: "Climate Resilience", popularity: 77 },
      { label: "Nature Positive", popularity: 73 },
      { label: "Regenerative Business", popularity: 72 },
      { label: "Impact Investing", popularity: 76 },
      { label: "Scope 1, 2 and 3", aliases: ["scope 1", "scope 2", "scope 3"], popularity: 77 },
      { label: "Responsible Supply Chain", popularity: 74 },
      { label: "Sustainable Transformation", popularity: 78 },
      { label: "Greenwashing", humourTags: ["absurd"], popularity: 80 },
      { label: "Carbon-Negative SaaS", humourTags: ["absurd"], popularity: 76 },
      { label: "AI for Sustainability", categoryIds: ["ai", "climateTech"], popularity: 78 },
      { label: "Climate-Positive Blockchain", categoryIds: ["web3", "climateTech"], humourTags: ["absurd"], popularity: 74 },
      { label: "Solar-Powered Synergy", humourTags: ["absurd"], popularity: 72 },
    ],
  ],
  [
    "Cybersecurity",
    [
      { label: "Cybersecurity", popularity: 86 },
      { id: "cyber-zero-trust", label: "Zero Trust", popularity: 84 },
      { label: "Threat Intelligence", popularity: 78 },
      { label: "Security Operations", aliases: ["secops"], popularity: 78 },
      { label: "SOC", aliases: ["security operations center"], popularity: 76 },
      { label: "Red Team", popularity: 76 },
      { label: "Blue Team", popularity: 74 },
      { label: "DevSecOps", popularity: 78 },
      { label: "Privacy Engineering", popularity: 76 },
      { label: "Data Sovereignty", popularity: 77 },
      { label: "Identity Security", popularity: 78 },
      { label: "Cloud Security", popularity: 78 },
      { label: "Endpoint Security", popularity: 74 },
      { label: "Secure by Design", popularity: 78 },
      { label: "Defence in Depth", aliases: ["defense in depth"], popularity: 77 },
      { label: "Attack Surface Reduction", popularity: 76 },
      { id: "cyber-cyber-resilience", label: "Cyber Resilience", popularity: 80 },
      { label: "Post-Quantum Security", aliases: ["post quantum"], popularity: 74 },
      { label: "AI Security", categoryIds: ["ai", "enterprise"], popularity: 78 },
      { id: "cyber-security-theatre", label: "Security Theatre", aliases: ["security theater"], humourTags: ["absurd"], popularity: 82 },
      { label: "Military-Grade Encryption", humourTags: ["absurd"], popularity: 78 },
      { label: "Blockchain for Security", categoryIds: ["web3", "enterprise"], humourTags: ["absurd"], popularity: 74 },
    ],
  ],
  [
    "Web3 and Emerging Technology",
    [
      { label: "Web3", popularity: 84 },
      { label: "Blockchain", popularity: 80 },
      { label: "Crypto", popularity: 82 },
      { label: "Decentralisation", aliases: ["decentralization"], popularity: 78 },
      { label: "DAO", popularity: 74 },
      { label: "NFT", popularity: 72 },
      { label: "Tokenisation", aliases: ["tokenization"], popularity: 76 },
      { label: "Metaverse", popularity: 74 },
      { label: "Spatial Computing", popularity: 76 },
      { label: "Digital Twin", popularity: 76 },
      { label: "Quantum Computing", popularity: 78 },
      { label: "Neuromorphic Computing", popularity: 70 },
      { label: "Biohacking", popularity: 70 },
      { label: "Longevity", popularity: 72 },
      { label: "Brain-Computer Interface", aliases: ["bci"], popularity: 72 },
      { label: "Robotics", popularity: 78 },
      { label: "Autonomous Systems", popularity: 77 },
      { label: "Drone Economy", popularity: 70 },
      { label: "Smart Cities", popularity: 76 },
      { label: "Industry 4.0", popularity: 76 },
      { label: "Internet of Things", aliases: ["iot"], popularity: 76 },
      { label: "5G", popularity: 72 },
      { label: "6G", popularity: 70 },
      { label: "Edge Intelligence", categoryIds: ["ai", "localAi"], popularity: 80 },
      { label: "Decentralised AI", aliases: ["decentralized ai"], categoryIds: ["ai", "web3"], popularity: 78 },
      { label: "On-Chain AI", categoryIds: ["ai", "web3"], popularity: 76 },
      { label: "Tokenised Compute", aliases: ["tokenized compute"], popularity: 74 },
      { label: "Metaverse Rebrand", humourTags: ["absurd"], popularity: 74 },
      { label: "Quantum-Ready CRUD", keywords: ["crud"], humourTags: ["absurd"], popularity: 78 },
    ],
  ],
  [
    "Professional Internet Archetypes",
    [
      { label: "LinkedIn Visionary", aliases: ["linkedin"], popularity: 86 },
      { label: "Ex-FAANG Thought Leader", aliases: ["faang"], popularity: 80 },
      { label: "Teenage Founder", popularity: 76 },
      { id: "archetype-indie-hacker", label: "Indie Hacker", popularity: 82 },
      { label: "Productivity Guru", popularity: 78 },
      { label: "Notion Consultant", aliases: ["notion"], popularity: 76 },
      { id: "archetype-newsletter-operator", label: "Newsletter Operator", popularity: 78 },
      { label: "Crypto Bro", categoryIds: ["web3", "founderLinkedIn"], popularity: 80 },
      { label: "AI Reply Guy", categoryIds: ["ai", "founderLinkedIn"], popularity: 82 },
      { label: "Hacker News Purist", aliases: ["hacker news"], popularity: 80 },
      { label: "Reddit Homelab Expert", categoryIds: ["homelab", "openSource"], popularity: 78 },
      { label: "Arch Linux Elitist", categoryIds: ["archLinux", "openSource"], popularity: 82 },
      { label: "Apple Silicon Evangelist", categoryIds: ["appleSilicon", "localAi"], popularity: 78 },
      { label: "Rust Evangelist", categoryIds: ["openSource"], popularity: 80 },
      { label: "Kubernetes Maximalist", categoryIds: ["enterprise", "openSource"], popularity: 80 },
      { label: "No-Code Founder", popularity: 76 },
      { label: "Prompt Engineer", categoryIds: ["ai", "startup"], popularity: 82 },
      { label: "Fractional Executive", popularity: 76 },
      { label: "Personal Brand Strategist", popularity: 78 },
      { label: "Digital Nomad Founder", popularity: 72 },
      { label: "Solopreneur", popularity: 74 },
      { label: "Build-in-Public Founder", popularity: 80 },
      { label: "Stealth Mode Founder", popularity: 76 },
      { label: "Chief Vibes Officer", humourTags: ["absurd"], popularity: 76 },
      { label: "Chief AI Officer", categoryIds: ["ai", "corporate"], humourTags: ["absurd"], popularity: 84 },
      { label: "Chief Transformation Officer", humourTags: ["absurd"], popularity: 78 },
      { label: "Chief Synergy Officer", humourTags: ["absurd"], popularity: 78 },
    ],
  ],
  [
    "Rhetorical Failure Modes",
    [
      { label: "Maximum Ambiguity", popularity: 88 },
      { id: "failure-responsibility-avoidance", label: "Responsibility Avoidance", keywords: ["manager"], popularity: 92 },
      { label: "Passive Voice", popularity: 80 },
      { label: "Executive Vagueness", aliases: ["vague"], keywords: ["manager"], popularity: 88 },
      { label: "Excessive Confidence", popularity: 84 },
      { label: "Meaningless Precision", popularity: 82 },
      { label: "Fake Urgency", popularity: 80 },
      { label: "Artificial Scarcity", popularity: 76 },
      { label: "Overclaiming", popularity: 84 },
      { label: "Euphemism", popularity: 80 },
      { label: "Abstraction Overload", popularity: 86 },
      { label: "Nominalisation", aliases: ["nominalization"], popularity: 76 },
      { label: "Acronym Saturation", popularity: 78 },
      { label: "Framework Addiction", popularity: 84 },
      { label: "Metric Theatre", aliases: ["metric theater"], popularity: 86 },
      { label: "Benchmark Theatre", aliases: ["benchmark theater"], keywords: ["benchmark"], popularity: 86 },
      { label: "Innovation Theatre", aliases: ["innovation theater"], popularity: 84 },
      { id: "failure-security-theatre", label: "Security Theatre", aliases: ["security theater"], popularity: 82 },
      { label: "Productivity Theatre", aliases: ["productivity theater"], popularity: 78 },
      { label: "Transformation Theatre", aliases: ["transformation theater"], popularity: 84 },
      { id: "failure-thought-leadership", label: "Thought Leadership", popularity: 84 },
      { label: "LinkedIn Spiritual Awakening", aliases: ["linkedin"], humourTags: ["absurd"], popularity: 88 },
      { label: "Pretending Failure Was a Pilot", popularity: 86 },
      { label: "Pretending Delay Was Strategy", keywords: ["deadline"], popularity: 86 },
      { label: "Rebranding Cost Cutting", keywords: ["headcount"], popularity: 82 },
      { label: "Rebranding a Script as a Platform", keywords: ["script"], popularity: 88 },
      { label: "Rebranding a Chatbot as an Agent", aliases: ["chatbot"], popularity: 88 },
      { label: "Rebranding an API Call as Infrastructure", aliases: ["api wrapper"], keywords: ["api"], popularity: 90 },
      { label: "Rebranding a Dashboard as Intelligence", keywords: ["dashboard"], popularity: 90 },
      { label: "Rebranding a Cron Job as Autonomy", aliases: ["cron"], popularity: 86 },
      { label: "Rebranding a Database as a Knowledge Graph", keywords: ["database"], popularity: 88 },
      { label: "Rebranding a Spreadsheet as a Single Source of Truth", aliases: ["spreadsheet"], popularity: 86 },
      { label: "Rebranding a Meeting as a Workshop", keywords: ["meeting"], popularity: 86 },
      { label: "Rebranding Confusion as Optionality", popularity: 88 },
    ],
  ],
];

const explicitRelated: Record<string, readonly string[]> = {
  "management-consulting": ["corporate-strategy", "target-operating-model", "strategic-ambiguity"],
  "local-ai": ["edge-ai", "embedded-systems", "homelab", "sovereign-compute"],
  "academic-research": ["benchmark-paper", "novel-framework", "state-of-the-art"],
  "api-call-in-a-trench-coat": ["crud-pretending-to-be-agi", "rebranding-an-api-call-as-infrastructure", "ai-native-product"],
  "microcontroller-larp": ["esp32", "embedded-systems", "honourable-engineering-larp"],
  "rebranding-a-dashboard-as-intelligence": ["single-pane-of-glass", "observability-platform", "crud-pretending-to-be-agi"],
};

function createInjector(group: InjectorGroup, seed: InjectorSeed): InjectorProfile {
  const defaults = groupDefaults[group];
  const id = seed.id ?? slugify(seed.label);
  const labelWords = seed.label.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

  return {
    id,
    label: seed.label,
    group,
    description:
      seed.description ??
      `Applies ${seed.label} language to the source while preserving the original facts and visible absurdity.`,
    aliases: [...new Set([...(seed.aliases ?? []), seed.label.toLowerCase()])],
    keywords: [...new Set([...(seed.keywords ?? []), ...labelWords])],
    vocabulary: [...new Set([...(seed.vocabulary ?? []), ...defaults.vocabulary])],
    styleInstructions: [...new Set([...(seed.styleInstructions ?? []), ...defaults.styleInstructions])],
    rhetoricalPatterns: [...new Set([...(seed.rhetoricalPatterns ?? []), ...defaults.rhetoricalPatterns])],
    relatedInjectorIds: seed.relatedInjectorIds ?? explicitRelated[id] ?? [],
    conflictInjectorIds: seed.conflictInjectorIds,
    humourTags: [...new Set([...(seed.humourTags ?? []), ...defaults.humourTags])],
    popularity: seed.popularity ?? 50,
    featured: seed.featured,
    categoryIds: seed.categoryIds ?? defaults.categoryIds,
  };
}

export const injectorProfiles = seedGroups.flatMap(([group, seeds]) => seeds.map((seed) => createInjector(group, seed)));
export const injectorIds = injectorProfiles.map((profile) => profile.id);
export const injectorRegistry: Record<string, InjectorProfile> = Object.fromEntries(
  injectorProfiles.map((profile) => [profile.id, profile]),
);
export const featuredInjectors = injectorProfiles.filter((profile) => profile.featured);
export const allInjectorVocabulary = [...new Set(injectorProfiles.flatMap((profile) => profile.vocabulary))];

function normaliseSearch(value: string) {
  return value
    .toLowerCase()
    .replace(/[£$]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function searchableText(profile: InjectorProfile) {
  return normaliseSearch(
    [
      profile.label,
      profile.description,
      profile.group,
      ...profile.aliases,
      ...profile.keywords,
      ...profile.vocabulary,
      ...profile.humourTags ?? [],
    ].join(" "),
  );
}

const searchIndex = injectorProfiles.map((profile) => ({
  profile,
  text: searchableText(profile),
  label: normaliseSearch(profile.label),
}));

export function resolveInjector(value: string) {
  const key = normaliseSearch(value);

  return (
    injectorRegistry[value] ??
    searchIndex.find((entry) => entry.profile.id === value || entry.label === key || entry.profile.aliases.some((alias) => normaliseSearch(alias) === key))
      ?.profile ??
    null
  );
}

export function resolveInjectors(values: readonly string[]) {
  const seen = new Set<string>();
  const resolved: InjectorProfile[] = [];

  for (const value of values) {
    const profile = resolveInjector(value);

    if (profile && !seen.has(profile.id)) {
      seen.add(profile.id);
      resolved.push(profile);
    }
  }

  return resolved;
}

export function searchInjectors(query: string, activeIds: readonly string[] = [], limit = 80) {
  const terms = normaliseSearch(query).split(" ").filter(Boolean);
  const active = new Set(activeIds);

  if (!terms.length) {
    return injectorProfiles
      .slice()
      .sort((a, b) => Number(active.has(b.id)) - Number(active.has(a.id)) || b.popularity - a.popularity || a.label.localeCompare(b.label))
      .slice(0, limit);
  }

  return searchIndex
    .map(({ profile, text, label }) => {
      const termScores: number[] = terms.map((term) => {
        if (label.includes(term)) return 12;
        if (profile.aliases.some((alias) => normaliseSearch(alias).includes(term))) return 10;
        if (profile.keywords.some((keyword) => normaliseSearch(keyword).includes(term))) return 8;
        if (profile.group.toLowerCase().includes(term)) return 6;
        if (text.includes(term)) return 3;
        return 0;
      });
      const score = termScores.reduce((total, termScore) => total + termScore, 0);

      return {
        profile,
        score: score + (active.has(profile.id) ? 2 : 0),
        matchedAllTerms: termScores.every((termScore) => termScore > 0),
      };
    })
    .filter((entry) => entry.score > 0 && (terms.length === 1 || entry.matchedAllTerms))
    .sort((a, b) => b.score - a.score || b.profile.popularity - a.profile.popularity || a.profile.label.localeCompare(b.profile.label))
    .slice(0, limit)
    .map((entry) => entry.profile);
}

export function groupInjectors(profiles: readonly InjectorProfile[]) {
  const groups = new Map<InjectorGroup, InjectorProfile[]>();

  for (const profile of profiles) {
    groups.set(profile.group, [...(groups.get(profile.group) ?? []), profile]);
  }

  return injectorGroups
    .map((group) => ({ group, profiles: groups.get(group) ?? [] }))
    .filter((section) => section.profiles.length > 0);
}

export function getPopularInjectors(limit = 8) {
  return injectorProfiles
    .slice()
    .sort((a, b) => b.popularity - a.popularity || a.label.localeCompare(b.label))
    .slice(0, limit);
}

export function sanitiseRecentInjectorIds(ids: readonly string[], limit = 8) {
  const seen = new Set<string>();
  const safe: string[] = [];

  for (const id of ids) {
    if (injectorRegistry[id] && !seen.has(id)) {
      seen.add(id);
      safe.push(id);
    }
  }

  return safe.slice(0, limit);
}

export function addRecentInjectorId(ids: readonly string[], id: string, limit = 8) {
  return sanitiseRecentInjectorIds([id, ...ids.filter((current) => current !== id)], limit);
}

export function suggestInjectors(input: string, activeValues: readonly string[] = [], limit = 8) {
  const activeIds = new Set(resolveInjectors(activeValues).map((profile) => profile.id));
  const searchText = normaliseSearch(input);
  const phraseHints: Array<{ pattern: RegExp; ids: readonly string[] }> = [
    { pattern: /\b(esp32|raspberry pi|microcontroller|arduino|firmware)\b/i, ids: ["embedded-systems", "edge-ai", "microcontroller-larp", "local-ai", "honourable-engineering-larp"] },
    { pattern: /\b(dashboard|api|database|crud|wrapper)\b/i, ids: ["enterprise-it", "crud-pretending-to-be-agi", "rebranding-a-dashboard-as-intelligence", "platform-engineering", "single-pane-of-glass", "api-call-in-a-trench-coat"] },
    { pattern: /\b(meeting|deadline|manager|stakeholder)\b/i, ids: ["corporate-strategy", "responsibility-avoidance", "meeting-culture", "strategic-ambiguity", "pretending-delay-was-strategy"] },
    { pattern: /\b(benchmark|paper|experiment|ablation)\b/i, ids: ["academic-research", "invented-benchmark", "state-of-the-art", "research-larp", "statistically-significant-vibes"] },
    { pattern: /\b(government|policy|civil service|procurement)\b/i, ids: ["government-digital-transformation", "civil-service", "public-policy", "whole-of-government-approach", "public-sector-consulting"] },
  ];
  const scores = new Map<string, number>();

  for (const hint of phraseHints) {
    if (hint.pattern.test(input)) {
      hint.ids.forEach((id, index) => scores.set(id, (scores.get(id) ?? 0) + 30 - index));
    }
  }

  for (const entry of searchIndex) {
    for (const keyword of [...entry.profile.keywords, ...entry.profile.aliases]) {
      const normalisedKeyword = normaliseSearch(keyword);
      if (normalisedKeyword && searchText.includes(normalisedKeyword)) {
        scores.set(entry.profile.id, (scores.get(entry.profile.id) ?? 0) + 8);
      }
    }
  }

  return [...scores.entries()]
    .map(([id, score]) => ({ profile: injectorRegistry[id], score }))
    .filter((entry) => entry.profile && !activeIds.has(entry.profile.id))
    .sort((a, b) => b.score - a.score || b.profile.popularity - a.profile.popularity)
    .slice(0, limit)
    .map((entry) => entry.profile);
}

export function getQuickInjectors(input = "", recentIds: readonly string[] = [], activeValues: readonly string[] = [], limit = 8) {
  const activeIds = new Set(resolveInjectors(activeValues).map((profile) => profile.id));
  const suggested = suggestInjectors(input, activeValues, 4);
  const recent = sanitiseRecentInjectorIds(recentIds)
    .map((id) => injectorRegistry[id])
    .filter((profile) => profile && !activeIds.has(profile.id));
  const base = [...suggested, ...recent, ...featuredInjectors, ...getPopularInjectors(12)];
  const seen = new Set<string>();

  return base
    .filter((profile) => {
      if (!profile || seen.has(profile.id) || activeIds.has(profile.id)) {
        return false;
      }
      seen.add(profile.id);
      return true;
    })
    .slice(0, limit);
}
