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
import MovieDetailPage from "./MovieDetailPage";

interface Answers {
  audience: string;
  mood: string;
  time: string;
  avoid: string[];
}

const DEFAULT: Answers = { audience: "any", mood: "any", time: "any", avoid: [] };

/* Smooth-scroll `target` to the center of its scroll container over `ms` milliseconds. */
function smoothScrollToCenter(target: HTMLElement, ms = 1100) {
  const container = target.closest(".main") as HTMLElement | null;
  if (!container) { target.scrollIntoView({ behavior: "smooth", block: "center" }); return; }

  const ease = (t: number) => t < 0.5 ? 8*t*t*t*t : 1 - Math.pow(-2*t+2, 4)/2;

  const start   = container.scrollTop;
  const targetTop = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
  const end     = targetTop - (container.clientHeight - target.clientHeight) / 2;
  const t0      = performance.now();

  const tick = (now: number) => {
    const p = Math.min((now - t0) / ms, 1);
    container.scrollTop = start + (end - start) * ease(p);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function smoothScrollToTop(target: HTMLElement, ms = 1100) {
  const container = target.closest(".main") as HTMLElement | null;
  if (!container) { target.scrollIntoView({ behavior: "smooth", block: "start" }); return; }

  const ease  = (t: number) => t < 0.5 ? 8*t*t*t*t : 1 - Math.pow(-2*t+2, 4)/2;
  const start = container.scrollTop;
  const end   = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
  const t0    = performance.now();

  const tick = (now: number) => {
    const p = Math.min((now - t0) / ms, 1);
    container.scrollTop = start + (end - start) * ease(p);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

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
function GalleryCard({ pick, offset, isActive, onClick }: {
  pick: FocusPick; offset: number; isActive: boolean;
  onClick: (rect: DOMRect | null) => void;
}) {
  const posterRef = useRef<HTMLDivElement>(null);
  const abs     = Math.abs(offset);
  const scale   = Math.max(0.78, 1 - abs * 0.1);
  const blur    = abs * 4;
  const opacity = Math.max(0.5, 1 - abs * 0.28);
  const step    = 870;

  return (
    <div
      className={`fm-gallery-slot${isActive ? " fm-gallery-slot--active" : ""}`}
      style={{ transform: `translateX(calc(-50% + ${offset * step}px)) translateY(-50%)`, zIndex: 10 - abs }}
      onClick={() => onClick(isActive ? (posterRef.current?.getBoundingClientRect() ?? null) : null)}
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
            <div className="fm-gallery-panel">
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
  const [answers, setAnswers]       = useState<Answers>(DEFAULT);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const [picks, setPicks]           = useState<FocusPick[]>(FOCUS_PICKS);
  const [activeIdx, setActiveIdx]   = useState(0);
  const [detailPick, setDetailPick] = useState<FocusPick | null>(null);
  const [fromRect, setFromRect]     = useState<DOMRect | null>(null);
  const [isClosingDetail, setIsClosingDetail] = useState(false);
  const [saved, setSaved]           = useState<string[]>([]);
  const questionnaireRef            = useRef<HTMLDivElement>(null);
  const resultsRef                  = useRef<HTMLDivElement>(null);

  const set = (field: keyof Answers, value: string | string[]) =>
    setAnswers((prev) => ({ ...prev, [field]: value }));

  const toggleAvoid = (value: string) => {
    const next = answers.avoid.includes(value)
      ? answers.avoid.filter((v) => v !== value)
      : [...answers.avoid, value];
    set("avoid", next);
  };

  useEffect(() => {
    if (hasSearched && !isLoading) {
      setActiveIdx(0);
      if (resultsRef.current) smoothScrollToCenter(resultsRef.current);
    }
  }, [hasSearched, isLoading]);

  const getPlatforms = (): string[] => {
    try { return JSON.parse(localStorage.getItem("ow-platforms") ?? "[]") as string[]; }
    catch { return []; }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setHasSearched(false);
    setDetailPick(null);
    try {
      const platforms = getPlatforms();
      const recs = await getRecommendations(platforms.length ? platforms : ["Netflix", "Prime", "Hulu"], answers);
      setPicks(recs);
    } catch {
      setPicks(FOCUS_PICKS);
    }
    setIsLoading(false);
    setHasSearched(true);
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
    setTimeout(() => { setDetailPick(null); setIsClosingDetail(false); }, 400);
  }, []);

  const handleDetailRefresh = useCallback((pick: FocusPick) => {
    closeDetail();
    setTimeout(() => { void handleRefreshCard(pick); }, 420);
  }, [closeDetail]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToQuestionnaire = () => {
    if (questionnaireRef.current) smoothScrollToTop(questionnaireRef.current);
  };

  return (
    <div className="fm-page">

      {/* ── Questionnaire ── */}
      <div className="fm-wrap" ref={questionnaireRef}>
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

      {/* ── Loading skeleton ── */}
      {isLoading && (
        <div className="fm-gallery-section fm-gallery-section--loading">
          <div className="fm-gallery-skeleton" />
        </div>
      )}

      {/* ── Results gallery ── */}
      {hasSearched && !isLoading && (
        <div ref={resultsRef} className="fm-gallery-section">
          <div className="fm-gallery-header">
            <div>
              <p className="fm-results-label">Your picks</p>
              <p className="fm-results-sub">{activeIdx + 1} of {picks.length} · tap active card for details</p>
            </div>
            <button type="button" className="fm-change-answers-btn" onClick={scrollToQuestionnaire}>
              ↑ Change your answers
            </button>
          </div>
          <div className="fm-gallery">
            {picks.map((pick, i) => (
              <GalleryCard
                key={pick.id}
                pick={pick}
                offset={i - activeIdx}
                isActive={i === activeIdx}
                onClick={(rect) => {
                  if (i === activeIdx) { setDetailPick(pick); setFromRect(rect); }
                  else setActiveIdx(i);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {(detailPick || isClosingDetail) && detailPick && (
        <MovieDetailPage
          pick={detailPick}
          saved={saved.includes(detailPick.id)}
          isClosing={isClosingDetail}
          fromRect={fromRect}
          onSave={() => toggleSave(detailPick)}
          onRefresh={() => handleDetailRefresh(detailPick)}
          onClose={closeDetail}
        />
      )}
    </div>
  );
}
