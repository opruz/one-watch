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
  const flyRef     = useRef<HTMLDivElement>(null);
  const savedRect  = useRef<DOMRect | null>(null);

  /* ── Entry ── */
  useLayoutEffect(() => {
    const flyEl     = flyRef.current;
    const bodyEl    = bodyRef.current;
    const contentEl = contentRef.current;
    const heroEl    = heroRef.current;
    if (!fromRect || !flyEl || !bodyEl || !contentEl || !heroEl) return;

    savedRect.current = fromRect;
    const { width: heroW, height: heroH } = heroEl.getBoundingClientRect();

    /* Flying element starts exactly where the card poster is */
    flyEl.style.transition   = "none";
    flyEl.style.top          = `${fromRect.top}px`;
    flyEl.style.left         = `${fromRect.left}px`;
    flyEl.style.width        = `${fromRect.width}px`;
    flyEl.style.height       = `${fromRect.height}px`;
    flyEl.style.borderRadius = "16px";
    flyEl.style.opacity      = "1";

    /* Real hero hidden until fly completes */
    heroEl.style.transition = "none";
    heroEl.style.opacity    = "0";

    /* Body fades in alongside the fly; content waits */
    bodyEl.style.transition  = "none";
    bodyEl.style.opacity     = "0";
    contentEl.style.transition = "none";
    contentEl.style.opacity  = "0";
    contentEl.style.transform = "translateY(-32px)";

    requestAnimationFrame(() => requestAnimationFrame(() => {
      /* Fly from card → hero bounds */
      flyEl.style.transition = [
        `top ${DUR}ms ${EASE}`,
        `left ${DUR}ms ${EASE}`,
        `width ${DUR}ms ${EASE}`,
        `height ${DUR}ms ${EASE}`,
        `border-radius ${DUR}ms ${EASE}`,
      ].join(", ");
      flyEl.style.top          = "0";
      flyEl.style.left         = "0";
      flyEl.style.width        = `${heroW}px`;
      flyEl.style.height       = `${heroH}px`;
      flyEl.style.borderRadius = "0";

      bodyEl.style.transition = `opacity ${DUR}ms ${EASE}`;
      bodyEl.style.opacity    = "1";

      /* Once fly reaches hero: crossfade fly→hero, reveal content */
      setTimeout(() => {
        flyEl.style.transition = "opacity 150ms ease";
        flyEl.style.opacity    = "0";

        heroEl.style.transition = "opacity 150ms ease";
        heroEl.style.opacity    = "1";

        contentEl.style.transition = `opacity 300ms ease 30ms, transform 400ms ${EASE} 30ms`;
        contentEl.style.opacity    = "1";
        contentEl.style.transform  = "none";
      }, DUR + 20);
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Exit ── */
  useEffect(() => {
    const flyEl     = flyRef.current;
    const bodyEl    = bodyRef.current;
    const contentEl = contentRef.current;
    const heroEl    = heroRef.current;
    if (!isClosing || !savedRect.current || !flyEl || !bodyEl || !contentEl || !heroEl) return;

    const from     = savedRect.current;
    const heroRect = heroEl.getBoundingClientRect();
    const dur      = DUR - 50;

    /* Snap fly to hero position, hide real hero */
    flyEl.style.transition   = "none";
    flyEl.style.top          = "0";
    flyEl.style.left         = "0";
    flyEl.style.width        = `${heroRect.width}px`;
    flyEl.style.height       = `${heroRect.height}px`;
    flyEl.style.borderRadius = "0";
    flyEl.style.opacity      = "1";

    heroEl.style.transition = "none";
    heroEl.style.opacity    = "0";

    contentEl.style.transition = `opacity ${Math.round(dur * 0.4)}ms ease`;
    contentEl.style.opacity    = "0";
    bodyEl.style.transition    = `opacity ${dur}ms ${EASE}`;
    bodyEl.style.opacity       = "0";

    requestAnimationFrame(() => requestAnimationFrame(() => {
      /* Fly back to card position */
      flyEl.style.transition = [
        `top ${dur}ms ${EASE}`,
        `left ${dur}ms ${EASE}`,
        `width ${dur}ms ${EASE}`,
        `height ${dur}ms ${EASE}`,
        `border-radius ${dur}ms ${EASE}`,
      ].join(", ");
      flyEl.style.top          = `${from.top}px`;
      flyEl.style.left         = `${from.left}px`;
      flyEl.style.width        = `${from.width}px`;
      flyEl.style.height       = `${from.height}px`;
      flyEl.style.borderRadius = "16px";
    }));
  }, [isClosing]);

  const useFlip = !!fromRect;

  return (
    <div className={`mdp${isClosing ? " mdp--closing" : ""}${useFlip ? " mdp--flip" : ""}`}>

      {/* Flying card — same image/gradient as gallery card; expands from card→hero then crossfades */}
      {useFlip && (
        <div
          className="mdp-fly"
          ref={flyRef}
          style={pick.thumbnailUrl
            ? { backgroundImage: `url(${pick.thumbnailUrl})` }
            : { background: pick.posterGradient }
          }
        />
      )}

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

      {/* Body */}
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
