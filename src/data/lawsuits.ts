import type { Lawsuit } from "@/lib/schema";

// -----------------------------------------------------------------------------
// SEED DATA — AI copyright lawsuits.
//
// Every entry was researched and cross-checked against a CourtListener docket
// plus at least one corroborating source (Reuters / NPR / Bloomberg Law /
// Variety / Rolling Stone / plaintiff counsel). Do NOT add a case here without
// at least one real source URL. If a case's outcome is unclear, use status
// "pending" or "needs_review" rather than guessing.
//
// `verified: true`  -> high-confidence, ready to display publicly.
// `verified: false` -> medium/low confidence, flagged for manual review.
// -----------------------------------------------------------------------------

export const lawsuits: Lawsuit[] = [
  {
    id: "nyt-openai",
    name: "The New York Times Company v. Microsoft & OpenAI",
    plaintiff: "The New York Times",
    plaintiffType: "media",
    defendant: "OpenAI",
    filingDate: "2023-12-27",
    status: "pending",
    category: "news articles / LLM training",
    court: "SDNY",
    notes:
      "NYT alleges Microsoft and OpenAI copied millions of its articles to train GPT models and that ChatGPT reproduces its content. Part of the consolidated In re OpenAI MDL; motion-to-dismiss largely denied April 2025.",
    confidence: "high",
    verified: true,
    lastUpdated: "2026-07-01",
    sources: [
      {
        url: "https://www.courtlistener.com/docket/68117049/the-new-york-times-company-v-microsoft-corporation/",
        label: "CourtListener docket 1:23-cv-11195",
      },
      {
        url: "https://www.npr.org/2023/12/27/1221821750/new-york-times-sues-openai-microsoft-for-copyright-infringement",
        label: "NPR coverage",
      },
    ],
  },
  {
    id: "authors-guild-openai",
    name: "Authors Guild v. OpenAI, Inc.",
    plaintiff: "Authors Guild",
    plaintiffType: "authors",
    defendant: "OpenAI",
    filingDate: "2023-09-19",
    status: "pending",
    category: "books / text LLM training",
    court: "SDNY",
    notes:
      "Class action by the Authors Guild and 17 named authors (Grisham, Martin, Preston, et al.) alleging copyrighted fiction was used to train GPT. Consolidated into In re OpenAI Copyright Infringement Litigation; ongoing.",
    confidence: "high",
    verified: true,
    lastUpdated: "2026-07-01",
    sources: [
      {
        url: "https://www.courtlistener.com/docket/67810584/authors-guild-v-openai-inc/",
        label: "CourtListener docket 1:23-cv-08292",
      },
      {
        url: "https://authorsguild.org/news/ag-and-authors-file-class-action-suit-against-openai/",
        label: "Authors Guild announcement",
      },
    ],
  },
  {
    id: "tremblay-openai",
    name: "Tremblay v. OpenAI, Inc.",
    plaintiff: "Paul Tremblay et al.",
    plaintiffType: "authors",
    defendant: "OpenAI",
    filingDate: "2023-06-28",
    status: "pending",
    category: "books / text LLM training",
    court: "N.D. Cal.",
    notes:
      "Filed June 2023. Most claims dismissed early 2024 with leave to amend; direct copyright infringement and unfair competition claims proceeded. Consolidated with related OpenAI author actions.",
    confidence: "high",
    verified: true,
    lastUpdated: "2026-07-01",
    sources: [
      {
        url: "https://www.courtlistener.com/docket/67538258/tremblay-v-openai-inc/",
        label: "CourtListener docket 3:23-cv-03223",
      },
      {
        url: "https://knowingmachines.org/knowing-legal-machines/legal-explainer/cases/tremblay-v-openai",
        label: "Knowing Machines case explainer",
      },
    ],
  },
  {
    id: "silverman-openai",
    name: "Silverman v. OpenAI, Inc.",
    plaintiff: "Sarah Silverman et al.",
    plaintiffType: "authors",
    defendant: "OpenAI",
    filingDate: "2023-07-07",
    status: "pending",
    category: "books / text LLM training",
    court: "N.D. Cal.",
    notes:
      "Filed July 2023. Court dismissed most claims early 2024 except direct copyright infringement and unfair business practices; consolidated with Tremblay and other OpenAI author suits.",
    confidence: "high",
    verified: true,
    lastUpdated: "2026-07-01",
    sources: [
      {
        url: "https://www.courtlistener.com/docket/67569254/silverman-v-openai-inc/",
        label: "CourtListener docket 3:23-cv-03416",
      },
      {
        url: "https://dockets.justia.com/docket/california/candce/3:2023cv03416/415174",
        label: "Justia docket record",
      },
    ],
  },
  {
    id: "raw-story-openai",
    name: "Raw Story Media, Inc. v. OpenAI, Inc.",
    plaintiff: "Raw Story Media",
    plaintiffType: "media",
    defendant: "OpenAI",
    filingDate: "2024-02-28",
    status: "lost",
    category: "news articles / DMCA (CMI removal)",
    court: "SDNY",
    notes:
      "Raw Story and AlterNet alleged OpenAI stripped copyright-management information (DMCA 1202(b)). Judge McMahon dismissed for lack of Article III standing Nov 2024 (without prejudice).",
    confidence: "high",
    verified: true,
    lastUpdated: "2026-07-01",
    sources: [
      {
        url: "https://www.courtlistener.com/docket/68290709/raw-story-media-inc-v-openai-inc/",
        label: "CourtListener docket 1:24-cv-01514",
      },
      {
        url: "https://venturebeat.com/ai/openais-data-scraping-wins-big-as-raw-storys-copyright-lawsuit-dismissed-by-ny-court",
        label: "VentureBeat coverage of dismissal",
      },
    ],
  },
  {
    id: "intercept-openai",
    name: "The Intercept Media, Inc. v. OpenAI, Inc.",
    plaintiff: "The Intercept",
    plaintiffType: "media",
    defendant: "OpenAI",
    filingDate: "2024-02-28",
    status: "pending",
    category: "news articles / DMCA (CMI removal)",
    court: "SDNY",
    notes:
      "Alleges DMCA 1202(b) violations for removal of copyright-management information. Judge Rakoff allowed the 1202(b)(1) claim against OpenAI to proceed (Feb 2025) while dismissing Microsoft.",
    confidence: "high",
    verified: true,
    lastUpdated: "2026-07-01",
    sources: [
      {
        url: "https://www.courtlistener.com/docket/68290804/the-intercept-media-inc-v-openai-inc/",
        label: "CourtListener docket 1:24-cv-01515",
      },
      {
        url: "https://law.justia.com/cases/federal/district-courts/new-york/nysdce/1:2024cv01515/616536/127/",
        label: "Justia case record",
      },
    ],
  },
  {
    id: "cir-openai",
    name: "Center for Investigative Reporting v. OpenAI & Microsoft",
    plaintiff: "Center for Investigative Reporting",
    plaintiffType: "media",
    defendant: "OpenAI",
    filingDate: "2024-06-27",
    status: "pending",
    category: "news articles / copyright & DMCA",
    court: "SDNY",
    notes:
      "CIR (publisher of Mother Jones and Reveal) alleges copyright infringement and DMCA violations, citing 17,000+ Mother Jones URLs in training data. Consolidated with NYT v. Microsoft/OpenAI in Oct 2024.",
    confidence: "high",
    verified: true,
    lastUpdated: "2026-07-01",
    sources: [
      {
        url: "https://www.courtlistener.com/docket/68892274/the-center-for-investigative-reporting-inc-v-openai-inc/",
        label: "CourtListener docket 1:24-cv-04872",
      },
      {
        url: "https://www.loevy.com/center-for-investigative-reporting-mother-jones-openai-microsoft-copyright-lawsuit/",
        label: "Plaintiff counsel (Loevy) announcement",
      },
    ],
  },
  {
    id: "daily-news-openai",
    name: "Daily News, LP et al. v. Microsoft & OpenAI",
    plaintiff: "Daily News / Alden Global",
    plaintiffType: "media",
    defendant: "OpenAI",
    filingDate: "2024-04-30",
    status: "pending",
    category: "news articles / copyright & DMCA",
    court: "SDNY",
    notes:
      "Eight Alden Global Capital newspapers (NY Daily News, Chicago Tribune, Orlando Sentinel, Denver Post, San Jose Mercury News, etc.) sued over copying of articles to build ChatGPT and Copilot. Consolidated with the NYT case.",
    confidence: "high",
    verified: true,
    lastUpdated: "2026-07-01",
    sources: [
      {
        url: "https://www.courtlistener.com/docket/68484432/daily-news-lp-v-microsoft-corporation/",
        label: "CourtListener docket 1:24-cv-03285",
      },
      {
        url: "https://www.npr.org/2024/04/30/1248141220/lawsuit-openai-microsoft-copyright-infringement-newspaper-tribune-post",
        label: "NPR coverage",
      },
    ],
  },
  {
    id: "kadrey-meta",
    name: "Kadrey v. Meta Platforms, Inc.",
    plaintiff: "Richard Kadrey et al.",
    plaintiffType: "authors",
    defendant: "Meta",
    filingDate: "2023-07-07",
    status: "pending",
    category: "books / text LLM training (Llama)",
    court: "N.D. Cal.",
    notes:
      "On June 25, 2025 Judge Chhabria granted Meta partial summary judgment on fair use, finding training transformative and no proven market harm, but expressly left the door open for future plaintiffs. Case remains ongoing on remaining issues.",
    confidence: "high",
    verified: true,
    lastUpdated: "2026-07-01",
    sources: [
      {
        url: "https://www.courtlistener.com/docket/67569326/kadrey-v-meta-platforms-inc/",
        label: "CourtListener docket 3:23-cv-03417",
      },
      {
        url: "https://perkinscoie.com/insights/update/court-sides-meta-fair-use-and-dmca-questions-leaves-door-open-future-challenges",
        label: "Perkins Coie analysis",
      },
    ],
  },
  {
    id: "bartz-anthropic",
    name: "Bartz v. Anthropic PBC",
    plaintiff: "Andrea Bartz et al.",
    plaintiffType: "authors",
    defendant: "Anthropic",
    filingDate: "2024-08-19",
    status: "settled",
    category: "books / text LLM training (Claude)",
    court: "N.D. Cal.",
    notes:
      "June 2025: Judge Alsup ruled training on lawfully acquired books was transformative fair use, but retention of pirated copies was infringing. Settlement of at least $1.5 billion (~$3,000 per work) reached and approved 2025.",
    confidence: "high",
    verified: true,
    lastUpdated: "2026-07-01",
    sources: [
      {
        url: "https://www.courtlistener.com/docket/69058235/bartz-v-anthropic-pbc/",
        label: "CourtListener docket 3:24-cv-05417",
      },
      {
        url: "https://news.bloomberglaw.com/ip-law/judge-blesses-1-5-billion-anthropic-copyright-deal-with-authors",
        label: "Bloomberg Law: $1.5B settlement approved",
      },
      {
        url: "https://authorsguild.org/advocacy/artificial-intelligence/what-authors-need-to-know-about-the-anthropic-settlement/",
        label: "Authors Guild settlement details",
      },
    ],
  },
  {
    id: "concord-anthropic",
    name: "Concord Music Group, Inc. v. Anthropic PBC",
    plaintiff: "Concord Music Group",
    plaintiffType: "musicians",
    defendant: "Anthropic",
    filingDate: "2023-10-18",
    status: "pending",
    category: "song lyrics / text LLM training (Claude)",
    court: "N.D. Cal. (transferred from M.D. Tenn.)",
    notes:
      "Filed Oct 2023 over ~500 copyrighted musical works whose lyrics Claude allegedly reproduced. Court granted certain guardrails but declined a broad preliminary injunction; cross-motions for partial summary judgment briefed 2025. Ongoing.",
    confidence: "high",
    verified: true,
    lastUpdated: "2026-07-01",
    sources: [
      {
        url: "https://www.courtlistener.com/docket/68889092/concord-music-group-inc-v-anthropic-pbc/",
        label: "CourtListener docket 5:24-cv-03811",
      },
      {
        url: "https://variety.com/2023/music/news/universal-concord-abkco-sue-ai-company-anthropic-copyright-violation-1235761250/",
        label: "Variety coverage",
      },
    ],
  },
  {
    id: "huckabee-meta",
    name: "Huckabee v. Meta Platforms, Inc.",
    plaintiff: "Mike Huckabee et al.",
    plaintiffType: "authors",
    defendant: "Meta",
    filingDate: "2023-10-17",
    status: "pending",
    category: "books / text LLM training (Books3)",
    court: "S.D.N.Y. / N.D. Cal.",
    notes:
      "Filed Oct 2023 against Meta, Microsoft, Bloomberg and EleutherAI over the Books3 dataset. EleutherAI claims dismissed; Meta/Microsoft claims transferred to N.D. Cal. Dec 2023. MEDIUM confidence due to defendant realignment/transfers.",
    confidence: "medium",
    verified: false,
    lastUpdated: "2026-07-01",
    sources: [
      {
        url: "https://www.courtlistener.com/docket/67890942/huckabee-v-meta-platforms-inc/",
        label: "CourtListener docket 1:23-cv-09152",
      },
      {
        url: "https://news.bloomberglaw.com/ip-law/mike-huckabee-sues-meta-microsoft-bloomberg-over-ai-copyrights",
        label: "Bloomberg Law coverage",
      },
    ],
  },
  {
    id: "getty-stability",
    name: "Getty Images (US), Inc. v. Stability AI, Inc.",
    plaintiff: "Getty Images",
    plaintiffType: "visual_artists",
    defendant: "Stability AI",
    filingDate: "2023-02-03",
    status: "pending",
    category: "image generation",
    court: "D. Del. / N.D. Cal.",
    notes:
      "Filed Feb 2023 in Delaware; claims include copyright, trademark, DMCA and dilution over training Stable Diffusion on Getty images. Delaware docket terminated Aug 2025; Getty continued in N.D. Cal. Litigation ongoing.",
    confidence: "high",
    verified: true,
    lastUpdated: "2026-07-01",
    sources: [
      {
        url: "https://www.courtlistener.com/docket/66788385/getty-images-us-inc-v-stability-ai-inc/",
        label: "CourtListener docket 1:23-cv-00135",
      },
      {
        url: "https://www.reuters.com/legal/litigation/getty-images-lawsuit-says-stability-ai-misused-photos-train-ai-2023-02-06/",
        label: "Reuters coverage",
      },
    ],
  },
  {
    id: "andersen-stability",
    name: "Andersen v. Stability AI Ltd.",
    plaintiff: "Sarah Andersen et al.",
    plaintiffType: "visual_artists",
    defendant: "Stability AI",
    filingDate: "2023-01-13",
    status: "pending",
    category: "image generation",
    court: "N.D. Cal.",
    notes:
      "Class action by visual artists (Sarah Andersen, Kelly McKernan, Karla Ortiz, et al.) against Stability AI, Midjourney and DeviantArt over image-generator training. Some claims trimmed on motions to dismiss but the case continues.",
    confidence: "high",
    verified: true,
    lastUpdated: "2026-07-01",
    sources: [
      {
        url: "https://www.courtlistener.com/docket/66732129/andersen-v-stability-ai-ltd/",
        label: "CourtListener docket 3:23-cv-00201",
      },
      {
        url: "https://www.crowell.com/en/insights/client-alerts/california-federal-court-trims-lawsuit-against-stability-ai-midjourney-and-deviantart-in-generative-ai-artwork-case",
        label: "Crowell & Moring analysis",
      },
    ],
  },
  {
    id: "doe-github",
    name: "Doe 1 v. GitHub, Inc.",
    plaintiff: "Doe Developers",
    plaintiffType: "platform",
    defendant: "GitHub/Microsoft",
    filingDate: "2022-11-03",
    status: "pending",
    category: "code generation",
    court: "N.D. Cal.",
    notes:
      "Filed Nov 2022 by anonymous open-source developers over GitHub Copilot/OpenAI Codex trained on public code. Copyright claims dismissed; DMCA and license/contract claims narrowed but litigation continues.",
    confidence: "high",
    verified: true,
    lastUpdated: "2026-07-01",
    sources: [
      {
        url: "https://www.saverilawfirm.com/our-cases/github-copilot-intellectual-property-litigation",
        label: "Joseph Saveri Law Firm (plaintiff counsel)",
      },
      {
        url: "https://www.bakerlaw.com/the-copilot-litigation/",
        label: "BakerHostetler case summary",
      },
    ],
  },
  {
    id: "thomson-reuters-ross",
    name: "Thomson Reuters v. ROSS Intelligence Inc.",
    plaintiff: "Thomson Reuters",
    plaintiffType: "publisher",
    defendant: "Ross Intelligence",
    filingDate: "2020-05-06",
    status: "pending",
    category: "legal research AI / text",
    court: "D. Del.",
    notes:
      "Sued over use of Westlaw headnotes to build an AI legal-research tool. On Feb 11, 2025, Judge Bibas granted Thomson Reuters partial summary judgment on direct infringement and rejected Ross's fair use defense. On interlocutory appeal to the Third Circuit; not final.",
    confidence: "high",
    verified: true,
    lastUpdated: "2026-07-01",
    sources: [
      {
        url: "https://www.courtlistener.com/docket/17131648/thomson-reuters-enterprise-centre-gmbh-v-ross-intelligence-inc/",
        label: "CourtListener docket 1:20-cv-00613",
      },
      {
        url: "https://www.dwt.com/blogs/artificial-intelligence-law-advisor/2025/02/reuters-ross-court-ruling-ai-copyright-fair-use",
        label: "Davis Wright Tremaine analysis",
      },
    ],
  },
  {
    id: "umg-suno",
    name: "UMG Recordings, Inc. v. Suno, Inc.",
    plaintiff: "UMG / RIAA Labels",
    plaintiffType: "musicians",
    defendant: "Suno",
    filingDate: "2024-06-24",
    status: "pending",
    category: "music generation",
    court: "D. Mass.",
    notes:
      "Filed June 2024 by RIAA member labels (UMG, Sony, Warner) alleging Suno trained its music-generation model on copyrighted sound recordings. Warner settled and dismissed its claims (Nov 2025), but UMG and Sony remain active plaintiffs; litigation ongoing.",
    confidence: "high",
    verified: true,
    lastUpdated: "2026-07-01",
    sources: [
      {
        url: "https://www.courtlistener.com/docket/68878608/umg-recordings-inc-v-suno-inc/",
        label: "CourtListener docket 1:24-cv-11611",
      },
      {
        url: "https://www.rollingstone.com/music/music-features/suno-warner-music-group-ai-music-settlement-lawsuit-1235472868/",
        label: "Rolling Stone: Warner-Suno settlement",
      },
    ],
  },
  {
    id: "umg-udio",
    name: "UMG Recordings, Inc. v. Uncharted Labs, Inc. (Udio)",
    plaintiff: "UMG / RIAA Labels",
    plaintiffType: "musicians",
    defendant: "Udio",
    filingDate: "2024-06-24",
    status: "settled",
    category: "music generation",
    court: "S.D.N.Y.",
    notes:
      "Filed June 2024 against Uncharted Labs (Udio) over AI music-generation training. Resolved via settlement/licensing deals in 2025; Notice of Settlement (Oct 2025). MEDIUM confidence pending confirmation of dismissal terms.",
    confidence: "medium",
    verified: false,
    lastUpdated: "2026-07-01",
    sources: [
      {
        url: "https://www.courtlistener.com/docket/68878697/umg-recordings-inc-v-uncharted-labs-inc/",
        label: "CourtListener docket 1:24-cv-04777",
      },
      {
        url: "https://www.forbes.com/sites/virginieberger/2025/12/18/launch-train-settle-how-suno-and-udios-licensing-deals-made-copyright-infringement-profitable/",
        label: "Forbes: Suno/Udio licensing deals",
      },
    ],
  },
];
