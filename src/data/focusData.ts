export interface FocusPick {
  id: string;
  title: string;
  year: number;
  type: "movie" | "series";
  platform: string;
  platformColor: string;
  mood_tags: string[];
  runtime: string;
  imdb_score: number;
  description: string;
  why_this: string;
  posterGradient: string;
  posterGlow: string;
  thumbnailUrl?: string;
  logoUrl?: string;
}

/** Dummy picks — always shown in Focus mode (no API key required) */
export const FOCUS_PICKS: FocusPick[] = [
  {
    id: "f0",
    title: "Knives Out",
    year: 2019,
    type: "movie",
    platform: "Netflix",
    platformColor: "#E50914",
    mood_tags: ["Tense & gripping", "Something funny"],
    runtime: "2h 10m",
    imdb_score: 7.9,
    description:
      "When renowned crime novelist Harlan Thrombey is found dead after his 85th birthday party, detective Benoit Blanc is mysteriously enlisted to investigate. A sharp, witty whodunit that keeps you guessing until the final frame.",
    why_this:
      "The perfect 'one more scene' movie — clever, funny, and impossible to step away from once it starts.",
    posterGradient:
      "linear-gradient(155deg, #080604 0%, #1e1208 18%, #4a2c10 34%, #7a4e28 48%, #b07840 58%, #7a5530 72%, #2e1a08 88%, #080604 100%)",
    posterGlow:
      "radial-gradient(ellipse 75% 60% at 50% 42%, rgba(176,120,64,0.72) 0%, rgba(120,80,40,0.45) 44%, rgba(50,25,8,0.2) 72%, transparent 100%)",
    thumbnailUrl: "/knives-out-thumbnail.jpg",
    logoUrl: "/knives-out-logo.png.webp",
  },
  {
    id: "f1",
    title: "Severance",
    year: 2022,
    type: "series",
    platform: "Apple TV+",
    platformColor: "#a0a0a0",
    mood_tags: ["Tense & gripping", "Mind-bending"],
    runtime: "~50 min/ep",
    imdb_score: 8.7,
    description:
      "Employees at Lumon Industries undergo a surgical procedure that separates their work and personal memories. When one employee begins questioning the company's motives, the line between inside and outside starts to blur in terrifying ways.",
    why_this:
      "Perfect tense watch — each episode ends on a cliffhanger that makes stopping feel impossible.",
    // Electric teal → deep indigo → icy cyan — cold corporate nightmare
    posterGradient:
      "linear-gradient(155deg, #00050f 0%, #001555 15%, #0038b8 32%, #0090e0 48%, #00c8f0 58%, #0060c8 74%, #001040 88%, #00050f 100%)",
    posterGlow:
      "radial-gradient(ellipse 78% 65% at 46% 40%, rgba(0,200,255,0.82) 0%, rgba(0,100,220,0.55) 42%, rgba(0,30,120,0.2) 72%, transparent 100%)",
  },
  {
    id: "f2",
    title: "Everything Everywhere All at Once",
    year: 2022,
    type: "movie",
    platform: "Max",
    platformColor: "#702BE2",
    mood_tags: ["Feel inspired", "Something funny"],
    runtime: "2h 19m",
    imdb_score: 8.0,
    description:
      "A Chinese-American laundromat owner discovers she must connect with parallel universe versions of herself to prevent a powerful being from destroying the multiverse. Part sci-fi chaos, part family drama, part existential comedy.",
    why_this:
      "Wildly creative and emotionally devastating — the rare film that's genuinely unlike anything else.",
    // Hot magenta → electric violet → neon cyan — multiverse chaos
    posterGradient:
      "linear-gradient(155deg, #0a0018 0%, #4400c0 16%, #a800e0 30%, #ff00cc 44%, #ff4080 54%, #8000ff 67%, #0090c0 82%, #0a0018 100%)",
    posterGlow:
      "radial-gradient(ellipse 82% 68% at 50% 42%, rgba(255,0,200,0.78) 0%, rgba(160,0,255,0.5) 38%, rgba(0,150,220,0.25) 68%, transparent 100%)",
  },
  {
    id: "f3",
    title: "The Bear",
    year: 2022,
    type: "series",
    platform: "Hulu",
    platformColor: "#1CE783",
    mood_tags: ["Tense & gripping", "Feel inspired"],
    runtime: "~30 min/ep",
    imdb_score: 8.7,
    description:
      "A Michelin-starred chef returns to Chicago to run his family's chaotic sandwich shop after a tragedy. A portrait of grief, ambition, and the relentless pursuit of excellence set inside a claustrophobically intense kitchen.",
    why_this:
      "Short episodes, electric energy — you'll watch four before you realize an hour has passed.",
    // Blazing amber → blood orange → molten red — kitchen fire
    posterGradient:
      "linear-gradient(155deg, #180200 0%, #7a0800 16%, #d82000 30%, #ff5500 44%, #ffaa00 54%, #e03000 68%, #6a0500 84%, #180200 100%)",
    posterGlow:
      "radial-gradient(ellipse 80% 65% at 48% 40%, rgba(255,160,0,0.85) 0%, rgba(240,60,0,0.58) 40%, rgba(140,0,0,0.22) 72%, transparent 100%)",
  },
  {
    id: "f4",
    title: "Poor Things",
    year: 2023,
    type: "movie",
    platform: "Hulu",
    platformColor: "#1CE783",
    mood_tags: ["Feel inspired", "Something funny"],
    runtime: "2h 21m",
    imdb_score: 8.0,
    description:
      "A young woman brought back to life by an eccentric surgeon escapes on a journey across Victorian Europe, discovering her own agency along the way. A visually stunning, darkly funny feminist fairy tale that looks unlike any film made before it.",
    why_this:
      "The production design alone is worth it — a film that genuinely surprises from first frame to last.",
    // Vivid fuchsia → deep amethyst → cerulean — Victorian surrealism
    posterGradient:
      "linear-gradient(155deg, #0e0020 0%, #5500a8 16%, #b020c8 30%, #e858c0 44%, #ff80a0 54%, #9040e0 68%, #0070b0 83%, #0e0020 100%)",
    posterGlow:
      "radial-gradient(ellipse 80% 66% at 52% 40%, rgba(240,80,220,0.78) 0%, rgba(140,40,220,0.5) 40%, rgba(0,100,180,0.22) 70%, transparent 100%)",
  },
];

