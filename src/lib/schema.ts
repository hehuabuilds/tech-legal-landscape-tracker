import { z } from "zod";
import {
  PLAINTIFF_TYPE_KEYS,
  STATUS_KEYS,
  CONFIDENCE_KEYS,
} from "./constants";

// A source must always be a real URL. This is the schema-level enforcement of
// the project rule: "every case must have at least one source URL".
export const sourceSchema = z.object({
  url: z.url(),
  label: z.string().nullish(),
});

export const lawsuitSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  plaintiff: z.string().min(1),
  plaintiffType: z.enum(PLAINTIFF_TYPE_KEYS),
  defendant: z.string().min(1),
  // ISO date (YYYY-MM-DD) or null when the filing date is genuinely unknown.
  filingDate: z.string().nullable(),
  status: z.enum(STATUS_KEYS),
  category: z.string().nullable(),
  court: z.string().nullable(),
  notes: z.string().nullable(),
  confidence: z.enum(CONFIDENCE_KEYS),
  verified: z.boolean(),
  lastUpdated: z.string(),
  // >= 1 source is required. A case with no source cannot pass validation.
  sources: z.array(sourceSchema).min(1, "every case must have >= 1 source URL"),
});

export type Source = z.infer<typeof sourceSchema>;
export type Lawsuit = z.infer<typeof lawsuitSchema>;

export const lawsuitsSchema = z.array(lawsuitSchema);
