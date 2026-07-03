import type { Case } from "./schema";

// Layer-1 issue clusters — the gravitational anchors of the galaxy. This is a
// DIFFERENT (broader) taxonomy than `caseType` (which still drives filters):
// a case can belong to several issue clusters.
export const ISSUE_KEYS = [
  "copyright",
  "training_data",
  "privacy",
  "competition",
  "defamation",
  "employment",
  "consumer_protection",
  "deepfakes_likeness",
  "open_source_licensing",
  "national_security",
  "ai_safety_governance",
] as const;
export type IssueKey = (typeof ISSUE_KEYS)[number];

export const ISSUE_CLUSTERS: Record<IssueKey, { label: string }> = {
  copyright: { label: "Copyright" },
  training_data: { label: "Training Data" },
  privacy: { label: "Privacy" },
  competition: { label: "Competition / Antitrust" },
  defamation: { label: "Defamation" },
  employment: { label: "Employment" },
  consumer_protection: { label: "Consumer Protection" },
  deepfakes_likeness: { label: "Deepfakes & Likeness" },
  open_source_licensing: { label: "Open Source & Licensing" },
  national_security: { label: "National Security" },
  ai_safety_governance: { label: "AI Safety / Governance" },
};

// Deterministic base mapping from caseType → issue clusters.
const BASE: Record<string, IssueKey[]> = {
  copyright_training_data: ["copyright", "training_data"],
  privacy_data_protection: ["privacy"],
  defamation_misinformation: ["defamation"],
  ai_safety_harms: ["ai_safety_governance"],
  licensing_contract: ["open_source_licensing"],
  antitrust_competition: ["competition"],
  employment_labor: ["employment"],
  consumer_protection: ["consumer_protection"],
  regulatory_enforcement: ["ai_safety_governance"],
  government_investigation: ["ai_safety_governance"],
  other: ["ai_safety_governance"],
};

// Keyword augmentation — adds cross-cutting clusters based on the case text.
const KEYWORDS: Array<{ issue: IssueKey; re: RegExp }> = [
  { issue: "deepfakes_likeness", re: /deepfake|nudif|likeness|voice|darth vader|replika|replica|clone|sexualiz|non-consensual|csam|child sexual/ },
  { issue: "open_source_licensing", re: /open source|open-source|github|copilot|licens|scrap/ },
  { issue: "national_security", re: /national security|deepseek|\bchina\b|chinese|cross-border|export control/ },
  { issue: "privacy", re: /privacy|gdpr|data protection|biometric|voiceprint|personal data|\bdpa\b/ },
  { issue: "training_data", re: /train(ed|ing) on|training data|dataset|shadow librar|scrap/ },
  { issue: "copyright", re: /copyright|infring|dmca/ },
  { issue: "competition", re: /antitrust|monopol|abuse of dominance|competition|strategic market/ },
  { issue: "consumer_protection", re: /deceptive|consumer|fake review|misrepresent/ },
  { issue: "employment", re: /hiring|employ|discriminat|\blabor\b|applicant|\bworker/ },
  { issue: "defamation", re: /defamation|libel|false statement|hallucinat/ },
  { issue: "ai_safety_governance", re: /child|teen|minor|suicide|self-harm|companion|safety|\bharm|ai act|governance/ },
];

export function deriveIssues(c: Pick<Case, "caseType" | "title" | "summary">): IssueKey[] {
  const set = new Set<IssueKey>(BASE[c.caseType] ?? ["ai_safety_governance"]);
  const text = `${c.title} ${c.summary}`.toLowerCase();
  for (const { issue, re } of KEYWORDS) if (re.test(text)) set.add(issue);
  return [...set];
}
