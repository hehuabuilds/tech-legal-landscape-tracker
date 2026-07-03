/**
 * Twice-weekly scraper for the AI Legal Landscape Tracker (Gemini edition).
 *
 * PIPELINE
 *   1. Fetch candidate items from PUBLIC structured sources with plain
 *      fetch/RSS/JSON — no LLM web search:
 *        • CourtListener search API (dockets)
 *        • FTC / SEC / DOJ / EU Commission / UK CMA / CA AG press releases (RSS/Atom)
 *        • Google News RSS for topical AI-legal search terms
 *   2. Normalize each to { title, source, url, date, rawSnippet }.
 *   3. Keyword-filter broad feeds to AI/tech-relevant items.
 *   4. Deduplicate against src/data/cases.json (by URL + fuzzy title) and
 *      within the run itself.
 *   5. Send ONLY the new candidates to Gemini for classification + conversion
 *      into our Zod `Case` shape. Gemini is used purely to judge relevance and
 *      structure known facts — never to discover or invent cases.
 *   6. Validate with the existing Zod schema, flag confidence low/medium +
 *      reviewStatus "needs_review", cap at 8 per run, append to cases.json.
 *
 *   Best-effort throughout: a missing API key, an unreachable source, or a
 *   quiet week all exit 0 and leave cases.json untouched, so CI never fails.
 *
 * RUN
 *   GEMINI_API_KEY=... npx tsx scripts/scrape.ts            # discover + write
 *   GEMINI_API_KEY=... npx tsx scripts/scrape.ts --dry-run  # print only
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { GoogleGenAI } from "@google/genai";
import { caseSchema, type Case } from "../src/lib/schema";
import {
  CASE_TYPE_KEYS,
  ACTION_TYPE_KEYS,
  STATUS_KEYS,
  ENTITY_CATEGORY_KEYS,
  PARTY_ROLE_KEYS,
  PARTY_SIDE_KEYS,
} from "../src/lib/constants";

const HERE = dirname(fileURLToPath(import.meta.url));
const CASES_PATH = join(HERE, "..", "src", "data", "cases.json");

const DRY_RUN = process.argv.includes("--dry-run");
const TODAY = new Date().toISOString().slice(0, 10);
const MAX_NEW_PER_RUN = 8;
const MAX_CANDIDATES_TO_LLM = 40; // bound cost per run
const PER_SOURCE_LIMIT = 25;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const UA =
  "ai-lawsuit-map-scraper/1.0 (+https://github.com; twice-weekly research bot)";

// AI/tech relevance terms used to filter the broad regulator/news feeds.
const AI_TERMS = [
  "artificial intelligence",
  "generative ai",
  "\\bA\\.?I\\.?\\b",
  "machine learning",
  "training data",
  "algorithmic",
  "algorithm",
  "biometric",
  "facial recognition",
  "deepfake",
  "large language model",
  "chatbot",
  "chatgpt",
  "openai",
  "anthropic",
  "automated decision",
];
const AI_RE = new RegExp(AI_TERMS.join("|"), "i");

// Search terms → Google News RSS queries (already topical, no post-filter).
const NEWS_QUERIES = [
  "artificial intelligence lawsuit",
  "generative AI copyright lawsuit",
  "AI training data lawsuit",
  "AI regulation enforcement action",
  "AI privacy biometric lawsuit",
  "algorithmic bias discrimination lawsuit",
  "AI defamation lawsuit",
  "FTC artificial intelligence",
  "SEC artificial intelligence",
  "AI employment discrimination",
];

// Structured/public feeds. `filter: true` → keep only AI-relevant items.
const FEEDS: { source: string; url: string; filter: boolean }[] = [
  { source: "FTC", url: "https://www.ftc.gov/news-events/news/press-releases/rss", filter: true },
  { source: "SEC (litigation)", url: "https://www.sec.gov/rss/litigation/litreleases.xml", filter: true },
  { source: "SEC (press)", url: "https://www.sec.gov/news/pressreleases.rss", filter: true },
  { source: "DOJ", url: "https://www.justice.gov/feeds/opa/justice-news.xml", filter: true },
  { source: "EU Commission", url: "https://ec.europa.eu/commission/presscorner/api/rss?language=en", filter: true },
  { source: "UK CMA", url: "https://www.gov.uk/government/organisations/competition-and-markets-authority.atom", filter: true },
  { source: "CA Attorney General", url: "https://oag.ca.gov/rss/press-releases", filter: true },
];

// CourtListener recent-docket search across a few core queries (public API).
const COURTLISTENER_QUERIES = [
  "artificial intelligence",
  "generative AI",
  "AI training data copyright",
];

type Candidate = {
  title: string;
  source: string;
  url: string;
  date: string | null;
  rawSnippet: string;
};

// --- text helpers ----------------------------------------------------------

const norm = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();

const slug = (s: string) =>
  norm(s).replace(/\s+/g, "-").slice(0, 80) || `case-${Date.now()}`;

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&#x27;|&apos;/gi, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)));
}

// strip tags + entities + collapse whitespace
const clean = (s: string) =>
  decodeEntities(s).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

function toISODate(s: string | null | undefined): string | null {
  if (!s) return null;
  const d = new Date(s.trim());
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

// token-set Jaccard similarity for fuzzy title dedup
function similar(a: string, b: string): number {
  const wa = new Set(norm(a).split(" ").filter(Boolean));
  const wb = new Set(norm(b).split(" ").filter(Boolean));
  if (!wa.size || !wb.size) return 0;
  let inter = 0;
  for (const w of wa) if (wb.has(w)) inter++;
  return inter / (wa.size + wb.size - inter);
}

// --- tolerant RSS/Atom parser ---------------------------------------------

function tag(block: string, name: string): string {
  const re = new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, "i");
  return re.exec(block)?.[1] ?? "";
}

function parseFeed(xml: string): Omit<Candidate, "source">[] {
  const out: Omit<Candidate, "source">[] = [];
  const blocks = xml.match(/<(item|entry)\b[\s\S]*?<\/\1>/gi) ?? [];
  for (const b of blocks) {
    const title = clean(tag(b, "title"));
    // Atom <link href="..."/> or RSS <link>...</link>, fall back to guid/id
    let url =
      /<link\b[^>]*?href="([^"]+)"/i.exec(b)?.[1] ||
      clean(tag(b, "link")) ||
      clean(tag(b, "guid")) ||
      clean(tag(b, "id"));
    url = url.trim();
    const date =
      clean(tag(b, "pubDate")) ||
      clean(tag(b, "published")) ||
      clean(tag(b, "updated")) ||
      clean(tag(b, "dc:date")) ||
      null;
    const snippet = clean(
      tag(b, "description") || tag(b, "summary") || tag(b, "content"),
    ).slice(0, 600);
    if (title && url) out.push({ title, url, date: toISODate(date), rawSnippet: snippet });
  }
  return out;
}

// --- fetching --------------------------------------------------------------

async function fetchText(url: string): Promise<string | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept:
          "application/rss+xml, application/atom+xml, application/xml, text/xml, application/json;q=0.9, */*;q=0.8",
      },
      signal: ctrl.signal,
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  } catch (e) {
    console.warn(`[scrape] fetch failed ${url}: ${(e as Error).message}`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function collectFeeds(): Promise<Candidate[]> {
  const out: Candidate[] = [];
  for (const f of FEEDS) {
    const xml = await fetchText(f.url);
    if (!xml) continue;
    let items = parseFeed(xml);
    if (f.filter) {
      items = items.filter((it) => AI_RE.test(`${it.title} ${it.rawSnippet}`));
    }
    for (const it of items.slice(0, PER_SOURCE_LIMIT)) {
      out.push({ ...it, source: f.source });
    }
    console.log(`[scrape] ${f.source}: ${items.length} relevant item(s)`);
  }
  return out;
}

async function collectNews(): Promise<Candidate[]> {
  const out: Candidate[] = [];
  for (const q of NEWS_QUERIES) {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
      q,
    )}&hl=en-US&gl=US&ceid=US:en`;
    const xml = await fetchText(url);
    if (!xml) continue;
    for (const it of parseFeed(xml).slice(0, 10)) {
      out.push({ ...it, source: `Google News: ${q}` });
    }
  }
  console.log(`[scrape] Google News: ${out.length} item(s)`);
  return out;
}

async function collectCourtListener(): Promise<Candidate[]> {
  const out: Candidate[] = [];
  for (const q of COURTLISTENER_QUERIES) {
    const url = `https://www.courtlistener.com/api/rest/v4/search/?q=${encodeURIComponent(
      q,
    )}&type=r&order_by=dateFiled%20desc`;
    const body = await fetchText(url);
    if (!body) continue;
    try {
      const json = JSON.parse(body) as {
        results?: Array<{
          caseName?: string;
          absolute_url?: string;
          dateFiled?: string;
          court?: string;
          snippet?: string;
        }>;
      };
      for (const r of (json.results ?? []).slice(0, 10)) {
        if (!r.caseName || !r.absolute_url) continue;
        out.push({
          title: r.caseName,
          source: `CourtListener${r.court ? ` (${r.court})` : ""}`,
          url: `https://www.courtlistener.com${r.absolute_url}`,
          date: toISODate(r.dateFiled),
          rawSnippet: clean(r.snippet ?? "").slice(0, 600),
        });
      }
    } catch {
      /* not JSON / shape changed — skip */
    }
  }
  console.log(`[scrape] CourtListener: ${out.length} docket(s)`);
  return out;
}

