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

export default function MovieDetailPage({ pick, saved, isClosing, fromRect, onSave, onRefresh, onClose }: Props) {
  const heroRef    = useRef<HTMLDivElement>(null);
  const bodyRef    = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  /* stores entry values so exit can reverse them */
  const fromRef = useRef<{ tx: number; ty: number; clip: string } | null>(null);

  /* ── Entry FLIP ── */
  useLayoutEffect(() => {
    const heroEl    = heroRef.current;
    const bodyEl    = bodyRef.current;
    const contentEl = contentRef.current;
    if (!fromRect || !heroEl || !bodyEl || !contentEl) return;

    const heroRect = heroEl.getBoundingClientRect();

    /*
     * Translate-only (no scale): shift the full-size hero so its bottom aligns
     * with the card's bottom and its horizontal center aligns with the card center.
     * clip-path then reveals only the card-sized window; both animate to their
     * natural states so the image grows from the card outward without distortion.
     */
    const tx = (fromRect.left + fromRect.width * 0.5) - heroRect.width * 0.5;
    const ty = fromRect.bottom - heroRect.height;

    /* Horizontal clip: hide the hero outside the card's width (in element space) */
    const hClip = Math.max(0, heroRect.width * 0.5 - fromRect.width * 0.5);

    /* Vertical top clip: if the hero is taller than the card, clip from the top
       so the visible window starts at the card's top (in element space).
       If the card is taller than the hero, no top clip is needed (vClip = 0). */
    const vClip = Math.max(0, heroRect.height - fromRect.height);

    const CARD_RADIUS = 16; /* match var(--r) */
    const fromClip = `inset(${vClip}px ${hClip}px 0px ${hClip}px round ${CARD_RADIUS}px)`;

    fromRef.current = { tx, ty, clip: fromClip };

    /* Instant "first" state — runs before browser paints */
    heroEl.style.transition = "none";
    heroEl.style.transform  = `translate(${tx}px,${ty}px)`;
    heroEl.style.clipPath   = fromClip;
    bodyEl.style.transition = "none";
    bodyEl.style.opacity    = "0";
    contentEl.style.transition = "none";
    contentEl.style.opacity  = "0";
    contentEl.style.transform = "translateY(-48px)";

    /* Animate to final state after first paint */
    requestAnimationFrame(() => requestAnimationFrame(() => {
      heroEl.style.transition = `transform ${DUR}ms ${EASE}, clip-path ${DUR}ms ${EASE}`;
      heroEl.style.transform  = "none";
      heroEl.style.clipPath   = "inset(0px 0px 0px 0px round 0px)";
      bodyEl.style.transition  = `opacity ${DUR}ms ${EASE}`;
      bodyEl.style.opacity     = "1";
      const delay = Math.round(DUR * 0.2);
      contentEl.style.transition = `opacity ${Math.round(DUR * 0.7)}ms ${EASE} ${delay}ms, transform ${DUR}ms ${EASE} ${delay}ms`;
      contentEl.style.opacity  = "1";
      contentEl.style.transform = "none";
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Exit FLIP ── */
  useEffect(() => {
    const heroEl    = heroRef.current;
    const bodyEl    = bodyRef.current;
    const contentEl = contentRef.current;
    if (!isClosing || !fromRef.current || !heroEl || !bodyEl || !contentEl) return;

    const { tx, ty, clip } = fromRef.current;
    const dur = DUR - 50;

    heroEl.style.transition = `transform ${dur}ms ${EASE}, clip-path ${dur}ms ${EASE}`;
    heroEl.style.transform  = `translate(${tx}px,${ty}px)`;
    heroEl.style.clipPath   = clip;
    bodyEl.style.transition  = `opacity ${dur}ms ${EASE}`;
    bodyEl.style.opacity     = "0";
    contentEl.style.transition = `opacity ${Math.round(dur * 0.5)}ms ${EASE}`;
    contentEl.style.opacity  = "0";
  }, [isClosing]);

  const useFlip = !!fromRect;

  return (
    <div className={`mdp${isClosing ? " mdp--closing" : ""}${useFlip ? " mdp--flip" : ""}`}>

      {/* Hero — position: fixed, so FLIP transforms are never clipped */}
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

      {/* Body — scrollable, sits behind the hero, fades in during FLIP */}
      <div className="mdp-body" ref={bodyRef}>
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
    </div>
  );
}
