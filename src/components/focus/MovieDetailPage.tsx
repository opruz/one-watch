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
  const scrimRef   = useRef<HTMLDivElement>(null);
  const blendRef   = useRef<HTMLDivElement>(null);
  const savedRect  = useRef<DOMRect | null>(null);

  /* ── Entry ── */
  useLayoutEffect(() => {
    const flyEl     = flyRef.current;
    const scrimEl   = scrimRef.current;
    const blendEl   = blendRef.current;
    const bodyEl    = bodyRef.current;
    const contentEl = contentRef.current;
    const heroEl    = heroRef.current;
    if (!fromRect || !flyEl || !scrimEl || !blendEl || !bodyEl || !contentEl || !heroEl) return;

    savedRect.current = fromRect;
    const { width: heroW, height: heroH } = heroEl.getBoundingClientRect();

    /* Flying card starts at card's exact bounds */
    flyEl.style.transition   = "none";
    flyEl.style.top          = `${fromRect.top}px`;
    flyEl.style.left         = `${fromRect.left}px`;
    flyEl.style.width        = `${fromRect.width}px`;
    flyEl.style.height       = `${fromRect.height}px`;
    flyEl.style.borderRadius = "16px";
    flyEl.style.opacity      = "1";

    /* Scrim starts fully opaque (card darkness) */
    scrimEl.style.transition = "none";
    scrimEl.style.opacity    = "1";

    /* Blend gradient starts invisible — will fade in over the image */
    blendEl.style.transition = "none";
    blendEl.style.opacity    = "0";

    /* Hero hidden until fly finishes */
    heroEl.style.transition = "none";
    heroEl.style.opacity    = "0";

    /* Body stays at natural position, just invisible */
    bodyEl.style.transition = "none";
    bodyEl.style.opacity    = "0";
    bodyEl.style.overflow   = "hidden"; /* clip content above body's top edge during animation */

    /* Content slides from card's Y into the body area */
    const contentOffset = fromRect.top - heroH;
    contentEl.style.transition = "none";
    contentEl.style.transform  = `translateY(${contentOffset}px)`;
    contentEl.style.opacity    = "0";

    requestAnimationFrame(() => requestAnimationFrame(() => {
      /* Fly expands card → hero bounds */
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

      /* Card scrim fades out as image fills hero */
      scrimEl.style.transition = `opacity ${DUR}ms ${EASE}`;
      scrimEl.style.opacity    = "0";

      /* Blend gradient fades in over the expanding image from the very start */
      blendEl.style.transition = `opacity ${DUR}ms ${EASE}`;
      blendEl.style.opacity    = "1";

      /* Body background fades in at its natural position below hero */
      bodyEl.style.transition = `opacity ${DUR}ms ${EASE}`;
      bodyEl.style.opacity    = "1";

      /* Content slides down from card's Y into the body, slightly delayed */
      const cDelay = Math.round(DUR * 0.15);
      const cDur   = DUR - cDelay;
      contentEl.style.transition = `transform ${cDur}ms ${EASE} ${cDelay}ms, opacity ${cDur}ms ease ${cDelay}ms`;
      contentEl.style.transform  = "none";
      contentEl.style.opacity    = "1";

      /* Crossfade fly → real hero once fly reaches bounds */
      setTimeout(() => {
        flyEl.style.transition  = "opacity 180ms ease";
        flyEl.style.opacity     = "0";
        heroEl.style.transition = "opacity 180ms ease";
        heroEl.style.opacity    = "1";
        bodyEl.style.overflow   = ""; /* restore scrolling */
      }, DUR + 20);
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Exit ── */
  useEffect(() => {
    const flyEl     = flyRef.current;
    const scrimEl   = scrimRef.current;
    const blendEl   = blendRef.current;
    const bodyEl    = bodyRef.current;
    const contentEl = contentRef.current;
    const heroEl    = heroRef.current;
    if (!isClosing || !savedRect.current || !flyEl || !scrimEl || !blendEl || !bodyEl || !contentEl || !heroEl) return;

    const from          = savedRect.current;
    const heroRect      = heroEl.getBoundingClientRect();
    const dur           = DUR - 50;
    const contentOffset = from.top - heroRect.height;

    /* Snap fly to hero position; hide real hero; scrim invisible */
    flyEl.style.transition   = "none";
    flyEl.style.top          = "0";
    flyEl.style.left         = "0";
    flyEl.style.width        = `${heroRect.width}px`;
    flyEl.style.height       = `${heroRect.height}px`;
    flyEl.style.borderRadius = "0";
    flyEl.style.opacity      = "1";

    scrimEl.style.transition = "none";
    scrimEl.style.opacity    = "0";

    heroEl.style.transition = "none";
    heroEl.style.opacity    = "0";

    bodyEl.style.overflow = "hidden";

    requestAnimationFrame(() => requestAnimationFrame(() => {
      /* Fly shrinks back to card */
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

      /* Scrim fades back in so fly looks like the gallery card */
      scrimEl.style.transition = `opacity ${dur}ms ${EASE}`;
      scrimEl.style.opacity    = "1";

      /* Blend fades out so image is clean as fly shrinks */
      blendEl.style.transition = `opacity ${dur}ms ${EASE}`;
      blendEl.style.opacity    = "0";

      /* Body fades out */
      bodyEl.style.transition = `opacity ${dur}ms ${EASE}`;
      bodyEl.style.opacity    = "0";

      /* Content slides back up toward card Y while fading */
      contentEl.style.transition = `transform ${dur}ms ${EASE}, opacity ${Math.round(dur * 0.4)}ms ease`;
      contentEl.style.transform  = `translateY(${contentOffset}px)`;
      contentEl.style.opacity    = "0";
    }));
  }, [isClosing]);

  const useFlip = !!fromRect;

  return (
    <div className={`mdp${isClosing ? " mdp--closing" : ""}${useFlip ? " mdp--flip" : ""}`}>

      {/* Blend gradient — fades in over the fly/hero from animation start */}
      {useFlip && <div className="mdp-blend" ref={blendRef} />}

      {/* Flying card — expands from card bounds to hero, then crossfades out */}
      {useFlip && (
        <div
          className="mdp-fly"
          ref={flyRef}
          style={pick.thumbnailUrl
            ? { backgroundImage: `url(${pick.thumbnailUrl})` }
            : { background: pick.posterGradient }
          }
        >
          <div className="mdp-fly-scrim" ref={scrimRef} />
        </div>
      )}

      {/* Hero — fades in after fly animation completes */}
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

      {/* Body — fades in at natural position below hero */}
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