// --- dedup -----------------------------------------------------------------

function normUrl(u: string): string {
  return u.split("#")[0].split("?")[0].replace(/\/+$/, "").toLowerCase();
}

function dedupeCandidates(
  cands: Candidate[],
  existing: Case[],
): Candidate[] {
  const existingUrls = new Set<string>();
  for (const c of existing)
    for (const s of c.sources) existingUrls.add(normUrl(s.url));
  const existingTitles = existing.map((c) => c.title);

  const seenUrls = new Set<string>();
  const kept: Candidate[] = [];
  for (const c of cands) {
    const nu = normUrl(c.url);
    if (existingUrls.has(nu) || seenUrls.has(nu)) continue;
    // fuzzy title match against existing + already-kept candidates
    const dup =
      existingTitles.some((t) => similar(t, c.title) >= 0.6) ||
      kept.some((k) => similar(k.title, c.title) >= 0.7);
    if (dup) continue;
    seenUrls.add(nu);
    kept.push(c);
  }
  return kept;
}

// --- Gemini classification + conversion -----------------------------------

function buildPrompt(cands: Candidate[]): string {
  const list = cands
    .map(
      (c, i) =>
        `[${i}] title: ${c.title}\n    source: ${c.source}\n    url: ${c.url}\n    date: ${c.date ?? "unknown"}\n    snippet: ${c.rawSnippet || "(none)"}`,
    )
    .join("\n\n");

  return `You maintain a source-backed database of AI- and technology-related legal cases and actions (lawsuits, regulatory actions, investigations, settlements, appeals, policy enforcement).

Below are candidate items already gathered from public sources. For EACH item decide: is this genuinely about AI/technology law or regulation? Only keep items where the AI/tech-law connection is clear from the title/snippet. If you are unsure, EXCLUDE it. Do NOT invent facts, parties, or citations — use only what the candidate provides. Keep the candidate's url as a source on every kept item.

Return ONLY a JSON array (no prose) of the RELEVANT items, at most ${MAX_NEW_PER_RUN}, each an object of this exact shape:
{
  "title": string,
  "actionType": one of ${JSON.stringify(ACTION_TYPE_KEYS)},
  "caseType": one of ${JSON.stringify(CASE_TYPE_KEYS)},
  "jurisdiction": string,                 // e.g. "US", "US-N.D.Cal.", "US-FTC", "US-SEC", "EU", "UK", "US-CA"
  "filingDate": string|null,              // YYYY-MM-DD if known, else null
  "status": one of ${JSON.stringify(STATUS_KEYS)},
  "summary": string,                      // 1-3 factual sentences grounded in the snippet
  "court": string|null,
  "statutes": string[],
  "legalTheories": string[],
  "confidence": "low" | "medium",         // "medium" only if the snippet clearly describes an AI-law matter
  "parties": [                            // >= 1 initiating AND >= 1 responding; infer conservatively
    { "name": string,
      "category": one of ${JSON.stringify(ENTITY_CATEGORY_KEYS)},
      "role": one of ${JSON.stringify(PARTY_ROLE_KEYS)},
      "side": one of ${JSON.stringify(PARTY_SIDE_KEYS)} }
  ],
  "timeline": [ { "date": "YYYY-MM-DD", "event": string, "status": (one of the status values)|null } ],
  "sources": [ { "url": string, "label": string } ]   // MUST include the candidate url
}

If none are relevant, return [].

CANDIDATES:
${list}`;
}

