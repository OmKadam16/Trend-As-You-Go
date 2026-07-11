"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useTopics } from "@/context/TopicsContext";
import Header from "@/components/Header";
import type { Topic } from "@/types";
import {
  Compass,
  ChevronRight,
  X,
  RefreshCw,
} from "lucide-react";

export default function SearchPage() {
  const { topics, setSearchResults } = useTopics();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim()) {
      setDebouncedQuery("");
      setResults([]);
      setError(null);
      return;
    }
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery) return;
    const apiKey = localStorage.getItem("openai-key");
    if (!apiKey) {
      setError("No API key found. Go to Settings to add one.");
      return;
    }
    setLoading(true);
    setError(null);
    fetch("/api/search-topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey, query: debouncedQuery }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Search failed.");
          setResults([]);
          return;
        }
        const sorted = (data.topics || []).sort(
          (a: Topic, b: Topic) => a.rank - b.rank
        );
        setResults(sorted);
        setSearchResults(sorted);
      })
      .catch(() => {
        setError("Network error. Check your connection and try again.");
        setResults([]);
      })
      .finally(() => setLoading(false));
  }, [debouncedQuery, setSearchResults]);

  const quickTopics = useMemo(() => {
    const all = topics.flatMap((t) => t.keyDrivers);
    return Array.from(new Set(all)).slice(0, 15);
  }, [topics]);

  const popularNow = topics.slice(0, 6);

  return (
    <>
      <Header />
      <div className="px-4 pt-3 pb-4">
        <div className="relative mb-5">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics..."
            className="w-full bg-white/[0.05] border border-white/10 text-white text-sm rounded-xl px-4 py-3 pl-10 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#CCFF33] focus:border-transparent transition-all"
          />
          <Compass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {!query ? (
          <>
            <div className="flex flex-col items-center justify-center pt-8 pb-10 text-center">
              <div className="w-16 h-16 rounded-full bg-[#CCFF33]/10 flex items-center justify-center mb-4">
                <Compass className="w-7 h-7 text-[#CCFF33]" />
              </div>
              <h2 className="text-white text-lg font-bold mb-1">
                Discover What&apos;s Next
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Search any topic to see what&apos;s trending across the
                global ecosystem.
              </p>
            </div>

            {topics.length > 0 && (
              <>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3">
                  POPULAR NOW
                </h3>
                <div className="space-y-1 mb-6">
                  {popularNow.map((t) => (
                    <Link
                      key={t.id}
                      href={`/topic/${t.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                        <Compass className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">
                          {t.title}
                        </p>
                        <p className="text-gray-600 text-xs">
                          {t.category} &middot;{" "}
                          {(t.estimatedMentions / 1000).toFixed(1)}K
                          mentions
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    </Link>
                  ))}
                </div>

                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3">
                  QUICK TOPICS
                </h3>
                <div className="flex flex-wrap gap-2">
                  {quickTopics.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="text-xs font-medium bg-white/[0.05] text-gray-300 px-3 py-1.5 rounded-full hover:bg-white/[0.1] hover:text-white transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {loading && (
              <div className="flex items-center justify-center gap-2 py-8">
                <RefreshCw className="w-4 h-4 text-[#CCFF33] animate-spin" />
                <span className="text-gray-500 text-xs font-medium">
                  Searching...
                </span>
              </div>
            )}

            {error && !loading && (
              <div className="flex flex-col items-center justify-center pt-8 text-center">
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-3 max-w-xs">
                  <p className="text-red-400 text-xs font-medium">
                    {error}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (debouncedQuery) {
                      const key = localStorage.getItem("openai-key");
                      if (key) {
                        setLoading(true);
                        setError(null);
                        fetch("/api/search-topics", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            apiKey: key,
                            query: debouncedQuery,
                          }),
                        })
                          .then(async (res) => {
                            const data = await res.json();
                            if (!res.ok) {
                              setError(data.error || "Search failed.");
                              return;
                            }
                            const sorted = (data.topics || []).sort(
                              (a: Topic, b: Topic) => a.rank - b.rank
                            );
                            setResults(sorted);
                            setSearchResults(sorted);
                          })
                          .catch(() => {
                            setError(
                              "Network error. Check your connection."
                            );
                          })
                          .finally(() => setLoading(false));
                      }
                    }
                  }}
                  className="text-xs font-medium text-[#CCFF33] underline underline-offset-2"
                >
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && results.length > 0 && (
              <div className="space-y-1">
                <p className="text-gray-600 text-xs font-medium mb-2">
                  {results.length} result
                  {results.length !== 1 && "s"}
                </p>
                {results.map((t) => (
                  <Link
                    key={t.id}
                    href={`/topic/${t.id}`}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white px-2 py-0.5 rounded-full">
                          X
                        </span>
                        <span className="text-[10px] font-medium text-gray-600 uppercase">
                          {t.category}
                        </span>
                      </div>
                      <p className="text-white text-sm font-semibold">
                        {t.title}
                      </p>
                      <p className="text-gray-400 text-xs leading-relaxed line-clamp-1 mt-0.5">
                        {t.blurb}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!loading && !error && results.length === 0 && !debouncedQuery && (
              <div className="flex flex-col items-center justify-center pt-12 text-center">
                <p className="text-gray-500 text-sm">
                  Start typing to search...
                </p>
              </div>
            )}

            {!loading && !error && results.length === 0 && debouncedQuery && (
              <div className="flex flex-col items-center justify-center pt-12 text-center">
                <p className="text-gray-500 text-sm">
                  No trends found for &ldquo;{debouncedQuery}&rdquo;
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  Try a different search.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
