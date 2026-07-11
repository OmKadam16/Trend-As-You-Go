import { NextRequest, NextResponse } from "next/server";
import { ContentIdea } from "@/types";

export async function POST(req: NextRequest) {
  let apiKey: string;
  let topic: { title: string; blurb: string; aiSummary: string; category: string; keyDrivers: string[] } | undefined;

  try {
    const body = await req.json();
    apiKey = body.apiKey;
    topic = body.topic;
    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { error: "API key is required." },
        { status: 400 }
      );
    }
    if (!topic || !topic.title) {
      return NextResponse.json(
        { error: "Topic data is required." },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const contextBlurb = topic.aiSummary
    ? `${topic.blurb} ${topic.aiSummary}`
    : topic.blurb;

  const prompt = `Based on this trending topic: "${topic.title}" — context: ${contextBlurb}

Generate exactly 5 distinct, specific, actionable video content ideas a creator could film about this topic. Each idea should have a short punchy title (under 10 words) and a 1-2 sentence description of the concept/angle/hook.

Make the 5 ideas meaningfully different from each other. Vary the formats — for example: reaction, tutorial, opinion/hot-take, story-time, comparison, debate, analysis, challenge, listicle, day-in-the-life, behind-the-scenes, or interview style.

Return ONLY a valid JSON array of 5 objects, each with { title: string, description: string }, no other text.`;

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
            {
              role: "system",
              content:
                "You are a creative video content strategist. You generate concrete, original video ideas for creators.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 2048,
          temperature: 0.8,
        }),
        signal: AbortSignal.timeout(30000),
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
              "Your API key looks invalid. Check it in Settings.",
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
              "Insufficient credits. Add billing at platform.openai.com.",
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
            "Something went wrong generating ideas. Try again.",
        },
        { status: 500 }
      );
    }

    const jsonStr = content.replace(/```json\s*|\s*```/g, "").trim();
    const ideas: ContentIdea[] = JSON.parse(jsonStr);

    if (!Array.isArray(ideas) || ideas.length === 0) {
      return NextResponse.json(
        {
          error:
            "Something went wrong generating ideas. Try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ideas });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        {
          error:
            "Something went wrong generating ideas. Try again.",
        },
        { status: 500 }
      );
    }
    console.error("Content ideas API error:", err);
    return NextResponse.json(
      {
        error:
          "Network error or timeout. Check your connection and try again.",
      },
      { status: 500 }
    );
  }
}