function stripToJson(text: string): unknown[] {
  const fence = [...text.matchAll(/```(?:json)?\s*([\s\S]*?)```/g)].pop();
  const raw = fence
    ? fence[1]
    : text.slice(text.indexOf("["), text.lastIndexOf("]") + 1);
  if (!raw.trim()) return [];
  try {
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : [];
  } catch (e) {
    console.error("[scrape] could not parse Gemini JSON:", (e as Error).message);
    return [];
  }
}

async function classifyWithGemini(cands: Candidate[]): Promise<unknown[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: buildPrompt(cands),
    config: {
      temperature: 0.1,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    },
  });
  return stripToJson(res.text ?? "");
}

// --- normalize one Gemini item into a validated Case ----------------------

function toCase(
  raw: unknown,
  fallbackUrl: string | undefined,
  usedIds: Set<string>,
): Case | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  let id = typeof r.id === "string" && r.id ? slug(r.id) : slug(String(r.title ?? ""));
  while (usedIds.has(id)) id = `${id}-2`;

  // machine-generated: clamp confidence to low/medium, force needs_review
  const conf = r.confidence === "medium" ? "medium" : "low";

  // guarantee at least one source url
  let sources = Array.isArray(r.sources) ? r.sources : [];
  if (sources.length === 0 && fallbackUrl) {
    sources = [{ url: fallbackUrl, label: "source" }];
  }

  const candidate = {
    ...r,
    id,
    sources,
    confidence: conf,
    reviewStatus: "needs_review",
    firstSeen: TODAY,
    lastVerified: TODAY,
    lastUpdated: TODAY,
  };

  const parsed = caseSchema.safeParse(candidate);
  if (!parsed.success) {
    console.warn(
      `[scrape] dropping invalid item "${String(r.title ?? "?")}": ` +
        parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
    );
    return null;
  }
  return parsed.data;
}

