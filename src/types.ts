export type Provider = "Netflix" | "Prime" | "Disney+" | "HBO Max" | "Apple TV+" | "Hulu";

export type ProviderStatus = "subscribed" | "free" | "unavailable";

export interface UserProviderAccess {
  subscribed: Provider[];
  freeWithoutSubscription: Provider[];
}

export type Mood =
  | "light"
  | "intense"
  | "feel-good"
  | "thoughtful"
  | "funny"
  | "scary"
  | "romantic";

export type Genre =
  | "comedy"
  | "drama"
  | "thriller"
  | "action"
  | "romance"
  | "sci-fi"
  | "horror"
  | "documentary"
  | "animation"
  | "fantasy";

export interface Title {
  id: string;
  title: string;
  genres: Genre[];
  moods: Mood[];
  runtime: number;
  year: number;
  providers: Provider[];
  popularity: number;
  synopsis: string;
  posterHue: string;
  thumbnailUrl?: string;
}

export interface Filters {
  mood: Mood | null;
  maxRuntime: number | null;
  genre: Genre | null;
  query: string;
}

export interface RankedTitle {
  title: Title;
  score: number;
  reason: string;
}

export const PROVIDERS: Provider[] = ["Netflix", "Prime", "Disney+", "HBO Max", "Apple TV+", "Hulu"];

export const PROVIDER_COLORS: Record<Provider, string> = {
  Netflix: "#E50914",
  Prime: "#00A8E1",
  "Disney+": "#113CCF",
  "HBO Max": "#5822B4",
  "Apple TV+": "#555555",
  Hulu: "#1CE783",
};

export const PROVIDER_LOGOS: Record<Provider, string> = {
  Netflix: "N",
  Prime: "prime",
  "Disney+": "D+",
  "HBO Max": "max",
  "Apple TV+": "tv+",
  Hulu: "hulu",
};

export const MOODS: { id: Mood; label: string; emoji: string }[] = [
  { id: "light", label: "Light & easy", emoji: "☀️" },
  { id: "intense", label: "Intense", emoji: "⚡" },
  { id: "feel-good", label: "Feel-good", emoji: "💛" },
  { id: "thoughtful", label: "Thoughtful", emoji: "🧠" },
  { id: "funny", label: "Funny", emoji: "😂" },
  { id: "scary", label: "Scary", emoji: "👻" },
  { id: "romantic", label: "Romantic", emoji: "💕" },
];

export const RUNTIME_OPTIONS: { id: number | null; label: string }[] = [
  { id: 90, label: "Under 90 min" },
  { id: 120, label: "Under 2 hours" },
  { id: null, label: "Any length" },
];

export const GENRES: Genre[] = [
  "comedy",
  "drama",
  "thriller",
  "action",
  "romance",
  "sci-fi",
  "horror",
  "documentary",
  "animation",
  "fantasy",
];
