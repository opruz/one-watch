import { useEffect, useMemo, useRef, useState } from "react";
import {
  House, Heart, Hourglass, Fire, GearSix, Question, ArrowsClockwise,
  MagnifyingGlass, Bell, Play, CaretDown, CaretLeft, CaretRight,
  Crosshair, Compass, SquaresFour, Sparkle,
} from "@phosphor-icons/react";
import titles from "./data/titles";
import { ProviderBadge } from "./components/explore/ProviderBadge";
import { TitleCard } from "./components/explore/TitleCard";
import { TitleModal } from "./components/explore/TitleModal";
import Onboarding from "./components/onboarding/Onboarding";
import FocusMode from "./components/focus/FocusMode";
import { getProviderStatus } from "./lib/providers";
import { filterTitles, formatRuntime, pickForMe } from "./lib/rank";
import type { Filters, Genre, Provider, ProviderStatus, Title, UserProviderAccess } from "./types";
import { MOODS, PROVIDERS, RUNTIME_OPTIONS } from "./types";

type AppMode = "focus" | "explore";

type PhIconComp = React.ComponentType<{
  size?: number;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
}>;

const defaultFilters: Filters = { mood: null, maxRuntime: null, genre: null, query: "" };

const defaultProviderAccess: UserProviderAccess = {
  subscribed: ["Netflix", "Disney+", "Hulu"],
  freeWithoutSubscription: ["Prime", "Apple TV+"],
};

const GENRE_LABELS: { id: Genre | null; label: string }[] = [
  { id: null, label: "All" },
  { id: "action", label: "Action" },
  { id: "comedy", label: "Comedy" },
  { id: "thriller", label: "Thriller" },
  { id: "drama", label: "Drama" },
  { id: "romance", label: "Romance" },
  { id: "sci-fi", label: "Sci-Fi" },
  { id: "horror", label: "Horror" },
  { id: "animation", label: "Animation" },
  { id: "documentary", label: "Documentary" },
  { id: "fantasy", label: "Fantasy" },
];

const PROGRESS = [0.55, 0.28];

