"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Topic } from "@/types";
import { Niche } from "@/config/niches";

type TopicsContextType = {
  topics: Topic[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  niche: Niche;
  setNiche: (niche: Niche) => void;
  refreshTopics: (apiKey: string, niche?: Niche) => Promise<void>;
  searchResults: Topic[];
  setSearchResults: (topics: Topic[]) => void;
};

const TopicsContext = createContext<TopicsContextType | undefined>(undefined);

export function TopicsProvider({ children }: { children: ReactNode }) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [niche, setNiche] = useState<Niche>("For You");
  const [searchResults, setSearchResults] = useState<Topic[]>([]);

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
        setTopics(sorted);
        setLastUpdated(new Date());
      } catch {
        setError("Network error. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    },
    []
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
