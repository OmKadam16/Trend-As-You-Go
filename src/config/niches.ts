export const NICHE_OPTIONS = [
  "For You",
  "AI",
  "Healthcare",
  "Finance",
  "Fashion",
  "Entertainment",
] as const;

export type Niche = (typeof NICHE_OPTIONS)[number];

export const NICHE_SEARCH_QUERIES: Record<string, string> = {
  "For You": "(trending OR viral OR breaking) lang:en min_faves:200",
  AI: "(AI OR \"artificial intelligence\" OR ChatGPT OR \"machine learning\" OR \"deep learning\" OR \"neural network\") lang:en min_faves:100",
  Healthcare: "(healthcare OR \"health\" OR medical OR FDA OR wellness OR \"public health\" OR \"mental health\") lang:en min_faves:100",
  Finance: "(finance OR stock OR crypto OR investing OR \"interest rate\" OR \"stock market\" OR \"bitcoin\" OR \"trading\") lang:en min_faves:100",
  Fashion: "(fashion OR style OR designer OR runway OR luxury OR streetwear OR \"fashion week\" OR \"trend\") lang:en min_faves:100",
  Entertainment: "(movie OR music OR celebrity OR show OR entertainment OR \"Hollywood\" OR \"Netflix\" OR \"box office\") lang:en min_faves:100",
};
