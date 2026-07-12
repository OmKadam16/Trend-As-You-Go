"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { Topic } from "@/types";
import { NICHE_OPTIONS, Niche } from "@/config/niches";

type TopicsContextType = {
  topics: Topic[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  niche: Niche;
  setNiche: (niche: Niche) => void;
  refreshTopics: (apiKey: string, niche?: Niche) => Promise<void>;
  refreshScrapebadgerTrends: (
    sbApiKey: string,
    openaiApiKey: string,
    niche?: Niche
  ) => Promise<void>;
  hasCachedData: (niche: Niche) => boolean;
  searchResults: Topic[];
  setSearchResults: (topics: Topic[]) => void;
};

const TopicsContext = createContext<TopicsContextType | undefined>(undefined);

export function TopicsProvider({ children }: { children: ReactNode }) {
  const [topicsByNiche, setTopicsByNiche] = useState<
    Record<string, Topic[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [niche, setNiche] = useState<Niche>("For You");
  const [searchResults, setSearchResults] = useState<Topic[]>([]);

  const topics = useMemo(() => {
    if (niche === "For You") {
      const all = Object.values(topicsByNiche).flat();
      return all.sort((a, b) => a.rank - b.rank);
    }
    return topicsByNiche[niche] ?? [];
  }, [niche, topicsByNiche]);

  const hasCachedData = useCallback(
    (n: Niche) => {
      if (n === "For You") {
        return Object.keys(topicsByNiche).length > 0;
      }
      return n in topicsByNiche;
    },
    [topicsByNiche]
  );

  const storeTopics = useCallback(
    (incoming: Topic[], n: string) => {
      setTopicsByNiche((prev) => ({
        ...prev,
        [n]: incoming,
      }));
      setLastUpdated(new Date());
    },
    []
  );

  const fetchAllNiches = useCallback(
    async (sbApiKey: string, openaiApiKey: string) => {
      setLoading(true);
      setError(null);
      let hasError = false;
      for (const n of NICHE_OPTIONS) {
        if (n === "For You") continue;
        try {
          const res = await fetch("/api/scrapebadger-trends", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sbApiKey,
              openaiApiKey,
              niche: n,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            setError(data.error || `Failed to fetch ${n} trends`);
            hasError = true;
            continue;
          }
          const sorted = (data.topics || []).sort(
            (a: Topic, b: Topic) => a.rank - b.rank
          );
          storeTopics(sorted, n);
        } catch {
          setError(`Network error fetching ${n}. Check your connection.`);
          hasError = true;
        }
      }
      setLoading(false);
      if (!hasError) setError(null);
    },
    [storeTopics]
  );

  const refreshTopics = useCallback(
    async (apiKey: string, niche?: Niche) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/trends", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiKey, niche: niche ?? "For You" }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to fetch trends");
          return;
        }
        const sorted = (data.topics || []).sort(
          (a: Topic, b: Topic) => a.rank - b.rank
        );
        storeTopics(sorted, niche ?? "For You");
      } catch {
        setError("Network error. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    },
    [storeTopics]
  );

  const refreshScrapebadgerTrends = useCallback(
    async (sbApiKey: string, openaiApiKey: string, niche?: Niche) => {
      const targetNiche = niche ?? "For You";

      if (targetNiche === "For You") {
        await fetchAllNiches(sbApiKey, openaiApiKey);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/scrapebadger-trends", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sbApiKey,
            openaiApiKey,
            niche: targetNiche,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to fetch trends");
          return;
        }
        const sorted = (data.topics || []).sort(
          (a: Topic, b: Topic) => a.rank - b.rank
        );
        storeTopics(sorted, targetNiche);
      } catch {
        setError("Network error. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    },
    [storeTopics, fetchAllNiches]
  );

  return (
    <TopicsContext.Provider
      value={{
        topics,
        loading,
        error,
        lastUpdated,
        niche,
        setNiche,
        refreshTopics,
        refreshScrapebadgerTrends,
        hasCachedData,
        searchResults,
        setSearchResults,
      }}
    >
      {children}
    </TopicsContext.Provider>
  );
}

export function useTopics() {
  const ctx = useContext(TopicsContext);
  if (!ctx) throw new Error("useTopics must be used within TopicsProvider");
  return ctx;
}
