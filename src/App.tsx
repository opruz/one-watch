import { useEffect, useMemo, useRef, useState } from "react";
import {
  House, Heart, Hourglass, Fire, GearSix, Question, ArrowsClockwise,
  Bell, Play, Crosshair, Compass,
} from "@phosphor-icons/react";
import titles from "./data/titles";
import { TitleModal } from "./components/explore/TitleModal";
import Onboarding from "./components/onboarding/Onboarding";
import FocusMode from "./components/focus/FocusMode";
import type { Genre, Title, UserProviderAccess } from "./types";

type AppMode = "focus" | "explore";

type PhIconComp = React.ComponentType<{
  size?: number;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
}>;

const defaultProviderAccess: UserProviderAccess = {
  subscribed: ["Netflix", "Disney+", "Hulu"],
  freeWithoutSubscription: ["Prime", "Apple TV+"],
};

const ALL_ROWS = [
  { label: "Trending Now", genre: null as Genre | null, items: [...titles].sort((a, b) => b.popularity - a.popularity).slice(0, 10) },
  { label: "Comedy",       genre: "comedy"    as Genre, items: titles.filter(t => t.genres.includes("comedy")).slice(0, 10) },
  { label: "Thriller",     genre: "thriller"  as Genre, items: titles.filter(t => t.genres.includes("thriller")).slice(0, 10) },
  { label: "Drama",        genre: "drama"     as Genre, items: titles.filter(t => t.genres.includes("drama")).slice(0, 10) },
  { label: "Sci-Fi",       genre: "sci-fi"    as Genre, items: titles.filter(t => t.genres.includes("sci-fi")).slice(0, 10) },
  { label: "Animation",    genre: "animation" as Genre, items: titles.filter(t => t.genres.includes("animation")).slice(0, 10) },
];

const GENRE_CHIPS: { label: string; value: Genre | null }[] = [
  { label: "All",       value: null },
  { label: "Comedy",    value: "comedy" },
  { label: "Thriller",  value: "thriller" },
  { label: "Drama",     value: "drama" },
  { label: "Sci-Fi",    value: "sci-fi" },
  { label: "Animation", value: "animation" },
  { label: "Action",    value: "action" },
  { label: "Horror",    value: "horror" },
  { label: "Romance",   value: "romance" },
  { label: "Documentary", value: "documentary" },
];

const CARD_FRAC = 0.40;
const STEP_FRAC = 0.30;
const LEFT_FRAC = 0.03;

