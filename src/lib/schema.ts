import { z } from "zod";
import {
  CASE_TYPE_KEYS,
  ACTION_TYPE_KEYS,
  STATUS_KEYS,
  ENTITY_CATEGORY_KEYS,
  PARTY_ROLE_KEYS,
  PARTY_SIDE_KEYS,
  CONFIDENCE_KEYS,
  REVIEW_STATUS_KEYS,
} from "./constants";

// A source must always be a real URL — schema-level enforcement of the rule
// "every case/action must include source URLs".
export const sourceSchema = z.object({
  url: z.url(),
  label: z.string().nullish(),
  retrieved: z.string().nullish(),
});

// A party is stored denormalized (name + category) on the case. Entity nodes
// are derived by grouping parties by normalized name at load time.
export const partySchema = z.object({
  name: z.string().min(1),
  category: z.enum(ENTITY_CATEGORY_KEYS),
  role: z.enum(PARTY_ROLE_KEYS),
  side: z.enum(PARTY_SIDE_KEYS),
});

// Timeline events are APPEND-ONLY. An event may record the status as of its
// date, which powers the "as-of date" timeline slider.
export const timelineEventSchema = z.object({
  date: z.string(),
  event: z.string().min(1),
  status: z.enum(STATUS_KEYS).nullish(),
  sourceUrl: z.string().nullish(),
});

export const caseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  actionType: z.enum(ACTION_TYPE_KEYS),
  caseType: z.enum(CASE_TYPE_KEYS),
  parties: z.array(partySchema).min(2), // >= 1 initiating + >= 1 responding
  filingDate: z.string().nullable(),
  status: z.enum(STATUS_KEYS),
  jurisdiction: z.string().min(1),
  sources: z.array(sourceSchema).min(1, "every case must have >= 1 source URL"),
  summary: z.string(),
  timeline: z.array(timelineEventSchema),
  // structured legal metadata (drives court + law nodes and the detail panel)
  court: z.string().nullish(),
  statutes: z.array(z.string()).optional(),
  legalTheories: z.array(z.string()).optional(),
  // outcome / ripple effects — how the matter landed and how it was received
  outcome: z
    .object({
      // effect on statutes, regulations, or other cases (precedent, citations…)
      impact: z.array(z.string()).optional(),
      // public / press / market sentiment
      sentiment: z.array(z.string()).optional(),
    })
    .nullish(),
  // issue clusters (layer-1 anchors) — derived at load if absent
  issues: z.array(z.string()).optional(),
  // living-DB bookkeeping
  firstSeen: z.string(),
  lastVerified: z.string(),
  lastUpdated: z.string(),
  confidence: z.enum(CONFIDENCE_KEYS),
  reviewStatus: z.enum(REVIEW_STATUS_KEYS),
  removed: z
    .object({ reason: z.string(), date: z.string() })
    .nullish(),
});

export type Source = z.infer<typeof sourceSchema>;
export type Party = z.infer<typeof partySchema>;
export type TimelineEvent = z.infer<typeof timelineEventSchema>;
export type Case = z.infer<typeof caseSchema>;
