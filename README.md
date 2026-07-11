# Trends As You Go

A mobile-first web app for content creators that surfaces what's trending on X (Twitter) right now, and generates concrete, actionable video ideas for each trend on demand.

**Bring your own API key** — this is a pure client-side app with no backend to host or configure. Powered by OpenAI's GPT-4o-mini.

## How it works

1. Enter your OpenAI API key in the Settings page
2. The app calls GPT-4o-mini live via a thin Next.js API route to fetch trending topics
3. Browse the feed, filter by niche, or search for specific topics
4. Tap any topic to see details — then tap **"FIND CONTENT IDEAS"** to generate 5 distinct video concepts on demand

### Niche Filter

Tap a niche chip (AI, Healthcare, Finance, etc.) on the Home screen to scope trends to that specific industry. Each niche triggers a tailored prompt. Your selection is saved in localStorage.

### Content Ideas

Each topic's detail page has a **"FIND CONTENT IDEAS"** button that calls GPT-4o-mini to generate 5 varied video concepts (reaction, tutorial, opinion, etc.) specific to that trend. Results are cached during your session, and you can regenerate for fresh ideas at any time.

## Setup

```bash
git clone <repo>
npm install
npm run dev
```

Open the app → go to **Settings** → paste in your OpenAI API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys) → done.

## Tech

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **lucide-react** (icons)
- **OpenAI API** (trend data via GPT-4o)

## Notes

- Each refresh calls the OpenAI API live and uses API credits. There is no caching or scheduled job.
- Your API key is stored in **localStorage only** — it never touches any server other than OpenAI's API.
- No database, no backend, no third-party services.
