import { useCallback, useEffect, useRef, useState } from "react";
import {
  Crosshair, Television, X,
  Star, User, Heart, Users, UsersThree,
  Coffee, Lightning, Drop, Sparkle, Smiley,
  Clock, Moon,
} from "@phosphor-icons/react";
import { getRecommendations, getOneRecommendation } from "../../lib/claude";
import {
  FOCUS_PICKS,
  AUDIENCE_OPTIONS,
  MOOD_OPTIONS,
  TIME_OPTIONS,
  AVOID_OPTIONS,
  type FocusPick,
} from "../../data/focusData";
import MovieDetailPage, { type SnapRect } from "./MovieDetailPage";

function snapRect(r: DOMRect | null): SnapRect | null {
  if (!r) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

interface Answers {
  audience: string;
  mood: string;
  time: string;
  avoid: string[];
}

const DEFAULT: Answers = { audience: "any", mood: "any", time: "any", avoid: [] };

type PhWeight = "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
type PhIconComp = React.ComponentType<{ size?: number; weight?: PhWeight; color?: string }>;

const ICON_MAP: Record<string, PhIconComp> = {
  Star, User, Heart, Users, UsersThree,
  Coffee, Lightning, Drop, Television, Sparkle, Smiley,
  Clock, Moon,
};

function QIcon({ name, size = 16, weight = "duotone" }: { name: string; size?: number; weight?: PhWeight }) {
  const Ic = ICON_MAP[name] as PhIconComp | undefined;
  if (!Ic) return null;
  return <Ic size={size} weight={weight} />;
}

function OptionGrid({ options, selected, onSelect }: {
  options: { value: string; label: string; icon?: string }[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="fm-option-grid">
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
    const THRESHOLD = 90;   /* px to accumulate before advancing */
    const COOLDOWN  = 480;  /* ms lockout after each advance */

    const onWheel = (e: WheelEvent) => {
      if (detailOpenRef.current) return;
      const ax = Math.abs(e.deltaX);
      const ay = Math.abs(e.deltaY);
      if (ax < 6 || ay > ax) return;          /* must be predominantly horizontal */
      e.preventDefault();
      const now = Date.now();
      if (now < wCooldown.current) return;     /* still in cooldown */
      const px = e.deltaMode === 1 ? e.deltaX * 16 : e.deltaMode === 2 ? e.deltaX * 100 : e.deltaX;
      wAccum.current += px;
      /* reset accumulator if no wheel events for 180 ms (prevents slow drift) */
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

  const set = (field: keyof Answers, value: string | string[]) =>
    setAnswers((prev) => ({ ...prev, [field]: value }));

  const toggleAvoid = (value: string) => {
    const next = answers.avoid.includes(value)
      ? answers.avoid.filter((v) => v !== value)
      : [...answers.avoid, value];
    set("avoid", next);
  };

  const getPlatforms = (): string[] => {
    try { return JSON.parse(localStorage.getItem("ow-platforms") ?? "[]") as string[]; }
    catch { return []; }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setView("r");          /* slide overlay up immediately — shows skeleton during load */
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

  const handleRefreshCard = async (pick: FocusPick) => {
    try {
      const platforms = getPlatforms();
      const avoidTitles = picks.map((p) => p.title);
      const newPick = await getOneRecommendation(
        platforms.length ? platforms : ["Netflix", "Prime", "Hulu"],
        answers,
        avoidTitles,
      );
      setPicks((prev) => prev.map((p) => (p.id === pick.id ? newPick : p)));
    } catch { /* silently keep existing */ }
  };

  const toggleSave = (pick: FocusPick) =>
    setSaved((prev) => prev.includes(pick.id) ? prev.filter((id) => id !== pick.id) : [...prev, pick.id]);

  const closeDetail = useCallback(() => {
    setIsClosingDetail(true);
    setTimeout(() => { setDetailPick(null); setIsClosingDetail(false); }, 500);
  }, []);

  const handleDetailRefresh = useCallback((pick: FocusPick) => {
    closeDetail();
    setTimeout(() => { void handleRefreshCard(pick); }, 460);
  }, [closeDetail]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fm-page">

      {/* ── Questionnaire — normal doc flow, scrolls with .main ── */}
      <div className="fm-wrap">
        <div className="fm-questionnaire">
          <div className="fm-intro">
            <p className="fm-intro-eyebrow"><Crosshair size={14} weight="duotone" /> Focus Mode</p>
            <h2 className="fm-intro-title">What are you in the mood for?</h2>
            <p className="fm-intro-hint">Everything defaults to Any — just hit the button.</p>
          </div>

          <QSection label="Who's watching?">
            <OptionGrid options={AUDIENCE_OPTIONS} selected={answers.audience} onSelect={(v) => set("audience", v)} />
          </QSection>
          <QSection label="What's your mood?">
            <OptionGrid options={MOOD_OPTIONS} selected={answers.mood} onSelect={(v) => set("mood", v)} />
          </QSection>
          <QSection label="How much time?">
            <OptionGrid options={TIME_OPTIONS} selected={answers.time} onSelect={(v) => set("time", v)} />
          </QSection>
          <QSection label="Anything to avoid?">
            <div className="fm-avoid-chips">
              {AVOID_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`fm-avoid-chip${answers.avoid.includes(opt.value) ? " fm-avoid-chip--on" : ""}`}
                  onClick={() => toggleAvoid(opt.value)}
                >
                  {answers.avoid.includes(opt.value) && <X size={11} weight="bold" />}
                  {opt.label}
                </button>
              ))}
            </div>
          </QSection>

          <button type="button" className="fm-cta" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <span className="fm-spinner" /> : "Find something to watch"}
          </button>
        </div>
      </div>

      {/* ── Results overlay — position:fixed, slides up over questionnaire ── */}
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
          onRefresh={() => handleDetailRefresh(detailPick)}
          onClose={closeDetail}
        />
      )}
    </div>
  );
}
