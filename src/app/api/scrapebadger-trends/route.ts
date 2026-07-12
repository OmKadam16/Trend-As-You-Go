import { NextRequest, NextResponse } from "next/server";
import { Topic, TopicResponseRaw } from "@/types";
import { NICHE_SEARCH_QUERIES } from "@/config/niches";

type ScrapeBadgerTweet = {
  user_name?: string;
  username?: string;
  full_text?: string;
  text?: string;
  favorite_count?: number;
  retweet_count?: number;
  reply_count?: number;
  hashtags?: { text: string }[];
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toCamel(raw: TopicResponseRaw, index: number, niche?: string): Topic {
  return {
    id: slugify(raw.title),
    rank: index + 1,
    title: raw.title,
    category: raw.category,
    platforms: raw.platforms ?? ["X"],
    blurb: raw.blurb,
    aiSummary: raw.ai_summary,
    articleUrl: raw.article_url,
    imageUrl: raw.image_url,
    estimatedMentions: raw.estimated_mentions,
    keyDrivers: raw.key_drivers,
    demographic: raw.demographic,
    trendVelocity: raw.trend_velocity,
    sourceCount: raw.source_count ?? 0,
    updatedAt: new Date().toISOString(),
    niche,
  };
}

export async function POST(req: NextRequest) {
  let sbApiKey: string;
  let openaiApiKey: string;
  let niche: string;

  try {
    const body = await req.json();
    sbApiKey = body.sbApiKey;
    openaiApiKey = body.openaiApiKey;
    niche = body.niche ?? "For You";

    if (!sbApiKey || typeof sbApiKey !== "string") {
      return NextResponse.json(
        { error: "ScrapeBadger API key is required." },
        { status: 400 }
      );
    }
    if (!openaiApiKey || typeof openaiApiKey !== "string") {
      return NextResponse.json(
        { error: "OpenAI API key is required." },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const searchQuery = NICHE_SEARCH_QUERIES[niche];
  if (!searchQuery) {
    return NextResponse.json(
      { error: `Unknown niche: ${niche}` },
      { status: 400 }
    );
  }

  try {
    const searchUrl = new URL(
      "https://scrapebadger.com/v1/twitter/tweets/advanced_search"
    );
    searchUrl.searchParams.set("query", searchQuery);
    searchUrl.searchParams.set("query_type", "Top");
    searchUrl.searchParams.set("count", "10");

    const sbRes = await fetch(searchUrl.toString(), {
      headers: {
        "x-api-key": sbApiKey,
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!sbRes.ok) {
      const errBody = await sbRes.text();
      console.error("ScrapeBadger API error:", sbRes.status, errBody);

      if (sbRes.status === 401) {
        return NextResponse.json(
          {
            error:
              "ScrapeBadger API key is invalid. Get one at scrapebadger.com",
          },
          { status: 401 }
        );
      }
      if (sbRes.status === 402) {
        return NextResponse.json(
          {
            error:
              "ScrapeBadger credits exhausted. Top up at scrapebadger.com/dashboard/billing",
          },
          { status: 402 }
        );
      }
      if (sbRes.status === 429) {
        return NextResponse.json(
          {
            error:
              "ScrapeBadger rate limit reached. Wait a moment and try again.",
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        {
          error: `ScrapeBadger API error (${sbRes.status})`,
        },
        { status: sbRes.status }
      );
    }

    const sbData = await sbRes.json();
    const tweets = sbData.data ?? [];

    if (tweets.length === 0) {
      return NextResponse.json({
        topics: [],
      });
    }

    const tweetSummaries = tweets
      .slice(0, 10)
      .map((t: ScrapeBadgerTweet, i: number) => {
        const author = t.user_name ?? t.username ?? "Unknown";
        const text = t.full_text ?? t.text ?? "";
        const likes = t.favorite_count ?? 0;
        const retweets = t.retweet_count ?? 0;
        const replies = t.reply_count ?? 0;
        const hashtags =
          t.hashtags?.map((h) => h.text).join(", ") ?? "";
        return `[Tweet ${i + 1}] Author: ${author}\nText: ${text}\nLikes: ${likes} | Retweets: ${retweets} | Replies: ${replies}\nHashtags: ${hashtags}\n`;
      })
      .join("\n");

    const systemPrompt = `You are a trend analysis assistant. Given real tweets about "${niche}", identify the key trending topics and conversations. For each distinct trend you identify, return a JSON object with these exact fields:
- title: string (short, punchy trend name)
- estimated_mentions: number (total engagement estimate based on tweet metrics provided)
- category: string (one of: "AI", "Healthcare", "Finance", "Fashion", "Entertainment", "Technology", "Politics", "Culture", "Sports", "Business", "Lifestyle")
- blurb: string (2-3 sentence summary of what's happening, MUST be based on the actual tweet content)
- ai_summary: string (longer paragraph with context and analysis of the real tweets)
- key_drivers: string[] (array of 2-4 short tags explaining what's driving this trend, from the tweet content)
- demographic: string (which audience is most engaged with this content)
- trend_velocity: string (one of: "Rapidly growing", "Steady", "Peaking", "Declining")
- article_url: string (URL from the tweet if it contains a link, otherwise "")
- image_url: string (image from the tweet if available, otherwise "")

Return the trends as a JSON array. Group related tweets into the same trend. Return up to 10 trends, fewer if tweets cover the same topic. Base EVERYTHING on the actual tweet data provided — do not make up information. Return ONLY a valid JSON array, no other text.`;

    const gptRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Here are the latest real tweets about "${niche}". Analyze them and identify the key trending topics:\n\n${tweetSummaries}`,
            },
          ],
          max_tokens: 4096,
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!gptRes.ok) {
      const errBody = await gptRes.text();
      console.error("OpenAI enrichment error:", gptRes.status, errBody);

      if (gptRes.status === 401) {
        return NextResponse.json(
          {
            error:
              "Your OpenAI API key looks invalid. Check it at platform.openai.com/api-keys",
          },
          { status: 401 }
        );
      }
      if (gptRes.status === 429) {
        return NextResponse.json(
          {
            error:
              "OpenAI rate limited. Check your usage limits and try again.",
          },
          { status: 429 }
        );
      }
      if (gptRes.status === 402) {
        return NextResponse.json(
          {
            error:
              "OpenAI account has insufficient credits. Add billing.",
          },
          { status: 402 }
        );
      }
      return NextResponse.json(
        { error: `OpenAI API error (${gptRes.status})` },
        { status: gptRes.status }
      );
    }

    const gptData = await gptRes.json();
    const content = gptData.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Failed to analyze trends. Try again." },
        { status: 500 }
      );
    }

    const jsonStr = content.replace(/```json\s*|\s*```/g, "").trim();
    const raw: TopicResponseRaw[] = JSON.parse(jsonStr);

    if (!Array.isArray(raw)) {
      return NextResponse.json(
        { error: "Failed to analyze trends. Try again." },
        { status: 500 }
      );
    }

    const sorted = [...raw].sort(
      (a, b) => b.estimated_mentions - a.estimated_mentions
    );
    const topics = sorted.map((t, i) => toCamel(t, i, niche));

    return NextResponse.json({ topics });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse trend data. Try again." },
        { status: 500 }
      );
    }
    if (err instanceof DOMException && err.name === "AbortError") {
      return NextResponse.json(
        {
          error:
            "Request timed out. ScrapeBadger or OpenAI took too long.",
        },
        { status: 504 }
      );
    }
    console.error("ScrapeBadger trends error:", err);
    return NextResponse.json(
      { error: "Network error. Check your connection and try again." },
      { status: 500 }
    );
  }
}
