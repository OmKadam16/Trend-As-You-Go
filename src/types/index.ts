export type ContentIdea = {
  title: string;
  description: string;
};

export type Topic = {
  id: string;
  rank: number;
  title: string;
  category: string;
  platforms: string[];
  blurb: string;
  aiSummary: string;
  articleUrl?: string;
  imageUrl?: string;
  estimatedMentions: number;
  keyDrivers: string[];
  demographic: string;
  trendVelocity: string;
  sourceCount: number;
  updatedAt: string;
};

export type TopicResponseRaw = {
  title: string;
  estimated_mentions: number;
  category: string;
  platforms?: string[];
  blurb: string;
  ai_summary: string;
  key_drivers: string[];
  demographic: string;
  trend_velocity: string;
  article_url?: string;
  image_url?: string;
  source_count?: number;
};
