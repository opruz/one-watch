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
const DUR  = 480;
const BG   = "#080810";

export default function MovieDetailPage({ pick, saved, isClosing, fromRect, onSave, onRefresh, onClose }: Props) {
  const mdpRef     = useRef<HTMLDivElement>(null);
  const heroRef    = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animRef    = useRef<{ heroFrom: string; contentFrom: string } | null>(null);

  /* ── Entry FLIP ── */
  useLayoutEffect(() => {
    const mdpEl     = mdpRef.current;
    const heroEl    = heroRef.current;
    const contentEl = contentRef.current;
    if (!fromRect || !mdpEl || !heroEl || !contentEl) return;

    const heroRect    = heroEl.getBoundingClientRect();
    const contentTop  = contentEl.getBoundingClientRect().top;

    /* Hero: scale + translate from card poster → full hero */
    const sx = fromRect.width  / heroRect.width;
    const sy = fromRect.height / heroRect.height;
    const tx = fromRect.left   - heroRect.left;
    const ty = fromRect.top    - heroRect.top;

    const heroFrom    = `translate(${tx}px,${ty}px) scale(${sx},${sy})`;
    /* Content: slide from just below the card's bottom edge */
    const contentFrom = `translateY(${fromRect.bottom - contentTop}px)`;

    animRef.current = { heroFrom, contentFrom };

    /* ── Instantly set starting state (before paint) ── */
    mdpEl.style.overflow         = "visible";   /* prevent scroll container from clipping the hero during FLIP */
    mdpEl.style.backgroundColor  = "transparent";
    heroEl.style.transition      = "none";
    heroEl.style.transformOrigin = "0 0";
    heroEl.style.transform       = heroFrom;
    contentEl.style.transition   = "none";
    contentEl.style.transform    = contentFrom;
    contentEl.style.opacity      = "0";

    /* ── Animate to final state ── */
    requestAnimationFrame(() => requestAnimationFrame(() => {
      mdpEl.style.transition   = `background-color ${DUR}ms ${EASE}`;
      mdpEl.style.backgroundColor = BG;
      heroEl.style.transition  = `transform ${DUR}ms ${EASE}`;
      heroEl.style.transform   = "none";
      contentEl.style.transition = `transform ${DUR}ms ${EASE}, opacity ${Math.round(DUR * 0.65)}ms ${EASE}`;
      contentEl.style.transform = "none";
      contentEl.style.opacity  = "1";
      /* restore scroll after animation completes */
      setTimeout(() => { mdpEl.style.overflow = ""; }, DUR + 80);
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Exit FLIP ── */
  useEffect(() => {
    const mdpEl     = mdpRef.current;
    const heroEl    = heroRef.current;
    const contentEl = contentRef.current;
    if (!isClosing || !animRef.current || !mdpEl || !heroEl || !contentEl) return;

    const { heroFrom, contentFrom } = animRef.current;
    const dur = DUR - 40;

    mdpEl.style.overflow     = "visible";
    mdpEl.style.transition   = `background-color ${dur}ms ${EASE}`;
    mdpEl.style.backgroundColor = "transparent";
    heroEl.style.transition  = `transform ${dur}ms ${EASE}`;
    heroEl.style.transform   = heroFrom;
    contentEl.style.transition = `transform ${dur}ms ${EASE}, opacity ${Math.round(dur * 0.6)}ms ${EASE}`;
    contentEl.style.transform = contentFrom;
    contentEl.style.opacity  = "0";
  }, [isClosing]);

  const useFlip = !!fromRect;

  return (
    <div
      ref={mdpRef}
      className={`mdp${isClosing ? " mdp--closing" : ""}${useFlip ? " mdp--flip" : ""}`}
    >
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
