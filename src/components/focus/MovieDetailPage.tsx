import { useEffect, useLayoutEffect, useRef } from "react";
import { ArrowLeft, Bookmark } from "@phosphor-icons/react";
import { type FocusPick, PLATFORM_LOGOS } from "../../data/focusData";

interface Props {
  pick: FocusPick;
  saved: boolean;
  isClosing: boolean;
  fromRect: DOMRect | null;
  onSave: () => void;
  onRefresh: () => void;
  onClose: () => void;
}

const EASE = "cubic-bezier(0.4,0,0.2,1)";
const DUR  = 420;

export default function MovieDetailPage({ pick, saved, isClosing, fromRect, onSave, onRefresh, onClose }: Props) {
  const heroRef    = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animRef    = useRef<{ heroFrom: string; contentFrom: string } | null>(null);

  /* ── Entry FLIP ── */
  useLayoutEffect(() => {
    if (!fromRect || !heroRef.current || !contentRef.current) return;

    const heroEl    = heroRef.current;
    const contentEl = contentRef.current;
    const heroRect  = heroEl.getBoundingClientRect();

    /* Scale/translate hero from card poster rect → hero rect */
    const sx = fromRect.width  / heroRect.width;
    const sy = fromRect.height / heroRect.height;
    const tx = fromRect.left   - heroRect.left;
    const ty = fromRect.top    - heroRect.top;

    const heroFrom    = `translate(${tx}px,${ty}px) scale(${sx},${sy})`;
    const contentFrom = `translateY(${fromRect.top + fromRect.height * 0.5 - contentEl.getBoundingClientRect().top}px)`;

    animRef.current = { heroFrom, contentFrom };

    /* Set starting position instantly */
    heroEl.style.transformOrigin    = "0 0";
    heroEl.style.transform          = heroFrom;
    heroEl.style.opacity            = "0.85";
    contentEl.style.transform       = contentFrom;
    contentEl.style.opacity         = "0";
    contentEl.style.transition      = "none";

    requestAnimationFrame(() => requestAnimationFrame(() => {
      heroEl.style.transition    = `transform ${DUR}ms ${EASE}, opacity ${DUR}ms ${EASE}`;
      contentEl.style.transition = `transform ${DUR}ms ${EASE}, opacity ${DUR}ms ${EASE}`;

      heroEl.style.transform    = "translate(0,0) scale(1,1)";
      heroEl.style.opacity      = "1";
      contentEl.style.transform = "translateY(0)";
      contentEl.style.opacity   = "1";
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Exit FLIP ── */
  useEffect(() => {
    if (!isClosing || !animRef.current || !heroRef.current || !contentRef.current) return;

    const heroEl    = heroRef.current;
    const contentEl = contentRef.current;
    const { heroFrom, contentFrom } = animRef.current;

    heroEl.style.transition    = `transform ${DUR - 30}ms ${EASE}, opacity ${DUR - 30}ms ${EASE}`;
    contentEl.style.transition = `transform ${DUR - 30}ms ${EASE}, opacity ${DUR - 30}ms ${EASE}`;

    heroEl.style.transform    = heroFrom;
    heroEl.style.opacity      = "0.85";
    contentEl.style.transform = contentFrom;
    contentEl.style.opacity   = "0";
  }, [isClosing]);

  const useFlip = !!fromRect;

  return (
    <div className={`mdp${isClosing ? " mdp--closing" : ""}${useFlip ? " mdp--flip" : ""}`}>

      {/* Hero */}
      <div className="mdp-hero" ref={heroRef}>
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

      {/* Content */}
      <div className="mdp-content" ref={contentRef}>
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
