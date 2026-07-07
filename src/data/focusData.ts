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
  posterUrl?: string;
  watchPlatforms?: string[];
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
      "When renowned crime novelist Harlan Thrombey is found dead at his estate just after his 85th birthday, the inquisitive and debonair Detective Benoit Blanc is mysteriously enlisted to investigate.",
    why_this:
      "The perfect 'one more scene' movie — clever, funny, and impossible to step away from once it starts.",
    posterGradient:
      "linear-gradient(155deg, #080604 0%, #1e1208 18%, #4a2c10 34%, #7a4e28 48%, #b07840 58%, #7a5530 72%, #2e1a08 88%, #080604 100%)",
    posterGlow:
      "radial-gradient(ellipse 75% 60% at 50% 42%, rgba(176,120,64,0.72) 0%, rgba(120,80,40,0.45) 44%, rgba(50,25,8,0.2) 72%, transparent 100%)",
    thumbnailUrl: "/knives-out-thumbnail.jpg",
    logoUrl: "/knives-out-logo.png.webp",
    posterUrl: "/knives-out-poster.jpg",
    watchPlatforms: ["Prime Video", "Apple TV+"],
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
      "Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives. When a mysterious colleague appears outside of work, it begins a journey to discover the truth about their jobs.",
    why_this:
      "Perfect tense watch — each episode ends on a cliffhanger that makes stopping feel impossible.",
    // Sage-grey corporate cool → deep slate → cold off-white — Lumon sterility
    posterGradient:
      "linear-gradient(155deg, #05080a 0%, #0d1a1e 16%, #1a3038 30%, #2a4a50 44%, #8aacaa 56%, #3a6060 70%, #102020 84%, #05080a 100%)",
    posterGlow:
      "radial-gradient(ellipse 76% 62% at 48% 38%, rgba(138,172,170,0.68) 0%, rgba(58,96,96,0.42) 44%, rgba(16,32,32,0.18) 72%, transparent 100%)",
    thumbnailUrl: "/severance-thumbnail.jpg",
    logoUrl: "/severance-logo.png",
    posterUrl: "/severance-poster.webp",
    watchPlatforms: ["Apple TV+"],
  },
  {
    id: "f2",
    title: "Everything Everywhere All at Once",
    year: 2022,
    type: "movie",
    platform: "Prime Video",
    platformColor: "#00A8E1",
    mood_tags: ["Feel inspired", "Something funny"],
    runtime: "2h 19m",
    imdb_score: 8.0,
    description:
      "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes and connecting with the lives she could have led.",
    why_this:
      "Wildly creative and emotionally devastating — the rare film that's genuinely unlike anything else.",
    // Hot magenta → electric violet → neon cyan — multiverse chaos
    posterGradient:
      "linear-gradient(155deg, #0a0018 0%, #4400c0 16%, #a800e0 30%, #ff00cc 44%, #ff4080 54%, #8000ff 67%, #0090c0 82%, #0a0018 100%)",
    posterGlow:
      "radial-gradient(ellipse 82% 68% at 50% 42%, rgba(255,0,200,0.78) 0%, rgba(160,0,255,0.5) 38%, rgba(0,150,220,0.25) 68%, transparent 100%)",
    thumbnailUrl: "/eeaao-thumbnail.webp",
    logoUrl: "/eeaao-logo.png",
    posterUrl: "/eeaao-poster.jpg",
    watchPlatforms: ["Prime Video"],
  },
  {
    id: "f3",
    title: "The Sheep Detectives",
    year: 2025,
    type: "movie",
    platform: "Peacock",
    platformColor: "#000000",
    mood_tags: ["Something funny", "Cozy"],
    runtime: "1h 38m",
    imdb_score: 6.9,
    description:
      "Every night a shepherd reads aloud a murder mystery, pretending his sheep can understand. When he is found dead, the sheep realize at once that it was a murder and think they know everything about how to go about solving it.",
    why_this:
      "A wonderfully absurd comedy that commits completely to its premise — by the end you'll be rooting for the sheep just as hard as any detective.",
    // Sky blue → lush pastoral green → warm earth — sunlit English countryside
    posterGradient:
      "linear-gradient(155deg, #030810 0%, #0a2030 16%, #184838 30%, #2a7840 44%, #58b050 54%, #389838 68%, #152a10 84%, #030810 100%)",
    posterGlow:
      "radial-gradient(ellipse 78% 64% at 50% 42%, rgba(88,176,80,0.70) 0%, rgba(56,152,56,0.44) 44%, rgba(21,42,16,0.18) 72%, transparent 100%)",
    thumbnailUrl: "/sheep-detectives-thumbnail.jpg",
    logoUrl: "/sheep-detectives-logo.png",
    posterUrl: "/sheep-detectives-poster.jpg",
    watchPlatforms: ["Peacock"],
  },
  {
    id: "f4",
    title: "Baby Driver",
    year: 2017,
    type: "movie",
    platform: "Netflix",
    platformColor: "#E50914",
    mood_tags: ["Tense & gripping", "Turn brain off"],
    runtime: "1h 53m",
    imdb_score: 7.6,
    description:
      "Coerced into working for a crime boss, a young getaway driver must face the music when a doomed heist threatens his life, love, and freedom.",
    why_this:
      "Edgar Wright choreographs action to music so precisely that every chase scene plays like a music video — pure style that never loses the plot.",
    // Hot magenta → deep rose → dark — graphic poster energy
    posterGradient:
      "linear-gradient(155deg, #0e0008 0%, #480020 16%, #900038 30%, #d40060 44%, #ff3090 54%, #c80060 68%, #500028 84%, #0e0008 100%)",
    posterGlow:
      "radial-gradient(ellipse 76% 62% at 50% 44%, rgba(255,48,144,0.82) 0%, rgba(200,0,96,0.54) 42%, rgba(80,0,40,0.22) 72%, transparent 100%)",
    thumbnailUrl: "/baby-driver-thumbnail.jpg",
    logoUrl: "/baby-driver-logo.png",
    posterUrl: "/baby-driver-poster.jpg",
    watchPlatforms: ["Netflix", "Prime Video"],
  },
  {
    id: "f5",
    title: "The Sixth Sense",
    year: 1999,
    type: "movie",
    platform: "Disney+",
    platformColor: "#1A6EE5",
    mood_tags: ["Tense & gripping"],
    runtime: "1h 47m",
    imdb_score: 8.1,
    description:
      "After being shot by a resentful former patient whom he failed to help, a Philadelphia child psychologist seeks redemption by treating a young boy with a disturbing secret.",
    why_this:
      "One of the rare twist endings that makes the whole film more rewatchable — once you know, you'll catch everything you missed the first time.",
    // Deep amber → burnt orange → dark shadow — glowing dread
    posterGradient:
      "linear-gradient(155deg, #060200 0%, #200800 16%, #501200 30%, #902800 44%, #c85010 54%, #803008 68%, #280a00 84%, #060200 100%)",
    posterGlow:
      "radial-gradient(ellipse 72% 62% at 56% 44%, rgba(200,80,16,0.80) 0%, rgba(160,40,0,0.52) 44%, rgba(60,12,0,0.22) 72%, transparent 100%)",
    thumbnailUrl: "/sixth-sense-thumbnail.avif",
    logoUrl: "/sixth-sense-logo.png",
    posterUrl: "/sixth-sense-poster.jpeg",
    watchPlatforms: ["Disney+"],
  },
  {
    id: "f6",
    title: "The Lovely Bones",
    year: 2009,
    type: "movie",
    platform: "Prime Video",
    platformColor: "#00A8E1",
    mood_tags: ["Want to cry", "Feel inspired"],
    runtime: "2h 14m",
    imdb_score: 6.7,
    description:
      "Centers on a young girl who has been murdered and watches over her family — and her killer — from purgatory. She must weigh her desire for vengeance against her desire for her family to heal.",
    why_this:
      "Peter Jackson at his most visually inventive — a haunting, bittersweet film that earns every emotion it goes for.",
    // Stormy purple → warm peach sunset → dark earth — between-worlds light
    posterGradient:
      "linear-gradient(155deg, #050210 0%, #160a28 16%, #341558 30%, #603880 44%, #b06090 54%, #d0906a 66%, #804840 80%, #1a0818 100%)",
    posterGlow:
      "radial-gradient(ellipse 80% 66% at 54% 38%, rgba(208,144,106,0.76) 0%, rgba(176,96,144,0.48) 42%, rgba(96,56,128,0.22) 70%, transparent 100%)",
    thumbnailUrl: "/lovely-bones-thumbnail.jpg",
    logoUrl: "/lovely-bones-logo.png",
    posterUrl: "/lovely-bones-poster.jpg",
    watchPlatforms: ["Prime Video"],
  },
];

