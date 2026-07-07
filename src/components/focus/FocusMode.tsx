import { useCallback, useEffect, useRef, useState } from "react";
import {
  Television, FilmStrip,
  Star, User, Heart, Users, UsersThree,
  Coffee, Lightning, Drop, Sparkle, Smiley, Flame,
  Clock, Moon,
} from "@phosphor-icons/react";
import { getRecommendations } from "../../lib/claude";
import {
  FOCUS_PICKS,
  AUDIENCE_OPTIONS,
  GENRE_OPTIONS,
  FORMAT_TYPE_OPTIONS,
  MOVIE_LENGTH_OPTIONS,
  SHOW_TYPE_OPTIONS,
  type FocusPick,
} from "../../data/focusData";
import MovieDetailPage, { type SnapRect } from "./MovieDetailPage";

function snapRect(r: DOMRect | null): SnapRect | null {
  if (!r) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

interface Answers {
  audience: string;
  genre: string;
  formatType: string;
  formatDetail: string;
}

const DEFAULT: Answers = { audience: "any", genre: "any", formatType: "any", formatDetail: "any" };

type PhWeight = "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
type PhIconComp = React.ComponentType<{ size?: number; weight?: PhWeight; color?: string }>;

const ICON_MAP: Record<string, PhIconComp> = {
  Star, User, Heart, Users, UsersThree,
  Coffee, Lightning, Drop, Television, Sparkle, Smiley,
  Clock, Moon, Flame, FilmStrip,
};

function QIcon({ name, size = 16, weight = "duotone" }: { name: string; size?: number; weight?: PhWeight }) {
  const Ic = ICON_MAP[name] as PhIconComp | undefined;
  if (!Ic) return null;
  return <Ic size={size} weight={weight} />;
}

function OptionGrid({ options, selected, onSelect, cols = 4 }: {
  options: { value: string; label: string; icon?: string }[];
  selected: string;
  onSelect: (v: string) => void;
  cols?: number;
}) {
  return (
    <div className="fm-option-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`fm-option${selected === opt.value ? " fm-option--on" : ""}${opt.value === "any" ? " fm-option--any" : ""}`}
          onClick={() => onSelect(opt.value)}
        >
          {opt.icon && (
            <span className="fm-opt-icon">
              <QIcon name={opt.icon} size={16} weight={selected === opt.value ? "fill" : "duotone"} />
            </span>
          )}
          <span className="fm-opt-label">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

function QSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="fm-section">
      <p className="fm-section-label">{label}</p>
      {children}
    </div>
  );
}

function buildSummary(answers: Answers): string {
  const { audience, genre, formatType, formatDetail } = answers;
  if (audience === "any" && genre === "any" && formatType === "any") {
    return "We'll find matches across your platforms";
  }

  let formatStr = "";
  if (formatType === "Movie") {
    if (formatDetail === "Short film") formatStr = "short movie";
    else if (formatDetail === "Long feature") formatStr = "long movie";
    else formatStr = "movie";
  } else if (formatType === "TV Show") {
    if (formatDetail === "Mini-series") formatStr = "mini-series";
    else if (formatDetail === "Ongoing series") formatStr = "ongoing series";
    else formatStr = "TV show";
  }

  const genreStr = genre !== "any" ? genre.toLowerCase() : "";
  const qualifier = audience === "Family" ? "family-friendly " : "";
  const ending =
    audience === "Solo" ? " just for you" :
    audience === "Date night" ? " perfect for two" :
    audience === "Friends" ? " great for a group" : "";

  let noun: string;
  if (formatStr) {
    const combined = genreStr ? `${genreStr} ${formatStr}` : formatStr;
    if (qualifier) {
      noun = combined;
    } else {
      const first = combined[0].toLowerCase();
      noun = ("aeiou".includes(first) ? "an " : "a ") + combined;
    }
  } else {
    noun = genreStr ? `${genreStr} matches` : "matches";
  }

  return `We'll find ${qualifier}${noun}${ending}`;
}

/* ── Gallery Card ── */
function GalleryCard({ pick, offset, isActive, isDetailOpen, onClick }: {
  pick: FocusPick; offset: number; isActive: boolean; isDetailOpen?: boolean;
  onClick: (posterRect: SnapRect | null, panelRect: SnapRect | null) => void;
}) {
  const posterRef = useRef<HTMLDivElement>(null);
  const panelRef  = useRef<HTMLDivElement>(null);
  const abs     = Math.abs(offset);
  const scale   = Math.max(0.78, 1 - abs * 0.1);
  const blur    = abs * 4;
  const opacity = Math.max(0.5, 1 - abs * 0.28);
  const step    = 870;

  return (
    <div
      className={`fm-gallery-slot${isActive ? " fm-gallery-slot--active" : ""}${isDetailOpen ? " fm-gallery-slot--detail-open" : ""}`}
      style={{ transform: `translateX(calc(-50% + ${offset * step}px)) translateY(-50%)`, zIndex: 10 - abs }}
      onClick={() => {
        if (!isActive) { onClick(null, null); return; }
        onClick(
          snapRect(posterRef.current?.getBoundingClientRect() ?? null),
          snapRect(panelRef.current?.getBoundingClientRect() ?? null),
        );
      }}
    >
      <div
        className={`fm-gallery-card${isActive ? " fm-gallery-card--active" : ""}`}
        style={{
          transform: `scale(${scale})`,
          filter: blur > 0 ? `blur(${blur}px)` : "none",
          opacity,
        }}
      >
        <div className="fm-gallery-poster" ref={posterRef}>
          {pick.thumbnailUrl ? (
            <div className="fm-gallery-bg fm-gallery-bg--photo" style={{ backgroundImage: `url(${pick.thumbnailUrl})` }}>
              <div className="fm-poster-grain" />
            </div>
          ) : (
            <div className="fm-gallery-bg" style={{ background: pick.posterGradient }}>
              <div className="fm-gallery-glow" style={{ background: pick.posterGlow }} />
              <div className="fm-poster-grain" />
            </div>
          )}
          <div className={`fm-gallery-scrim${pick.thumbnailUrl ? " fm-gallery-scrim--photo" : ""}`} />
          <div className="fm-gallery-overlay">
            <div className="fm-gallery-panel" ref={panelRef}>
              {pick.logoUrl ? (
                <img src={pick.logoUrl} alt={pick.title} className="fm-gallery-logo" draggable={false} />
              ) : (
                <h3 className="fm-gallery-title">{pick.title}</h3>
              )}
              <div className="fm-gallery-tags">
                {pick.mood_tags.slice(0, 3).map((tag) => <span key={tag} className="fm-tag">{tag}</span>)}
              </div>
              <p className="fm-gallery-meta">{pick.year} · {pick.runtime} · ★ {pick.imdb_score}</p>
              <p className="fm-gallery-desc">{pick.description}</p>
            </div>
          </div>
        </div>
        {!isActive && <div className="fm-gallery-dim" />}
      </div>
    </div>
  );
}

/* ── Main ── */
export default function FocusMode() {
  const [answers, setAnswers]     = useState<Answers>(DEFAULT);
  const [view, setView]           = useState<"q" | "r">("q");
  const [isLoading, setIsLoading] = useState(false);
  const [picks, setPicks]         = useState<FocusPick[]>(FOCUS_PICKS);
  const [activeIdx, setActiveIdx] = useState(0);
  const [detailPick, setDetailPick] = useState<FocusPick | null>(null);
  const [fromRect, setFromRect]           = useState<SnapRect | null>(null);
  const [fromPanelRect, setFromPanelRect] = useState<SnapRect | null>(null);
  const [isClosingDetail, setIsClosingDetail] = useState(false);
  const [saved, setSaved]         = useState<string[]>([]);

  /* ── Trackpad horizontal scroll ── */
  const overlayRef      = useRef<HTMLDivElement>(null);
  const wAccum          = useRef(0);
  const wCooldown       = useRef(0);
  const wReset          = useRef<ReturnType<typeof setTimeout> | null>(null);
  const picksLenRef     = useRef(picks.length);
  const detailOpenRef   = useRef(false);
  picksLenRef.current   = picks.length;
  detailOpenRef.current = !!(detailPick);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    const THRESHOLD = 90;
    const COOLDOWN  = 480;

    const onWheel = (e: WheelEvent) => {
      if (detailOpenRef.current) return;
      const ax = Math.abs(e.deltaX);
      const ay = Math.abs(e.deltaY);
      if (ax < 6 || ay > ax) return;
      e.preventDefault();
      const now = Date.now();
      if (now < wCooldown.current) return;
      const px = e.deltaMode === 1 ? e.deltaX * 16 : e.deltaMode === 2 ? e.deltaX * 100 : e.deltaX;
      wAccum.current += px;
      if (wReset.current) clearTimeout(wReset.current);
      wReset.current = setTimeout(() => { wAccum.current = 0; }, 180);
      if (Math.abs(wAccum.current) >= THRESHOLD) {
        const dir = wAccum.current > 0 ? 1 : -1;
        wAccum.current = 0;
        wCooldown.current = now + COOLDOWN;
        setActiveIdx(i => Math.max(0, Math.min(picksLenRef.current - 1, i + dir)));
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const set = (field: keyof Answers, value: string) =>
    setAnswers((prev) => ({ ...prev, [field]: value }));

  const setFormatType = (v: string) =>
    setAnswers((prev) => ({ ...prev, formatType: v, formatDetail: "any" }));

  const getPlatforms = (): string[] => {
    try { return JSON.parse(localStorage.getItem("ow-platforms") ?? "[]") as string[]; }
    catch { return []; }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setView("r");
    setDetailPick(null);
    try {
      const platforms = getPlatforms();
      const recs = await getRecommendations(platforms.length ? platforms : ["Netflix", "Prime", "Hulu"], answers);
      setPicks(recs);
    } catch {
      setPicks(FOCUS_PICKS);
    }
    setActiveIdx(0);
    setIsLoading(false);
  };

  const toggleSave = (pick: FocusPick) =>
    setSaved((prev) => prev.includes(pick.id) ? prev.filter((id) => id !== pick.id) : [...prev, pick.id]);

  const closeDetail = useCallback(() => {
    setIsClosingDetail(true);
    setTimeout(() => { setDetailPick(null); setIsClosingDetail(false); }, 500);
  }, []);

  const handleDetailSkip = useCallback(() => {
    closeDetail();
    setTimeout(() => {
      setActiveIdx(i => Math.min(picksLenRef.current - 1, i + 1));
    }, 520);
  }, [closeDetail]);

  return (
    <div className="fm-page">

      <img src="/onewatch-background.png" className="fm-page-bg" alt="" draggable={false} />

      {/* ── Questionnaire ── */}
      <div className="fm-wrap">
        <div className="fm-questionnaire">
          <div className="fm-intro">
            <h2 className="fm-intro-title">What are you in the mood for?</h2>
            <p className="fm-intro-hint">Choose what fits for you and we'll handle the rest.</p>
          </div>

          <QSection label="Who's watching?">
            <OptionGrid options={AUDIENCE_OPTIONS} selected={answers.audience} onSelect={(v) => set("audience", v)} cols={5} />
          </QSection>

          <QSection label="What's your genre?">
            <OptionGrid options={GENRE_OPTIONS} selected={answers.genre} onSelect={(v) => set("genre", v)} cols={5} />
          </QSection>

          <QSection label="What are you looking for?">
            <OptionGrid options={FORMAT_TYPE_OPTIONS} selected={answers.formatType} onSelect={setFormatType} cols={3} />
            {answers.formatType === "Movie" && (
              <div className="fm-sub-options">
                <OptionGrid options={MOVIE_LENGTH_OPTIONS} selected={answers.formatDetail} onSelect={(v) => set("formatDetail", v)} cols={4} />
              </div>
            )}
            {answers.formatType === "TV Show" && (
              <div className="fm-sub-options">
                <OptionGrid options={SHOW_TYPE_OPTIONS} selected={answers.formatDetail} onSelect={(v) => set("formatDetail", v)} cols={3} />
              </div>
            )}
          </QSection>
        </div>
      </div>

      {/* ── Sticky footer: summary + CTA ── */}
      <div className={`fm-sticky-footer${view === "r" ? " fm-sticky-footer--hidden" : ""}`}>
        <div className="fm-sticky-footer-inner">
          <p className="fm-summary-text">{buildSummary(answers)}</p>
          <button type="button" className="fm-cta" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <span className="fm-spinner" /> : "Find my picks"}
          </button>
        </div>
      </div>

      {/* ── Results overlay ── */}
      <div className={`fm-results-overlay${view === "r" ? " fm-results-overlay--in" : ""}`} ref={overlayRef}>
        {isLoading ? (
          <div className="fm-gallery-skeleton" />
        ) : (
          <>
            <div className="fm-gallery-header">
              <div>
                <p className="fm-results-label">Your picks</p>
                <p className="fm-results-sub">{activeIdx + 1} of {picks.length} · tap active card for details</p>
              </div>
              <button type="button" className="fm-change-answers-btn" onClick={() => setView("q")}>
                ↓ Change your answers
              </button>
            </div>
            <div className="fm-gallery">
              {picks.map((pick, i) => (
                <GalleryCard
                  key={pick.id}
                  pick={pick}
                  offset={i - activeIdx}
                  isActive={i === activeIdx}
                  isDetailOpen={!!detailPick && i === activeIdx}
                  onClick={(posterRect, panelRect) => {
                    if (i === activeIdx) {
                      setFromRect(posterRect);
                      setFromPanelRect(panelRect);
                      setDetailPick(pick);
                    } else {
                      setActiveIdx(i);
                    }
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {(detailPick || isClosingDetail) && detailPick && (
        <MovieDetailPage
          pick={detailPick}
          saved={saved.includes(detailPick.id)}
          isClosing={isClosingDetail}
          fromRect={fromRect}
          fromPanelRect={fromPanelRect}
          onSave={() => toggleSave(detailPick)}
          onRefresh={handleDetailSkip}
          onClose={closeDetail}
        />
      )}
    </div>
  );
}
