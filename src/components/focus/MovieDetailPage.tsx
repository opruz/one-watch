import { ArrowLeft, Bookmark } from "@phosphor-icons/react";
import { type FocusPick, PLATFORM_LOGOS } from "../../data/focusData";

interface Props {
  pick: FocusPick;
  saved: boolean;
  isClosing: boolean;
  onSave: () => void;
  onRefresh: () => void;
  onClose: () => void;
}

export default function MovieDetailPage({ pick, saved, isClosing, onSave, onRefresh, onClose }: Props) {
  return (
    <div className={`mdp${isClosing ? " mdp--closing" : ""}`}>

      {/* Hero — same image as card, scrim absent so photo shows fully */}
      <div className="mdp-hero">
        {pick.thumbnailUrl ? (
          <div className="mdp-hero-bg" style={{ backgroundImage: `url(${pick.thumbnailUrl})` }} />
        ) : (
          <div className="mdp-hero-bg" style={{ background: pick.posterGradient }}>
            <div className="mdp-hero-glow" style={{ background: pick.posterGlow }} />
          </div>
        )}
        <div className="mdp-hero-fade" />
        <button type="button" className="mdp-back" onClick={onClose}>
          <ArrowLeft size={15} weight="bold" />
          Back
        </button>
      </div>

      {/* Content — on dark page background below the hero */}
      <div className="mdp-content">
        <div className="mdp-content-main">
          <div className="mdp-content-text">
            {pick.logoUrl ? (
              <img src={pick.logoUrl} alt={pick.title} className="mdp-logo" draggable={false} />
            ) : (
              <h1 className="mdp-title">{pick.title}</h1>
            )}
            <div className="mdp-tags">
              {pick.mood_tags.map((tag) => <span key={tag} className="fm-tag">{tag}</span>)}
            </div>
            <p className="mdp-meta">{pick.year} · {pick.runtime} · ★ {pick.imdb_score}</p>
            <p className="mdp-desc">{pick.description}</p>
            <p className="mdp-why">"{pick.why_this}"</p>
            <div className="mdp-actions">
              {pick.watchPlatforms && pick.watchPlatforms.length > 0 && (
                <div className="mdp-watch">
                  {pick.watchPlatforms.map((plat) => (
                    <button key={plat} type="button" className="fm-watch-btn">
                      <img src={PLATFORM_LOGOS[plat] ?? ""} alt={plat} className="fm-watch-btn-logo" />
                      <span>Watch now</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="mdp-btns">
                <button
                  type="button"
                  className={`fm-save-btn${saved ? " fm-save-btn--saved" : ""}`}
                  onClick={onSave}
                >
                  <Bookmark size={16} weight={saved ? "fill" : "regular"} />
                  {saved ? "Saved" : "Save for later"}
                </button>
                <button type="button" className="fm-close-btn" onClick={onRefresh}>
                  Not for me — try another
                </button>
              </div>
            </div>
          </div>
          {pick.posterUrl && (
            <div className="mdp-poster">
              <img src={pick.posterUrl} alt={`${pick.title} poster`} draggable={false} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