export const PLATFORM_LOGOS: Record<string, string> = {
  "Netflix":     "/netflix-logo.png",
  "Prime Video": "/prime-video-logo.png",
  "Disney+":     "/disney-plus-logo.svg",
  "HBO Max":     "/hbo-max-logo.png",
  "Hulu":        "/hulu-logo.png",
  "Apple TV+":   "/apple-tv-plus-logo.png",
  "Peacock":     "/peacock-logo.png",
  "Tubi":        "/tubi-logo.svg",
};

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

export const GENRE_OPTIONS = [
  { value: "any", label: "Any", icon: "Star" },
  { value: "Comedy", label: "Comedy", icon: "Smiley" },
  { value: "Thriller", label: "Thriller", icon: "Lightning" },
  { value: "Drama", label: "Drama", icon: "Drop" },
  { value: "Romance", label: "Romance", icon: "Heart" },
  { value: "Horror", label: "Horror", icon: "Moon" },
  { value: "Action", label: "Action", icon: "Flame" },
  { value: "Sci-fi", label: "Sci-fi", icon: "Sparkle" },
  { value: "Documentary", label: "Documentary", icon: "Television" },
];

export const FORMAT_TYPE_OPTIONS = [
  { value: "any", label: "Any", icon: "Star" },
  { value: "Movie", label: "Movie", icon: "FilmStrip" },
  { value: "TV Show", label: "TV Show", icon: "Television" },
];

export const MOVIE_LENGTH_OPTIONS = [
  { value: "any", label: "Any", icon: "Star" },
  { value: "Short film", label: "Short film (under 1hr)", icon: "Lightning" },
  { value: "Feature", label: "Feature (1.5–2 hrs)", icon: "Clock" },
  { value: "Long feature", label: "Long feature (2hrs+)", icon: "Moon" },
];

export const SHOW_TYPE_OPTIONS = [
  { value: "any", label: "Any", icon: "Star" },
  { value: "Mini-series", label: "Mini-series", icon: "Clock" },
  { value: "Ongoing series", label: "Ongoing series", icon: "Television" },
];