export const PLATFORM_COLORS: Record<string, string> = {
  Netflix: "#E50914",
  "Prime Video": "#00A8E1",
  "Disney+": "#1A6EE5",
  Max: "#702BE2",
  Hulu: "#1CE783",
  "Apple TV+": "#a8a8a8",
};

export const AUDIENCE_OPTIONS = [
  { value: "any", label: "Any", icon: "Star" },
  { value: "Solo", label: "Solo", icon: "User" },
  { value: "Date night", label: "Date night", icon: "Heart" },
  { value: "Friends", label: "Friends", icon: "Users" },
  { value: "Family", label: "Family", icon: "UsersThree" },
];

export const MOOD_OPTIONS = [
  { value: "any", label: "Any", icon: "Star" },
  { value: "Cozy", label: "Cozy", icon: "Coffee" },
  { value: "Tense & gripping", label: "Tense & gripping", icon: "Lightning" },
  { value: "Want to cry", label: "Want to cry", icon: "Drop" },
  { value: "Turn brain off", label: "Turn brain off", icon: "Television" },
  { value: "Feel inspired", label: "Feel inspired", icon: "Sparkle" },
  { value: "Something funny", label: "Something funny", icon: "Smiley" },
];

export const TIME_OPTIONS = [
  { value: "any", label: "Any", icon: "Star" },
  { value: "Under 45 min", label: "Under 45 min", icon: "Lightning" },
  { value: "~90 min", label: "~90 min", icon: "Clock" },
  { value: "~2 hours", label: "~2 hours", icon: "Clock" },
  { value: "All night", label: "All night", icon: "Moon" },
];

export const AVOID_OPTIONS = [
  { value: "horror", label: "No horror" },
  { value: "subtitles", label: "No subtitles" },
  { value: "documentaries", label: "No docs" },
  { value: "long episodes", label: "No long eps" },
  { value: "sequels", label: "No sequels" },
];
