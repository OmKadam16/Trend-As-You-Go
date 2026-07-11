export const NICHE_OPTIONS = [
  "For You",
  "AI",
  "Healthcare",
  "College",
  "Finance",
  "Fitness",
  "Entertainment",
  "Business",
  "Gaming",
] as const;

export type Niche = (typeof NICHE_OPTIONS)[number];
