"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useTopics } from "@/context/TopicsContext";
import Header from "@/components/Header";
import { NICHE_OPTIONS } from "@/config/niches";
import type { Niche } from "@/config/niches";
import {
  TrendingUp,
  Plus,
  RefreshCw,
} from "lucide-react";

const NICHE_STORAGE_KEY = "selected-niche";

export default function HomePage() {
  const {
    topics,
    loading,
    error,
    lastUpdated,
    setNiche,
    refreshTopics,
    refreshScrapebadgerTrends,
  } = useTopics();
  const [hasOpenaiKey, setHasOpenaiKey] = useState<boolean | null>(null);
  const [hasSbKey, setHasSbKey] = useState(false);
  const [localNiche, setLocalNiche] = useState<Niche>("For You");

  const fetchWithNiche = useCallback(
    (oKey: string, sKey: string, n: Niche) => {
      setNiche(n);
      if (sKey) {
        refreshScrapebadgerTrends(sKey, oKey, n);
      } else {
        refreshTopics(oKey, n);
      }
    },
    [setNiche, refreshTopics, refreshScrapebadgerTrends]
  );

  useEffect(() => {
    const oKey = localStorage.getItem("openai-key");
    const sKey = localStorage.getItem("scrapebadger-key");
    if (oKey) {
      setHasOpenaiKey(true);
      setHasSbKey(!!sKey);
      const savedNiche = localStorage.getItem(NICHE_STORAGE_KEY) as
        | Niche
        | null;
      const activeNiche = savedNiche ?? "For You";
      setLocalNiche(activeNiche);
      if (topics.length === 0) {
        fetchWithNiche(oKey, sKey ?? "", activeNiche);
      }
    } else {
      setHasOpenaiKey(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNicheChange = (n: Niche) => {
    setLocalNiche(n);
    localStorage.setItem(NICHE_STORAGE_KEY, n);
    const oKey = localStorage.getItem("openai-key");
    const sKey = localStorage.getItem("scrapebadger-key");
    if (oKey) fetchWithNiche(oKey, sKey ?? "", n);
  };

  const handleRefresh = () => {
    const oKey = localStorage.getItem("openai-key");
    const sKey = localStorage.getItem("scrapebadger-key");
    if (oKey) fetchWithNiche(oKey, sKey ?? "", localNiche);
  };

  if (hasOpenaiKey === null) return null;

  if (hasOpenaiKey === false) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center px-6 pt-24 text-center">
          <div className="w-16 h-16 rounded-full bg-[#CCFF33]/10 flex items-center justify-center mb-5">
            <TrendingUp className="w-7 h-7 text-[#CCFF33]" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">
            No API Key Yet
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-6">
            Add your OpenAI API key to get started and see what&apos;s
            trending on X right now.
          </p>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 bg-[#CCFF33] text-[#0a0a0a] font-bold text-sm px-6 py-3 rounded-full hover:brightness-110 transition-all"
          >
            Go to Settings
          </Link>
        </div>
      </>
    );
  }

  if (loading && topics.length === 0) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center px-6 pt-24 text-center">
          <RefreshCw className="w-8 h-8 text-[#CCFF33] animate-spin mb-4" />
          <p className="text-gray-400 text-sm">
            Fetching {localNiche !== "For You" ? `${localNiche} ` : ""}
            {hasSbKey ? "trending posts from X..." : "trending topics from X..."}
          </p>
        </div>
      </>
    );
  }

  if (error && topics.length === 0) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center px-6 pt-24 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-5">
            <TrendingUp className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-white text-lg font-bold mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-6">
            {error}
          </p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 bg-[#CCFF33] text-[#0a0a0a] font-bold text-sm px-6 py-3 rounded-full hover:brightness-110 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header timestamp={lastUpdated} />
      <div className="px-4 py-2 overflow-x-auto scrollbar-hide border-b border-white/5">
        <div className="flex gap-2">
          {NICHE_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => handleNicheChange(n)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                localNiche === n
                  ? "bg-[#CCFF33] text-[#0a0a0a]"
                  : "bg-white/[0.05] text-gray-300 border border-white/10 hover:bg-white/[0.1]"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-2 pb-4">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-xs font-medium">{error}</p>
            <button
              onClick={handleRefresh}
              className="text-red-300 text-xs underline mt-1"
            >
              Try again
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-3 mb-2">
            <RefreshCw className="w-4 h-4 text-[#CCFF33] animate-spin" />
            <span className="text-gray-500 text-xs font-medium">
              Refreshing...
            </span>
          </div>
        )}

        {!loading && topics.length === 0 && !error ? (
          <div className="flex flex-col items-center justify-center px-6 pt-12 text-center">
            <TrendingUp className="w-8 h-8 text-gray-600 mb-3" />
            <h3 className="text-white text-sm font-bold mb-1">
              {localNiche !== "For You"
                ? `Not much trending in ${localNiche} right now`
                : "No trends yet"}
            </h3>
            <p className="text-gray-500 text-xs leading-relaxed max-w-xs">
              {localNiche !== "For You"
                ? "Try again later or pick another niche."
                : "Tap the + button to fetch the latest trends."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {topics.map((topic) => (
              <Link
                key={topic.id}
                href={`/topic/${topic.id}`}
                className="block p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-[#CCFF33] text-2xl font-black leading-none min-w-[2rem]">
                    {topic.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white px-2 py-0.5 rounded-full">
                        X
                      </span>
                      <span className="text-[10px] font-medium text-gray-600 uppercase tracking-wider">
                        {topic.category}
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-sm leading-snug mb-1">
                      {topic.title}
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                      {topic.blurb}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleRefresh}
        disabled={loading}
        className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-[#CCFF33] text-[#0a0a0a] flex items-center justify-center shadow-lg shadow-[#CCFF33]/20 hover:brightness-110 transition-all disabled:opacity-50"
      >
        <Plus className="w-6 h-6" />
      </button>
    </>
  );
}
