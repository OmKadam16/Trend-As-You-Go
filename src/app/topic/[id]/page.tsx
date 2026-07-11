"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTopics } from "@/context/TopicsContext";
import type { ContentIdea } from "@/types";
import {
  ArrowLeft,
  ExternalLink,
  TrendingUp,
  Users,
  Zap,
  Lightbulb,
  RefreshCw,
} from "lucide-react";

export default function TopicDetailPage() {
  const params = useParams();
  const { topics, searchResults } = useTopics();
  const topic = topics.find((t) => t.id === params.id) ?? searchResults.find((t) => t.id === params.id);

  const [ideas, setIdeas] = useState<ContentIdea[] | null>(null);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [ideasError, setIdeasError] = useState<string | null>(null);

  const fetchIdeas = async () => {
    if (!topic) return;
    const apiKey = localStorage.getItem("openai-key");
    if (!apiKey) {
      setIdeasError("No API key found. Go to Settings to add one.");
      return;
    }
    setIdeasLoading(true);
    setIdeasError(null);
    try {
      const res = await fetch("/api/content-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          topic: {
            title: topic.title,
            blurb: topic.blurb,
            aiSummary: topic.aiSummary,
            category: topic.category,
            keyDrivers: topic.keyDrivers,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setIdeasError(data.error || "Failed to generate ideas.");
        return;
      }
      setIdeas(data.ideas || []);
    } catch {
      setIdeasError("Network error. Check your connection and try again.");
    } finally {
      setIdeasLoading(false);
    }
  };

  if (!topic) {
    return (
      <div className="flex flex-col items-center justify-center px-6 pt-24 text-center">
        <div className="w-16 h-16 rounded-full bg-[#CCFF33]/10 flex items-center justify-center mb-5">
          <TrendingUp className="w-7 h-7 text-[#CCFF33]" />
        </div>
        <h2 className="text-white text-lg font-bold mb-2">
          Topic not found
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-6">
          Go back to the feed to view this topic.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#CCFF33] text-[#0a0a0a] font-bold text-sm px-6 py-3 rounded-full hover:brightness-110 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs font-bold tracking-wider">
          TRENDS AS YOU GO
        </span>
      </Link>

      <div className="mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#CCFF33] border-b border-[#CCFF33]/30 pb-0.5">
          {topic.category}
        </span>
      </div>

      <h1 className="text-white text-2xl font-black leading-tight mb-4">
        {topic.title}
      </h1>

      <div className="w-full aspect-video rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-6 overflow-hidden">
        {topic.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={topic.imageUrl}
            alt={topic.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <TrendingUp className="w-10 h-10 text-gray-600" />
        )}
      </div>

      <section className="mb-6">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">
          AI INTELLIGENCE SUMMARY
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          {topic.aiSummary}
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">
          X SIGNAL
        </h3>
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <p className="text-[#CCFF33] text-3xl font-black">
            {(topic.estimatedMentions / 1000).toFixed(1)}K
          </p>
          <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mt-0.5">
            ESTIMATED MENTIONS
          </p>
          <div className="w-12 h-0.5 bg-[#CCFF33] mt-2" />
        </div>
      </section>

      <section className="mb-6">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">
          KEY DRIVERS
        </h3>
        <div className="flex flex-wrap gap-2">
          {topic.keyDrivers.map((driver) => (
            <span
              key={driver}
              className="text-xs font-medium bg-white/[0.05] text-gray-300 px-3 py-1.5 rounded-full"
            >
              {driver}
            </span>
          ))}
        </div>
      </section>

      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <Users className="w-4 h-4 text-gray-600" />
          <div>
            <p className="text-white text-sm font-semibold">
              {topic.demographic}
            </p>
            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">
              DEMOGRAPHIC
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <Zap className="w-4 h-4 text-[#CCFF33]" />
          <div>
            <p className="text-[#CCFF33] text-sm font-semibold">
              {topic.trendVelocity}
            </p>
            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">
              TREND VELOCITY
            </p>
          </div>
        </div>
      </div>

      {!ideas && !ideasLoading && !ideasError && (
        <button
          onClick={fetchIdeas}
          className="w-full flex items-center justify-center gap-2 bg-[#CCFF33] text-[#0a0a0a] font-bold text-sm py-3.5 rounded-xl hover:brightness-110 transition-all mb-2"
        >
          <Lightbulb className="w-4 h-4" />
          FIND CONTENT IDEAS
        </button>
      )}

      {ideasLoading && (
        <div className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-white/[0.05] mb-2">
          <RefreshCw className="w-4 h-4 text-[#CCFF33] animate-spin" />
          <span className="text-gray-400 text-sm font-medium">
            Generating ideas...
          </span>
        </div>
      )}

      {ideasError && (
        <div className="mb-4">
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-2">
            <p className="text-red-400 text-xs font-medium">
              {ideasError}
            </p>
          </div>
          <button
            onClick={fetchIdeas}
            className="w-full flex items-center justify-center gap-2 bg-[#CCFF33] text-[#0a0a0a] font-bold text-sm py-3.5 rounded-xl hover:brightness-110 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            TRY AGAIN
          </button>
        </div>
      )}

      {ideas && (
        <section className="mb-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#CCFF33] mb-3">
            {ideas.length} CONTENT IDEAS
          </h3>
          <div className="space-y-0">
            {ideas.map((idea, i) => (
              <div
                key={i}
                className="py-3 border-b border-white/[0.06] last:border-b-0"
              >
                <div className="flex items-start gap-3">
                  <span className="text-[#CCFF33] text-xs font-black leading-none min-w-[1.2rem] pt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-white text-sm font-bold leading-snug mb-0.5">
                      {idea.title}
                    </p>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      {idea.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={fetchIdeas}
            disabled={ideasLoading}
            className="mt-3 text-gray-600 text-xs hover:text-gray-400 transition-colors underline underline-offset-2"
          >
            Regenerate ideas
          </button>
        </section>
      )}

      {topic.articleUrl && (
        <a
          href={topic.articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-gray-600 text-xs hover:text-gray-400 transition-colors mb-4"
        >
          <ExternalLink className="w-3 h-3" />
          Source
        </a>
      )}

      <p className="text-center text-gray-600 text-xs mt-4">
        Referencing {topic.sourceCount} sources across X.
      </p>
    </div>
  );
}