export default function App() {
  const [onboarded, setOnboarded] = useState<boolean | null>(null); // null = loading
  const [_platforms, setPlatforms] = useState<string[]>([]);
  const [mode, setMode] = useState<AppMode>("focus");
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [picks, setPicks] = useState<ReturnType<typeof pickForMe> | null>(null);
  const [selected, setSelected] = useState<Title | null>(null);
  const [hasPicked, setHasPicked] = useState(false);
  const [providerAccess, setProviderAccess] = useState<UserProviderAccess>(defaultProviderAccess);
  const [showPlatforms, setShowPlatforms] = useState(false);
  const genreScrollRef = useRef<HTMLDivElement>(null);

  // Persist onboarding state
  useEffect(() => {
    const stored = localStorage.getItem("ow-platforms");
    if (stored) {
      try {
        setPlatforms(JSON.parse(stored));
        setOnboarded(true);
      } catch {
        localStorage.removeItem("ow-platforms");
        setOnboarded(false);
      }
    } else {
      setOnboarded(false);
    }
  }, []);

  const filtered = useMemo(() => filterTitles(titles, filters), [filters]);
  const featuredTitle = useMemo(
    () => (picks && picks.length > 0 ? picks[0].title : filtered[0] ?? titles[0]),
    [filtered, picks],
  );
  const sideCards = useMemo(() => {
    const pool = filtered.length > 1 ? filtered : titles;
    return pool.filter((t) => t.id !== featuredTitle.id).slice(0, 2);
  }, [filtered, featuredTitle]);
  const continueWatching = useMemo(() => titles.slice(6, 8), []);

  function handleOnboardingComplete(selected: string[]) {
    localStorage.setItem("ow-platforms", JSON.stringify(selected));
    setPlatforms(selected);
    setOnboarded(true);
  }

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPicks(null);
    setHasPicked(false);
  }

  function handlePickForMe() {
    setPicks(pickForMe(titles, filters));
    setHasPicked(true);
  }

  function setProviderStatus(provider: Provider, status: ProviderStatus) {
    setProviderAccess((prev) => {
      const nextSubscribed = prev.subscribed.filter((p) => p !== provider);
      const nextFree = prev.freeWithoutSubscription.filter((p) => p !== provider);
      if (status === "subscribed") nextSubscribed.push(provider);
      if (status === "free") nextFree.push(provider);
      return { subscribed: nextSubscribed, freeWithoutSubscription: nextFree };
    });
  }

  function scrollGenres(dir: "left" | "right") {
    genreScrollRef.current?.scrollBy({ left: dir === "right" ? 180 : -180, behavior: "smooth" });
  }

  // Loading splash
  if (onboarded === null) return <div className="splash" />;

  // Onboarding
  if (!onboarded) return <Onboarding onComplete={handleOnboardingComplete} />;

  const navItems: { label: string; Icon: PhIconComp }[] = [
    { label: "Home", Icon: House },
    { label: "Favorites", Icon: Heart },
    { label: "Coming Soon", Icon: Hourglass },
    { label: "Trending", Icon: Fire },
  ];
  const settingsItems: { label: string; Icon: PhIconComp }[] = [
    { label: "Settings", Icon: GearSix },
    { label: "Support", Icon: Question },
  ];

  return (
    <div className="app">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="sidebar__logo" aria-hidden="true">◉</div>
          <span className="sidebar__brand-name">One Watch</span>
        </div>

        <nav className="sidebar__nav">
          <div>
            {navItems.map(({ label, Icon }) => (
              <button key={label} type="button" className={`side-link${label === "Home" ? " side-link--active" : ""}`}>
                <span className="side-link__icon"><Icon size={18} weight="duotone" /></span>
                {label}
              </button>
            ))}
          </div>
          <div className="sidebar__divider" />
          <div>
            {settingsItems.map(({ label, Icon }) => (
              <button key={label} type="button" className="side-link">
                <span className="side-link__icon"><Icon size={18} weight="duotone" /></span>
                {label}
              </button>
            ))}
            <button
              type="button"
              className="side-link"
              onClick={() => {
                localStorage.removeItem("ow-platforms");
                setOnboarded(false);
              }}
            >
              <span className="side-link__icon"><ArrowsClockwise size={18} weight="bold" /></span>
              Platforms
            </button>
          </div>
        </nav>

        <div className="sidebar__watchlist">
          <p className="sidebar__wl-label">Continue Watching</p>
          {continueWatching.map((item, i) => (
            <button key={item.id} type="button" className="mini-card" onClick={() => setSelected(item)}>
              <div className="mini-card__poster" style={{ background: item.posterHue }}>
                {item.title.charAt(0)}
              </div>
              <div className="mini-card__info">
                <p className="mini-card__title">{item.title}</p>
                <div className="mini-card__progress">
                  <div className="mini-card__bar">
                    <div className="mini-card__bar-fill" style={{ width: `${PROGRESS[i] * 100}%` }} />
                  </div>
                  <span>{Math.round(PROGRESS[i] * 100)}%</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="main">
        {/* Topbar */}
        <header className="topbar">
          {/* Mode toggle pill */}
          <div className="mode-toggle">
            <button
              type="button"
              className={`mode-btn${mode === "focus" ? " mode-btn--active" : ""}`}
              onClick={() => setMode("focus")}
            >
              <Crosshair size={15} weight="duotone" /> Focus
            </button>
            <button
              type="button"
              className={`mode-btn${mode === "explore" ? " mode-btn--active" : ""}`}
              onClick={() => setMode("explore")}
            >
              <Compass size={15} weight="duotone" /> Explore
            </button>
          </div>

          {/* Search — only in Explore mode */}
          {mode === "explore" && (
            <div className="topbar__search-wrap">
              <span className="topbar__search-icon" aria-hidden="true"><MagnifyingGlass size={16} weight="bold" /></span>
              <input
                type="search"
                className="search"
                placeholder="Movies, series, shows..."
                value={filters.query}
                onChange={(e) => updateFilter("query", e.target.value)}
              />
            </div>
          )}

          {mode === "focus" && <div className="topbar__spacer" />}

          <div className="topbar__right">
            {mode === "explore" && (
              <button
                type="button"
                className="topbar__icon-btn"
                title="Platforms"
                onClick={() => setShowPlatforms((v) => !v)}
              >
                <SquaresFour size={18} weight="duotone" />
              </button>
            )}
            <button type="button" className="topbar__icon-btn" title="Notifications"><Bell size={18} weight="duotone" /></button>
            <div className="topbar__profile">
              <div className="topbar__avatar">YR</div>
              <div className="topbar__user">
                <p>Yuki R.</p>
                <small>Premium</small>
              </div>
              <span className="topbar__chevron"><CaretDown size={14} weight="bold" /></span>
            </div>
          </div>
        </header>

        {/* ── FOCUS MODE ── */}
        {mode === "focus" && <FocusMode />}

        {/* ── EXPLORE MODE ── */}
        {mode === "explore" && (
          <div className="main__content">

            {/* Hero */}
            <section>
              <div className="hero-row">
                <div className="hero__featured">
                  <div
                    className="hero__featured-bg"
                    style={{
                      background: `linear-gradient(135deg, ${featuredTitle.posterHue} 0%, #080810 100%)`,
                    }}
                  />
                  <div className="hero__gradient" />
                  <div className="hero__featured-content">
                    <div className="hero__tags">
                      <span className="hero__tag">{formatRuntime(featuredTitle.runtime)}</span>
                      {featuredTitle.genres.slice(0, 1).map((g) => (
                        <span key={g} className="hero__tag" style={{ textTransform: "capitalize" }}>{g}</span>
                      ))}
                      <span className="hero__tag">Movie</span>
                      <span className="hero__tag">{featuredTitle.year}</span>
                    </div>
                    <div className="hero__bottom">
                      <div className="hero__bottom-left">
                        <button
                          type="button"
                          className="hero__play-btn"
                          onClick={() => setSelected(featuredTitle)}
                          aria-label="Play trailer"
                        >
                          <Play size={18} weight="fill" />
                        </button>
                        <div className="hero__bottom-info">
                          <h2>{featuredTitle.title}</h2>
                          <small>Play trailer &nbsp;{formatRuntime(featuredTitle.runtime)}</small>
                        </div>
                      </div>
                      <button type="button" className="hero__heart-btn" aria-label="Add to favorites"><Heart size={20} weight="duotone" /></button>
                    </div>
                  </div>
                </div>
                <div className="hero__side">
                  {sideCards.map((t) => (
                    <div
                      key={t.id}
                      className="hero__side-card"
                      role="button"
                      tabIndex={0}
                      style={{ background: `linear-gradient(160deg, ${t.posterHue} 0%, #080810 100%)` }}
                      onClick={() => setSelected(t)}
                      onKeyDown={(e) => e.key === "Enter" && setSelected(t)}
                    >
                      {t.title.charAt(0)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="hero__dots">
                <div className="hero__dot hero__dot--active" />
                <div className="hero__dot" />
                <div className="hero__dot" />
              </div>
            </section>

            {/* Genre chips */}
            <div className="genres-row">
              <button type="button" className="genres-scroll-btn" onClick={() => scrollGenres("left")}><CaretLeft size={18} weight="bold" /></button>
              <div className="genres-row__chips" ref={genreScrollRef}>
                {GENRE_LABELS.map(({ id, label }) => (
                  <button
                    key={label}
                    type="button"
                    className={`genre-chip${filters.genre === id ? " genre-chip--active" : ""}`}
                    onClick={() => updateFilter("genre", id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button type="button" className="genres-scroll-btn" onClick={() => scrollGenres("right")}><CaretRight size={18} weight="bold" /></button>
            </div>

            {/* Filter panel */}
            <div className="filter-panel">
              <div className="filter-group">
                <label className="filter-label">Mood</label>
                <div className="chips">
                  {MOODS.map(({ id, label, emoji }) => (
                    <button
                      key={id}
                      type="button"
                      className={`chip${filters.mood === id ? " chip--active" : ""}`}
                      onClick={() => updateFilter("mood", filters.mood === id ? null : id)}
                    >
                      {emoji} {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="filter-group">
                <label className="filter-label">Runtime</label>
                <div className="chips">
                  {RUNTIME_OPTIONS.map(({ id, label }) => (
                    <button
                      key={label}
                      type="button"
                      className={`chip${filters.maxRuntime === id ? " chip--active" : ""}`}
                      onClick={() => updateFilter("maxRuntime", id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <button type="button" className="btn btn--primary btn--pick" onClick={handlePickForMe}>
                <Sparkle size={15} weight="duotone" /> Pick for me
              </button>
            </div>

            {/* Platforms (collapsible) */}
            {showPlatforms && (
              <section className="platforms">
                <div className="section-header">
                  <h2>Your platforms</h2>
                  <span className="section-sub">Manage streaming subscriptions</span>
                </div>
                <div className="platforms__row">
                  {PROVIDERS.map((provider) => (
                    <ProviderBadge key={provider} provider={provider} status={getProviderStatus(provider, providerAccess)} />
                  ))}
                </div>
                <div className="platforms__manager">
                  {PROVIDERS.map((provider) => {
                    const status = getProviderStatus(provider, providerAccess);
                    return (
                      <div key={provider} className="platforms__manager-row">
                        <span className="platforms__manager-name">{provider}</span>
                        <div className="platforms__manager-actions">
                          {(["subscribed", "free", "unavailable"] as ProviderStatus[]).map((s) => (
                            <button
                              key={s}
                              type="button"
                              className={`status-btn${status === s ? " status-btn--active" : ""}`}
                              onClick={() => setProviderStatus(provider, s)}
                            >
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Picks */}
            {hasPicked && (
              <section className="picks">
                <div className="section-header">
                  <h2>{picks && picks.length > 0 ? <><Sparkle size={14} weight="duotone" /> Your Top Picks</> : "No matches"}</h2>
                  {picks && picks.length > 0 && <span className="section-sub">Tap for details</span>}
                </div>
                {picks && picks.length > 0 ? (
                  <div className="picks__grid">
                    {picks.map(({ title, reason }) => (
                      <TitleCard key={title.id} title={title} providerAccess={providerAccess} reason={reason} featured onClick={() => setSelected(title)} />
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">Nothing matched. Try relaxing the filters.</p>
                )}
              </section>
            )}

            {/* Browse */}
            <section className="browse">
              <div className="section-header">
                <h2>Trending Now</h2>
                <span className="section-sub">{filtered.length} title{filtered.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="browse__grid">
                {filtered.map((title) => (
                  <TitleCard key={title.id} title={title} providerAccess={providerAccess} onClick={() => setSelected(title)} />
                ))}
              </div>
              {filtered.length === 0 && <p className="empty-state">No titles found. Clear search or adjust filters.</p>}
            </section>
          </div>
        )}
      </main>

      {selected && (
        <TitleModal title={selected} providerAccess={providerAccess} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
