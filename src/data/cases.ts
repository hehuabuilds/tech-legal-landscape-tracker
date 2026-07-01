import type { Case } from "@/lib/schema";
import casesData from "./cases.json";

// -----------------------------------------------------------------------------
// SEED DATA — AI Legal Landscape Tracker (living historical database).
//
// The array lives in cases.json (generated from verified, source-backed
// research across all case types). It is validated by Zod in lib/data.ts at
// load time, so any malformed record is dropped rather than rendered.
//
// APPEND-ONLY in spirit: never delete a case (use `removed` for demonstrable
// errors only); update `status` + append to `timeline` rather than rewriting
// history. Every record has >= 1 real source URL. Uncertain -> needs_review.
// -----------------------------------------------------------------------------

export const cases = casesData as unknown as Case[];