// --- main ------------------------------------------------------------------

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.log("[scrape] GEMINI_API_KEY not set — nothing to do.");
    return;
  }

  const existing = JSON.parse(readFileSync(CASES_PATH, "utf8")) as Case[];
  console.log(`[scrape] ${existing.length} existing cases loaded.`);

  // 1. gather
  const raw = [
    ...(await collectCourtListener()),
    ...(await collectFeeds()),
    ...(await collectNews()),
  ];
  console.log(`[scrape] ${raw.length} raw candidate(s) collected.`);

  // 2-4. dedupe, sort newest-first, cap
  let candidates = dedupeCandidates(raw, existing);
  candidates.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  candidates = candidates.slice(0, MAX_CANDIDATES_TO_LLM);
  console.log(`[scrape] ${candidates.length} new candidate(s) after dedup.`);
  if (candidates.length === 0) {
    console.log("[scrape] nothing new to classify.");
    return;
  }

  // 5. classify + convert (Gemini)
  const classified = await classifyWithGemini(candidates);
  console.log(`[scrape] Gemini kept ${classified.length} item(s).`);

  // map returned items back to a candidate url for the source fallback
  const urlByTitle = new Map(candidates.map((c) => [norm(c.title), c.url]));

  // 6-9. validate, dedupe again, cap, collect
  const existingTitles = existing.map((c) => c.title);
  const usedIds = new Set(existing.map((c) => c.id));
  const additions: Case[] = [];
  for (const item of classified) {
    const title = (item as Record<string, unknown>).title;
    const fallbackUrl =
      typeof title === "string" ? urlByTitle.get(norm(title)) : undefined;
    const c = toCase(item, fallbackUrl, usedIds);
    if (!c) continue;
    if (
      existingTitles.some((t) => similar(t, c.title) >= 0.6) ||
      additions.some((a) => similar(a.title, c.title) >= 0.7)
    ) {
      console.log(`[scrape] skip duplicate: ${c.title}`);
      continue;
    }
    usedIds.add(c.id);
    additions.push(c);
    if (additions.length >= MAX_NEW_PER_RUN) break;
  }

  if (additions.length === 0) {
    console.log("[scrape] no new cases this run.");
    return;
  }

  console.log(`[scrape] +${additions.length} new case(s):`);
  for (const c of additions) console.log(`   • [${c.confidence}] ${c.title}`);

  if (DRY_RUN) {
    console.log("[scrape] --dry-run: not writing.");
    return;
  }

  writeFileSync(CASES_PATH, JSON.stringify([...existing, ...additions], null, 2) + "\n");
  console.log(`[scrape] wrote ${existing.length + additions.length} cases to cases.json`);
}

main().catch((e) => {
  console.error("[scrape] fatal:", e);
  process.exit(1);
});
