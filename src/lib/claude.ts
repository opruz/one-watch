import type { FocusPick } from "../data/focusData";

export interface ClaudeAnswers {
  audience: string;
  genre: string;
  formatType: string;
  formatDetail: string;
}

interface ClaudePick {
  title: string;
  year: number;
  type: "movie" | "series";
  platform: string;
  mood_tags: string[];
  runtime: string;
  imdb_score: number;
  description: string;
  why_this: string;
  youtube_search_query: string;
  tmdb_poster_path: string;
}

// Cinematic gradient themes keyed by platform, then cycling index fallbacks
const GRADIENT_THEMES: Record<string, Pick<FocusPick, "platformColor" | "posterGradient" | "posterGlow">> = {
  Netflix: {
    platformColor: "#E50914",
    posterGradient:
      "linear-gradient(155deg, #180200 0%, #7a0800 16%, #d82000 30%, #ff3000 44%, #ff8000 54%, #c02000 68%, #6a0500 84%, #180200 100%)",
    posterGlow:
      "radial-gradient(ellipse 80% 65% at 48% 40%, rgba(229,9,20,0.8) 0%, rgba(180,0,10,0.5) 42%, rgba(100,0,0,0.2) 72%, transparent 100%)",
  },
  Prime: {
    platformColor: "#00A8E1",
    posterGradient:
      "linear-gradient(155deg, #000e1a 0%, #003060 16%, #0070c0 30%, #00a8e1 44%, #40c8ff 54%, #0088cc 68%, #002050 84%, #000e1a 100%)",
    posterGlow:
      "radial-gradient(ellipse 80% 65% at 48% 40%, rgba(0,168,225,0.8) 0%, rgba(0,100,200,0.5) 42%, rgba(0,40,100,0.2) 72%, transparent 100%)",
  },
  "Prime Video": {
    platformColor: "#00A8E1",
    posterGradient:
      "linear-gradient(155deg, #000e1a 0%, #003060 16%, #0070c0 30%, #00a8e1 44%, #40c8ff 54%, #0088cc 68%, #002050 84%, #000e1a 100%)",
    posterGlow:
      "radial-gradient(ellipse 80% 65% at 48% 40%, rgba(0,168,225,0.8) 0%, rgba(0,100,200,0.5) 42%, rgba(0,40,100,0.2) 72%, transparent 100%)",
  },
  "Disney+": {
    platformColor: "#1A6EE5",
    posterGradient:
      "linear-gradient(155deg, #000828 0%, #001880 16%, #0038c0 30%, #1a6ee5 44%, #60a0ff 54%, #0050d0 68%, #000e50 84%, #000828 100%)",
    posterGlow:
      "radial-gradient(ellipse 80% 65% at 48% 40%, rgba(26,110,229,0.8) 0%, rgba(0,60,180,0.5) 42%, rgba(0,20,80,0.2) 72%, transparent 100%)",
  },
  "HBO Max": {
    platformColor: "#5822B4",
    posterGradient:
      "linear-gradient(155deg, #0e0020 0%, #2a0070 16%, #5000b0 30%, #8040e0 44%, #a878ff 54%, #6020c0 68%, #1e0050 84%, #0e0020 100%)",
    posterGlow:
      "radial-gradient(ellipse 80% 65% at 48% 40%, rgba(88,34,180,0.8) 0%, rgba(60,0,160,0.5) 42%, rgba(20,0,70,0.2) 72%, transparent 100%)",
  },
  Max: {
    platformColor: "#702BE2",
    posterGradient:
      "linear-gradient(155deg, #0e0020 0%, #3a0090 16%, #6800d8 30%, #9040f0 44%, #c080ff 54%, #7820e0 68%, #200060 84%, #0e0020 100%)",
    posterGlow:
      "radial-gradient(ellipse 80% 65% at 48% 40%, rgba(112,43,226,0.8) 0%, rgba(80,0,200,0.5) 42%, rgba(30,0,90,0.2) 72%, transparent 100%)",
  },
  Hulu: {
    platformColor: "#1CE783",
    posterGradient:
      "linear-gradient(155deg, #001a0e 0%, #005030 16%, #009858 30%, #1ce783 44%, #70ffb8 54%, #00c060 68%, #004020 84%, #001a0e 100%)",
    posterGlow:
      "radial-gradient(ellipse 80% 65% at 48% 40%, rgba(28,231,131,0.8) 0%, rgba(0,160,80,0.5) 42%, rgba(0,60,30,0.2) 72%, transparent 100%)",
  },
  "Apple TV+": {
    platformColor: "#a8a8a8",
    posterGradient:
      "linear-gradient(155deg, #0a0a14 0%, #1a1a2e 16%, #282840 30%, #363660 44%, #484870 54%, #282850 68%, #141428 84%, #0a0a14 100%)",
    posterGlow:
      "radial-gradient(ellipse 80% 65% at 48% 40%, rgba(160,160,200,0.6) 0%, rgba(80,80,140,0.35) 42%, rgba(30,30,70,0.15) 72%, transparent 100%)",
  },
};

