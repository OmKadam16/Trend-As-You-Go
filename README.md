# Trends As You Go

Surface trending X (Twitter) topics and generate on-demand video content ideas — powered by OpenAI.

## Features

- **Live trending feed** across 9 niches (AI, Healthcare, Finance, Fitness, etc.)
- **Search** any keyword for cross-niche trends
- **On-demand AI content ideas** for each trend
- **Mobile-first design** with dark theme and lime accents
- **Bring your own API key** — no backend, no database

## Screenshots

![Trends As You Go](public/screenshots/App%201.png)

## How to Use

1. **Get an API key** — Visit [platform.openai.com/api-keys](https://platform.openai.com/api-keys) and create a key.
2. **Enter it in Settings** — Open the app, tap **Settings** (gear icon), paste your key, and save.
3. **Browse trends** — The Home feed shows trending topics. Tap a niche chip (For You, AI, Finance...) to filter.
4. **Search** — Tap the **Search** tab to find trends by keyword, independent of your current niche.
5. **View a topic** — Tap any trend to see AI summary, X signal, key drivers, and metadata.
6. **Generate content ideas** — On the topic detail page, tap **FIND CONTENT IDEAS** to get 5 video concepts. Regenerate anytime.

## Local Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), go to Settings, and paste your OpenAI API key.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **lucide-react**
- **OpenAI GPT-4o-mini**

## Privacy

Your API key is stored in localStorage only and sent directly to OpenAI via a thin Next.js API route. No data is stored on any server.
