import { NextRequest, NextResponse } from "next/server";
import { Topic, TopicResponseRaw } from "@/types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toCamel(raw: TopicResponseRaw, index: number): Topic {
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
  };
}

function buildPrompt(niche?: string): string {
  const scope =
    !niche || niche === "For You"
      ? "across general culture, tech, and lifestyle"
      : `specifically within the ${niche} niche/industry`;

  return `You are a trend analysis assistant. Identify the top 10-15 topics currently trending on X (Twitter) ${scope}.

For each topic, return a JSON object with these exact fields:
- title: string (the trending topic name)
- estimated_mentions: number (realistic mention count)
- category: string (e.g. "Technology", "Politics", "Entertainment", "Sports", "Business", "Lifestyle", "Culture")
- blurb: string (2-3 sentence summary for a feed card)
- ai_summary: string (longer paragraph with context, key events, and implications)
- key_drivers: string[] (array of 2-4 short tags explaining what's driving the trend)
- demographic: string (which audience segment is most engaged)
- trend_velocity: string (e.g. "Rapidly growing", "Steady", "Peaking", "Declining")
- article_url: string (a URL to a real news article or X post about this topic)

Base your answer on your training data. Return ONLY a valid JSON array of these objects, no other text.`;
}

export async function POST(req: NextRequest) {
  let apiKey: string;
  let niche: string | undefined;

  try {
    const body = await req.json();
    apiKey = body.apiKey;
    niche = body.niche;
    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { error: "API key is required." },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const systemPrompt = buildPrompt(niche);

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `What are the top trending topics on X right now${
                niche && niche !== "For You"
                  ? ` in the ${niche} space`
                  : ""
              }?`,
            },
          ],
          max_tokens: 8192,
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(60000),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error("OpenAI API error:", response.status, errBody);

      if (
        response.status === 401 ||
        errBody.includes("Incorrect API key") ||
        errBody.includes("invalid")
      ) {
        return NextResponse.json(
          {
            error:
              "Your API key looks invalid. Get one at platform.openai.com/api-keys",
          },
          { status: 401 }
        );
      }
      if (response.status === 429) {
        return NextResponse.json(
          {
            error:
              "Rate limited. Check your OpenAI usage limits and try again.",
          },
          { status: 429 }
        );
      }
      if (response.status === 402) {
        return NextResponse.json(
          {
            error:
              "Your account has insufficient credits. Add billing at platform.openai.com.",
          },
          { status: 402 }
        );
      }
      return NextResponse.json(
        {
          error: `OpenAI API error (${response.status})`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        {
          error:
            "Something went wrong parsing trends. Try refreshing.",
        },
        { status: 500 }
      );
    }

    const jsonStr = content.replace(/```json\s*|\s*```/g, "").trim();
    const raw: TopicResponseRaw[] = JSON.parse(jsonStr);

    if (!Array.isArray(raw)) {
      return NextResponse.json(
        {
          error:
            "Something went wrong parsing trends. Try refreshing.",
        },
        { status: 500 }
      );
    }

    const sorted = [...raw].sort(
      (a, b) => b.estimated_mentions - a.estimated_mentions
    );
    const topics = sorted.map((t, i) => toCamel(t, i));

    return NextResponse.json({ topics });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        {
          error:
            "Something went wrong parsing trends. Try refreshing.",
        },
        { status: 500 }
      );
    }
    console.error("Trends API error:", err);
    return NextResponse.json(
      {
        error:
          "Network error or timeout. Check your connection and try again.",
      },
      { status: 500 }
    );
  }
}