// Fallback gradients when platform isn't in the map
const FALLBACK_THEMES = [
  {
    platformColor: "#e8c47a",
    posterGradient:
      "linear-gradient(155deg, #10080a 0%, #501830 16%, #903050 30%, #c85070 44%, #e87090 54%, #b04060 68%, #602030 84%, #10080a 100%)",
    posterGlow:
      "radial-gradient(ellipse 80% 65% at 48% 40%, rgba(200,80,112,0.8) 0%, rgba(160,40,80,0.5) 42%, rgba(80,10,30,0.2) 72%, transparent 100%)",
  },
  {
    platformColor: "#e8c47a",
    posterGradient:
      "linear-gradient(155deg, #080a18 0%, #182060 16%, #304090 30%, #5060c0 44%, #7888e0 54%, #405090 68%, #182040 84%, #080a18 100%)",
    posterGlow:
      "radial-gradient(ellipse 80% 65% at 48% 40%, rgba(80,96,192,0.8) 0%, rgba(48,64,144,0.5) 42%, rgba(20,30,70,0.2) 72%, transparent 100%)",
  },
];

function pickTheme(platform: string, index: number) {
  return GRADIENT_THEMES[platform] ?? FALLBACK_THEMES[index % FALLBACK_THEMES.length];
}

function buildPrompt(platforms: string[], answers: ClaudeAnswers, count: number, avoidTitles: string[]): string {
  const avoidLine = avoidTitles.length
    ? `\nAlready shown (do not repeat): ${avoidTitles.join(", ")}`
    : "";

  const formatLine = answers.formatType === "any"
    ? "no preference"
    : answers.formatDetail !== "any"
      ? `${answers.formatType} — ${answers.formatDetail}`
      : answers.formatType;

  return `You are the recommendation engine for "One Watch" — an app that eliminates streaming decision fatigue.

User profile:
- Streaming subscriptions: ${platforms.join(", ")}
- Watching with: ${answers.audience === "any" ? "anyone / no preference" : answers.audience}
- Genre: ${answers.genre === "any" ? "no preference" : answers.genre}
- Format: ${formatLine}${avoidLine}

Return EXACTLY ${count} recommendation${count > 1 ? "s" : ""} as a JSON array. Each item MUST:
1. Be currently available on one of the user's platforms
2. Genuinely match their mood and time constraints
3. Respect their avoidances
4. Be worth watching (aim for IMDb 7.0+)
5. Be a real, well-known title

JSON format — return ONLY the array, no other text:
[
  {
    "title": "string",
    "year": 2023,
    "type": "movie",
    "platform": "Netflix",
    "mood_tags": ["tag1", "tag2"],
    "runtime": "1h 47m",
    "imdb_score": 8.2,
    "description": "2-3 sentence description",
    "why_this": "One line: exactly why this matches the user's preferences",
    "youtube_search_query": "Title Year official trailer",
    "tmdb_poster_path": "/abc123.jpg"
  }
]

For tmdb_poster_path: include only if you are confident in the TMDB path, otherwise use "".`;
}

async function callClaude(body: unknown): Promise<ClaudePick[]> {
  const res = await fetch("/api/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json() as { error?: { message?: string }; content?: { text?: string }[] };
  if (data.error) throw new Error(data.error.message ?? "API error");
  const text = data.content?.[0]?.text;
  if (!text) throw new Error("Empty response");
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("No JSON in response");
  return JSON.parse(match[0]) as ClaudePick[];
}

function toFocusPick(pick: ClaudePick, index: number): FocusPick {
  const theme = pickTheme(pick.platform, index);
  return {
    id: `claude-${index}-${pick.title.replace(/\s/g, "-").toLowerCase()}`,
    title: pick.title,
    year: pick.year,
    type: pick.type,
    platform: pick.platform,
    platformColor: theme.platformColor,
    mood_tags: pick.mood_tags,
    runtime: pick.runtime,
    imdb_score: pick.imdb_score,
    description: pick.description,
    why_this: pick.why_this,
    posterGradient: theme.posterGradient,
    posterGlow: theme.posterGlow,
  };
}

export async function getRecommendations(
  platforms: string[],
  answers: ClaudeAnswers,
): Promise<FocusPick[]> {
  const raw = await callClaude({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [{ role: "user", content: buildPrompt(platforms, answers, 4, []) }],
  });
  return raw.map(toFocusPick);
}

export async function getOneRecommendation(
  platforms: string[],
  answers: ClaudeAnswers,
  avoidTitles: string[],
): Promise<FocusPick> {
  const raw = await callClaude({
    model: "claude-sonnet-4-6",
    max_tokens: 700,
    messages: [{ role: "user", content: buildPrompt(platforms, answers, 1, avoidTitles) }],
  });
  return toFocusPick(raw[0], 0);
}
