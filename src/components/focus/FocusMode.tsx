import { useEffect, useRef, useState } from "react";
import {
  Crosshair, Television, X, Bookmark,
  Star, User, Heart, Users, UsersThree,
  Coffee, Lightning, Drop, Sparkle, Smiley,
  Clock, Moon,
} from "@phosphor-icons/react";
import { getRecommendations, getOneRecommendation } from "../../lib/claude";
import {
  FOCUS_PICKS,
  PLATFORM_LOGOS,
  AUDIENCE_OPTIONS,
  MOOD_OPTIONS,
  TIME_OPTIONS,
  AVOID_OPTIONS,
  type FocusPick,
} from "../../data/focusData";

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
function GalleryCard({ pick, offset, isActive, isExpanded, onClick, saved, onSave, onRefresh }: {
  pick: FocusPick; offset: number; isActive: boolean; isExpanded: boolean;
  onClick: () => void; saved: boolean; onSave: () => void; onRefresh: () => void;
}) {
  const abs     = Math.abs(offset);
  const scale   = Math.max(0.78, 1 - abs * 0.1);
  const blur    = abs * 4;
  const opacity = Math.max(0.5, 1 - abs * 0.28);
  const step    = 870;

  return (
    <div
      className={`fm-gallery-slot${isActive ? " fm-gallery-slot--active" : ""}`}
      style={{ transform: `translateX(calc(-50% + ${offset * step}px)) translateY(-50%)`, zIndex: isExpanded ? 20 : 10 - abs }}
      onClick={onClick}
    >
      <div
        className={`fm-gallery-card${isActive ? " fm-gallery-card--active" : ""}${isExpanded ? " fm-gallery-card--expanded" : ""}`}
        style={{
          transform: `scale(${scale})`,
          filter: blur > 0 ? `blur(${blur}px)` : "none",
          opacity,
        }}
      >
        {/* Poster — always 16:9, contains all absolutely-positioned layers */}
        <div className="fm-gallery-poster">
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
          {isExpanded && <div className="fm-gallery-expand-fade" />}
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

        {/* Expandable details panel */}
        <div className={`fm-gallery-details-wrap${isExpanded ? " fm-gallery-details-wrap--open" : ""}`}>
          <div>
            <div className="fm-gallery-details" onClick={(e) => e.stopPropagation()}>
              <div className="fm-gallery-details-content">
                <p className="fm-gallery-details-why">"{pick.why_this}"</p>
                <div className="fm-gallery-details-actions">
                  {pick.watchPlatforms && pick.watchPlatforms.length > 0 && (
                    <div className="fm-gallery-watch">
                      {pick.watchPlatforms.map((plat) => (
                        <button key={plat} type="button" className="fm-watch-btn">
                          <img src={PLATFORM_LOGOS[plat] ?? ""} alt={plat} className="fm-watch-btn-logo" />
                          <span>Watch now</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="fm-gallery-details-btns">
                    <button
                      type="button"
                      className={`fm-save-btn${saved ? " fm-save-btn--saved" : ""}`}
                      onClick={(e) => { e.stopPropagation(); onSave(); }}
                    >
                      <Bookmark size={15} weight={saved ? "fill" : "regular"} />
                      {saved ? "Saved" : "Save for later"}
                    </button>
                    <button
                      type="button"
                      className="fm-close-btn"
                      onClick={(e) => { e.stopPropagation(); onRefresh(); }}
                    >
                      Not for me — try another
                    </button>
                  </div>
                </div>
              </div>
              {pick.posterUrl && (
                <div className="fm-gallery-details-poster">
                  <img src={pick.posterUrl} alt={`${pick.title} poster`} draggable={false} />
                </div>
              )}
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
    setExpandedId(null);
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
          {expandedId && (
            <div className="fm-gallery-backdrop" onClick={() => setExpandedId(null)} />
          )}
          <div className="fm-gallery">
            {picks.map((pick, i) => (
              <GalleryCard
                key={pick.id}
                pick={pick}
                offset={i - activeIdx}
                isActive={i === activeIdx}
                isExpanded={i === activeIdx && expandedId === pick.id}
                onClick={() => {
                  if (i === activeIdx) {
                    setExpandedId((prev) => prev === pick.id ? null : pick.id);
                  } else {
                    setActiveIdx(i);
                    setExpandedId(null);
                  }
                }}
                saved={saved.includes(pick.id)}
                onSave={() => toggleSave(pick)}
                onRefresh={() => { setExpandedId(null); void handleRefreshCard(pick); }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