function ExploreRow({ label, items, onSelect }: {
  label: string;
  items: Title[];
  onSelect: (t: Title) => void;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [drag, setDrag] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackW, setTrackW] = useState(0);

  const pointerStartX = useRef(0);
  const pointerLastX = useRef(0);
  const pointerLastT = useRef(0);
  const vxRef = useRef(0);
  const dragRef = useRef(0);
  const isDraggingRef = useRef(false);
  const didMoveRef = useRef(false);
  const activeIdxRef = useRef(0);
  activeIdxRef.current = activeIdx;

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => setTrackW(entries[0].contentRect.width));
    ro.observe(el);
    setTrackW(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  const step = trackW * STEP_FRAC;

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerStartX.current = e.clientX;
    pointerLastX.current = e.clientX;
    pointerLastT.current = Date.now();
    vxRef.current = 0;
    dragRef.current = 0;
    didMoveRef.current = false;
    isDraggingRef.current = true;
    setIsDragging(true);
    setDrag(0);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!isDraggingRef.current) return;
    const now = Date.now();
    const dt = now - pointerLastT.current;
    if (dt > 0) vxRef.current = (e.clientX - pointerLastX.current) / dt;
    pointerLastX.current = e.clientX;
    pointerLastT.current = now;
    dragRef.current = e.clientX - pointerStartX.current;
    if (Math.abs(dragRef.current) > 6) didMoveRef.current = true;
    setDrag(dragRef.current);
  }

  function onPointerUp() {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    const vx = vxRef.current;
    const d = dragRef.current;
    let delta = 0;
    if (vx < -0.4 || d < -step * 0.3) delta = 1;
    else if (vx > 0.4 || d > step * 0.3) delta = -1;
    if (delta !== 0) {
      setActiveIdx(i => Math.max(0, Math.min(items.length - 1, i + delta)));
    }
    setDrag(0);
  }

  const cardW = trackW * CARD_FRAC;
  const cardH = Math.round(cardW * (9 / 16) + 44);

  return (
    <div className="explore-row">
      <p className="explore-row__label">{label}</p>
      <div
        className="ex-track"
        ref={trackRef}
        style={trackW > 0 ? { height: cardH } : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {trackW > 0 && items.map((title, i) => {
          const offset = i - activeIdx;
          const abs = Math.abs(offset);
          const x = LEFT_FRAC * trackW + offset * step + drag;
          return (
            <button
              key={title.id}
              type="button"
              className="ex-card"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: cardW,
                transform: `translateX(${x}px)`,
                transformOrigin: "left center",
                filter: abs > 0 ? `blur(${abs * 3.5}px)` : "none",
                zIndex: 10 - abs,
                transition: isDragging ? "none" : "transform 0.46s cubic-bezier(0.4,0,0.2,1), filter 0.46s cubic-bezier(0.4,0,0.2,1)",
                pointerEvents: abs > 3 ? "none" : "auto",
              }}
              onClick={() => {
                if (didMoveRef.current) return;
                if (abs === 0) onSelect(title);
                else setActiveIdx(i);
              }}
            >
              <div
                className="ex-card__thumb"
                style={title.thumbnailUrl
                  ? undefined
                  : { background: `linear-gradient(160deg, ${title.posterHue} 0%, #080810 100%)` }
                }
              >
                {title.thumbnailUrl
                  ? <img src={title.thumbnailUrl} alt={title.title} className="ex-card__thumb-img" draggable={false} />
                  : <span className="ex-card__initial">{title.title.charAt(0)}</span>
                }
              </div>
              <p className="ex-card__title">{title.title}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [_platforms, setPlatforms] = useState<string[]>([]);
  const [mode, setMode] = useState<AppMode>("focus");
  const [selected, setSelected] = useState<Title | null>(null);
  const [activeGenre, setActiveGenre] = useState<Genre | null>(null);

  const exploreRows = useMemo(() => {
    if (activeGenre === null) return ALL_ROWS;
    const filtered = titles.filter(t => t.genres.includes(activeGenre));
    const row = ALL_ROWS.find(r => r.genre === activeGenre);
    return [{ label: row?.label ?? activeGenre, genre: activeGenre, items: filtered }];
  }, [activeGenre]);

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

  function handleOnboardingComplete(selected: string[]) {
    localStorage.setItem("ow-platforms", JSON.stringify(selected));
    setPlatforms(selected);
    setMode("focus");
    setOnboarded(true);
  }

  function handleOnboardingBrowse(selected: string[]) {
    if (selected.length) {
      localStorage.setItem("ow-platforms", JSON.stringify(selected));
      setPlatforms(selected);
    }
    setMode("explore");
    setOnboarded(true);
  }

  if (onboarded === null) return <div className="splash" />;
  if (!onboarded) return <Onboarding onComplete={handleOnboardingComplete} onBrowse={handleOnboardingBrowse} />;

  const navItems: { label: string; Icon: PhIconComp }[] = [
    { label: "Home",        Icon: House },
    { label: "Favorites",   Icon: Heart },
    { label: "Coming Soon", Icon: Hourglass },
    { label: "Trending",    Icon: Fire },
  ];
  const settingsItems: { label: string; Icon: PhIconComp }[] = [
    { label: "Settings", Icon: GearSix },
    { label: "Support",  Icon: Question },
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
                <span className="side-link__label">{label}</span>
              </button>
            ))}
          </div>
          <div className="sidebar__divider" />
          <div>
            {settingsItems.map(({ label, Icon }) => (
              <button key={label} type="button" className="side-link">
                <span className="side-link__icon"><Icon size={18} weight="duotone" /></span>
                <span className="side-link__label">{label}</span>
              </button>
            ))}
            <button
              type="button"
              className="side-link"
              onClick={() => { localStorage.removeItem("ow-platforms"); setOnboarded(false); }}
            >
              <span className="side-link__icon"><ArrowsClockwise size={18} weight="bold" /></span>
              <span className="side-link__label">Platforms</span>
            </button>
          </div>
        </nav>

        <div className="sidebar__watchlist">
          <p className="sidebar__wl-label">Continue Watching</p>
          <button type="button" className="sb-cw-card">
            <div className="sb-cw-thumb" style={{ backgroundImage: "url(/grand-budapest-hotel-thumbnail.jpg)" }}>
              <div className="sb-cw-play-btn">
                <Play size={14} weight="fill" />
              </div>
            </div>
            <p className="sb-cw-title">Grand Budapest Hotel</p>
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="main">
        <header className="topbar">
          <div className="mode-toggle">
            <button type="button" className={`mode-btn${mode === "focus" ? " mode-btn--active" : ""}`} onClick={() => setMode("focus")}>
              <Crosshair size={15} weight="duotone" /> Focus
            </button>
            <button type="button" className={`mode-btn${mode === "explore" ? " mode-btn--active" : ""}`} onClick={() => setMode("explore")}>
              <Compass size={15} weight="duotone" /> Explore
            </button>
          </div>

          <div className="topbar__spacer" />

          <div className="topbar__right">
            <button type="button" className="topbar__icon-btn" title="Notifications">
              <Bell size={18} weight="duotone" />
            </button>
            <div className="topbar__profile-wrap">
              <button type="button" className="topbar__avatar-btn">YR</button>
              <div className="topbar__profile-menu">
                <button type="button" className="topbar__menu-item">Account</button>
                <button type="button" className="topbar__menu-item">Settings</button>
                <button type="button" className="topbar__menu-item">Manage platforms</button>
                <div className="topbar__menu-divider" />
                <button type="button" className="topbar__menu-item topbar__menu-item--danger">Sign out</button>
              </div>
            </div>
          </div>
        </header>

        {mode === "focus" && <FocusMode />}

        {mode === "explore" && (
          <div className="explore-page">
            <img src="/onewatch-background.png" className="fm-page-bg" alt="" draggable={false} />
            <div className="explore-inner">
              <div className="explore-chips">
                {GENRE_CHIPS.map(({ label, value }) => (
                  <button
                    key={label}
                    type="button"
                    className={`genre-chip${activeGenre === value ? " genre-chip--active" : ""}`}
                    onClick={() => setActiveGenre(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {exploreRows.map(({ label, items }) => (
                <ExploreRow
                  key={label}
                  label={label}
                  items={items}
                  onSelect={setSelected}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {selected && (
        <TitleModal title={selected} providerAccess={defaultProviderAccess} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
