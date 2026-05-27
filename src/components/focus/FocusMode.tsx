import { useState } from "react";
import {
  Crosshair, FilmStrip, Television, X, Bookmark,
  Star, User, Heart, Users, UsersThree,
  Coffee, Lightning, Drop, Sparkle, Smiley,
  Clock, Moon,
} from "@phosphor-icons/react";
import {
  FOCUS_PICKS,
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

/* ── Icon helpers ── */
type PhWeight = "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
type PhIconComp = React.ComponentType<{ size?: number; weight?: PhWeight; color?: string }>;

const ICON_MAP: Record<string, PhIconComp> = {
  Star, User, Heart, Users, UsersThree,
  Coffee, Lightning, Drop, Television, Sparkle, Smiley,
  Clock, Moon,
};

function QIcon({ name, size = 16, weight = "duotone" }: {
  name: string;
  size?: number;
  weight?: PhWeight;
}) {
  const Ic = ICON_MAP[name] as PhIconComp | undefined;
  if (!Ic) return null;
  return <Ic size={size} weight={weight} />;
}

/* ── Small sub-components ── */
function OptionGrid({
  options,
  selected,
  onSelect,
}: {
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
              <QIcon
                name={opt.icon}
                size={16}
                weight={selected === opt.value ? "fill" : "duotone"}
              />
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

/* ── Cinematic Poster ── */
function CinematicPoster({ pick }: { pick: FocusPick }) {
  return (
    <div className="fm-poster" style={{ background: pick.posterGradient }}>
      <div className="fm-poster-glow" style={{ background: pick.posterGlow }} />
      <div className="fm-poster-grain" />
      <div className="fm-poster-score">★ {pick.imdb_score}</div>
      <div className="fm-poster-platform" style={{ borderColor: pick.platformColor }}>
        <span style={{ color: pick.platformColor }}>{pick.platform}</span>
      </div>
      <div className="fm-poster-ai-badge">AI Art</div>
    </div>
  );
}

/* ── Result Card ── */
function ResultCard({ pick, onClick }: { pick: FocusPick; onClick: () => void }) {
  return (
    <div
      className="fm-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <CinematicPoster pick={pick} />
      <div className="fm-card-body">
        <p className="fm-card-title">{pick.title}</p>
        <p className="fm-card-meta">{pick.year} · {pick.runtime}</p>
        <div className="fm-card-tags">
          {pick.mood_tags.slice(0, 2).map((tag) => (
            <span key={tag} className="fm-tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Expanded Detail Sheet ── */
function ExpandedSheet({
  pick, onClose, saved, onSave,
}: {
  pick: FocusPick;
  onClose: () => void;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <div className="fm-overlay" onClick={onClose} role="presentation">
      <div
        className="fm-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button type="button" className="fm-close" onClick={onClose} aria-label="Close">
          <X size={18} weight="bold" />
        </button>

        <div className="fm-sheet-poster" style={{ background: pick.posterGradient }}>
          <div className="fm-poster-glow" style={{ background: pick.posterGlow }} />
          <div className="fm-poster-grain" />
          <div className="fm-sheet-poster-content">
            <p className="fm-sheet-poster-type">
              {pick.type === "movie"
                ? <><FilmStrip size={13} weight="bold" /> Film</>
                : <><Television size={13} weight="bold" /> Series</>
              } · {pick.runtime}
            </p>
            <h2 className="fm-sheet-poster-title">{pick.title}</h2>
            <div className="fm-sheet-poster-tags">
              {pick.mood_tags.map((tag) => (
                <span key={tag} className="fm-tag">{tag}</span>
              ))}
            </div>
          </div>
          <div className="fm-poster-score">★ {pick.imdb_score}</div>
        </div>

        <div className="fm-sheet-body">
          <div className="fm-sheet-meta">
            <span>{pick.year}</span>
            <span className="fm-sep">·</span>
            <span style={{ color: pick.platformColor }}>{pick.platform}</span>
          </div>
          <p className="fm-sheet-desc">{pick.description}</p>
          <p className="fm-sheet-why">"{pick.why_this}"</p>
          <div className="fm-sheet-actions">
            <button
              type="button"
              className={`fm-save-btn${saved ? " fm-save-btn--saved" : ""}`}
              onClick={onSave}
            >
              <Bookmark size={16} weight={saved ? "fill" : "regular"} />
              {saved ? "Saved" : "Save for later"}
            </button>
            <button type="button" className="fm-close-btn" onClick={onClose}>
              Not for me
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main FocusMode component ── */
export default function FocusMode() {
  const [answers, setAnswers] = useState<Answers>(DEFAULT);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState<FocusPick | null>(null);
  const [saved, setSaved] = useState<string[]>([]);

  const set = (field: keyof Answers, value: string | string[]) =>
    setAnswers((prev) => ({ ...prev, [field]: value }));

  const toggleAvoid = (value: string) => {
    const next = answers.avoid.includes(value)
      ? answers.avoid.filter((v) => v !== value)
      : [...answers.avoid, value];
    set("avoid", next);
  };

  const handleSubmit = () => {
    setIsLoading(true);
    setHasSearched(false);
    setTimeout(() => {
      setIsLoading(false);
      setHasSearched(true);
    }, 1200);
  };

  const toggleSave = (pick: FocusPick) => {
    setSaved((prev) =>
      prev.includes(pick.id) ? prev.filter((id) => id !== pick.id) : [...prev, pick.id]
    );
  };

  return (
    <div className="fm-wrap">
      {/* Questionnaire */}
      <div className="fm-questionnaire">
        <div className="fm-intro">
          <p className="fm-intro-eyebrow">
            <Crosshair size={14} weight="duotone" /> Focus Mode
          </p>
          <h2 className="fm-intro-title">What are you in the mood for?</h2>
          <p className="fm-intro-hint">
            Everything defaults to Any — just hit the button.
          </p>
        </div>

        <QSection label="Who's watching?">
          <OptionGrid
            options={AUDIENCE_OPTIONS}
            selected={answers.audience}
            onSelect={(v) => set("audience", v)}
          />
        </QSection>

        <QSection label="What's your mood?">
          <OptionGrid
            options={MOOD_OPTIONS}
            selected={answers.mood}
            onSelect={(v) => set("mood", v)}
          />
        </QSection>

        <QSection label="How much time?">
          <OptionGrid
            options={TIME_OPTIONS}
            selected={answers.time}
            onSelect={(v) => set("time", v)}
          />
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

        <button
          type="button"
          className="fm-cta"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? <span className="fm-spinner" /> : "Find something to watch"}
        </button>
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="fm-results">
          <p className="fm-results-label">Finding your picks…</p>
          <div className="fm-cards-row">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="fm-card fm-card--skeleton">
                <div className="fm-skeleton-poster" />
                <div className="fm-card-body">
                  <div className="fm-skeleton-line fm-skeleton-line--80" />
                  <div className="fm-skeleton-line fm-skeleton-line--50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {hasSearched && !isLoading && (
        <div className="fm-results">
          <div className="fm-results-header">
            <p className="fm-results-label">Your picks</p>
            <p className="fm-results-sub">Tap a card to see why it's perfect for tonight</p>
          </div>
          <div className="fm-cards-row">
            {FOCUS_PICKS.map((pick) => (
              <ResultCard key={pick.id} pick={pick} onClick={() => setExpanded(pick)} />
            ))}
          </div>
        </div>
      )}

      {/* Expanded bottom sheet */}
      {expanded && (
        <ExpandedSheet
          pick={expanded}
          onClose={() => setExpanded(null)}
          saved={saved.includes(expanded.id)}
          onSave={() => toggleSave(expanded)}
        />
      )}
    </div>
  );
}
