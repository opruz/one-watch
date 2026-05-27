import type { Filters, Mood, RankedTitle, Title } from "../types";

function moodLabel(mood: Mood): string {
  const labels: Record<Mood, string> = {
    light: "light & easy",
    intense: "intense",
    "feel-good": "feel-good",
    thoughtful: "thoughtful",
    funny: "funny",
    scary: "scary",
    romantic: "romantic",
  };
  return labels[mood];
}

function buildReason(title: Title, filters: Filters): string {
  const parts: string[] = [];

  if (filters.mood && title.moods.includes(filters.mood)) {
    parts.push(`${moodLabel(filters.mood)} vibe`);
  }

  if (filters.maxRuntime && title.runtime <= filters.maxRuntime) {
    parts.push(`under ${filters.maxRuntime} min`);
  }

  if (filters.genre && title.genres.includes(filters.genre)) {
    parts.push(filters.genre);
  }

  if (title.providers.length > 0) {
    parts.push(`on ${title.providers[0]}`);
  }

  if (parts.length === 0) {
    return "Popular pick across your streaming services";
  }

  return parts.map((p, i) => (i === 0 ? p.charAt(0).toUpperCase() + p.slice(1) : p)).join(" · ");
}

function scoreTitle(title: Title, filters: Filters): number {
  let score = title.popularity * 40;

  if (filters.mood && title.moods.includes(filters.mood)) {
    score += 30;
  }

  if (filters.genre && title.genres.includes(filters.genre)) {
    score += 25;
  }

  if (filters.maxRuntime) {
    if (title.runtime <= filters.maxRuntime) {
      score += 20;
      const headroom = filters.maxRuntime - title.runtime;
      score += Math.min(headroom / 10, 5);
    } else {
      score -= 15;
    }
  }

  if (filters.query) {
    const q = filters.query.toLowerCase();
    if (title.title.toLowerCase().includes(q)) score += 20;
    if (title.synopsis.toLowerCase().includes(q)) score += 5;
    if (title.genres.some((g) => g.includes(q))) score += 10;
  }

  return score;
}

function isDiverse(candidate: Title, selected: Title[]): boolean {
  return selected.every(
    (s) =>
      !s.genres.some((g) => candidate.genres.includes(g)) ||
      s.providers[0] !== candidate.providers[0],
  );
}

export function filterTitles(titles: Title[], filters: Filters): Title[] {
  return titles.filter((t) => {
    if (filters.mood && !t.moods.includes(filters.mood)) return false;
    if (filters.genre && !t.genres.includes(filters.genre)) return false;
    if (filters.maxRuntime && t.runtime > filters.maxRuntime) return false;
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const matches =
        t.title.toLowerCase().includes(q) ||
        t.synopsis.toLowerCase().includes(q) ||
        t.genres.some((g) => g.includes(q));
      if (!matches) return false;
    }
    return true;
  });
}

export function pickForMe(titles: Title[], filters: Filters, count = 3): RankedTitle[] {
  const pool = filterTitles(titles, filters);
  const ranked = pool
    .map((title) => ({
      title,
      score: scoreTitle(title, filters),
      reason: buildReason(title, filters),
    }))
    .sort((a, b) => b.score - a.score);

  const picks: RankedTitle[] = [];
  for (const item of ranked) {
    if (picks.length >= count) break;
    if (picks.length === 0 || isDiverse(item.title, picks.map((p) => p.title))) {
      picks.push(item);
    }
  }

  while (picks.length < count && picks.length < ranked.length) {
    const next = ranked.find((r) => !picks.some((p) => p.title.id === r.title.id));
    if (!next) break;
    picks.push(next);
  }

  return picks;
}

export function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
