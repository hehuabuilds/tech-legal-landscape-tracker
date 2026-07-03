This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Data scraper (auto-updates twice a week)

The case dataset in [`src/data/cases.json`](src/data/cases.json) is refreshed by
a low-cost automated scraper, [`scripts/scrape.ts`](scripts/scrape.ts):

1. **Scrape public sources** with plain `fetch`/RSS/JSON — no LLM web search:
   CourtListener's search API, and press-release feeds from the FTC, SEC, DOJ,
   EU Commission, UK CMA, and California AG, plus Google News RSS for AI-legal
   search terms.
2. **Normalize + keyword-filter** each item to AI/tech-relevant candidates.
3. **Deduplicate** against existing cases by URL and fuzzy title match.
4. **Classify with Gemini** — only the *new* candidates are sent to Gemini
   (`gemini-2.5-flash`), which judges relevance and structures the known facts
   into our Zod `Case` schema. Gemini never discovers or invents cases; unsure
   items are excluded.
5. **Validate + append** — survivors are flagged `confidence: "low" | "medium"`
   and `reviewStatus: "needs_review"` (so the UI badges them), capped at 8 per
   run, with source URLs preserved. Existing curated data is never modified.

A missing key, an unreachable source, or a quiet week all exit cleanly, so CI
never fails.

### Getting a Gemini API key

1. Go to [Google AI Studio → API keys](https://aistudio.google.com/apikey).
2. Sign in and click **Create API key** (the free tier is enough for this job).
3. Copy the key (starts with `AIza…`).

### Adding it to GitHub

Repo **Settings → Secrets and variables → Actions → New repository secret**:

- **Name:** `GEMINI_API_KEY`
- **Value:** the key you copied

Without this secret the scheduled job runs as a no-op (never fails).

### Schedule & manual runs

- **Twice weekly:** [`.github/workflows/scrape.yml`](.github/workflows/scrape.yml)
  runs **Mondays and Thursdays at 06:00 UTC** and auto-commits new cases to
  `main`.
- **Run it manually:** GitHub → **Actions → “Scrape AI legal cases” → Run
  workflow** (the `workflow_dispatch` trigger).

### Run it locally

```bash
GEMINI_API_KEY=AIza... npm run scrape            # discover + write
GEMINI_API_KEY=AIza... npm run scrape -- --dry-run  # print, don't write
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
