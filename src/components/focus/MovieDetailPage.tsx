import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Bookmark, FilmStrip, Star } from "@phosphor-icons/react";
import { type FocusPick, PLATFORM_LOGOS } from "../../data/focusData";

export type SnapRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

interface Props {
  pick: FocusPick;
  saved: boolean;
  isClosing: boolean;
  fromRect: SnapRect | null;
  fromPanelRect: SnapRect | null;
  onSave: () => void;
  onRefresh: () => void;
  onClose: () => void;
}

const EASE = "cubic-bezier(0.4,0,0.2,1)";
const DUR  = 520;
const CARD_RADIUS = "var(--r)";
const FLY_ACTIVE_BORDER = "rgba(255, 255, 255, 0.30)";
const FLY_ACTIVE_SHADOW = "var(--glass-highlight), 0 20px 56px rgba(0, 0, 0, 0.48)";

function flyTransitionProps(dur: number) {
  return [
    `top ${dur}ms ${EASE}`,
    `left ${dur}ms ${EASE}`,
    `width ${dur}ms ${EASE}`,
    `height ${dur}ms ${EASE}`,
    `border-radius ${dur}ms ${EASE}`,
    `border-color ${dur}ms ${EASE}`,
    `box-shadow ${dur}ms ${EASE}`,
  ].join(", ");
}

const PLACEHOLDER_CAST = [
  "Jordan Smith",
  "Riley Chen",
  "Morgan Lee",
  "Casey Wong",
  "Alex Rivera",
];

const PLACEHOLDER_COLLECTIONS = [
  { name: "Late Night Picks",    count: 8,  posters: ["/knives-out-poster.jpg", "/sixth-sense-poster.jpeg", "/baby-driver-poster.jpg"] },
  { name: "Must Watch Again",    count: 14, posters: ["/eeaao-poster.jpg", "/severance-poster.webp", "/lovely-bones-poster.jpg"] },
  { name: "Shared with Friends", count: 5,  posters: ["/saltburn-poster.jpg", "/sheep-detectives-poster.jpg", "/knives-out-poster.jpg"] },
];

function CardText({ pick, tagLimit }: { pick: FocusPick; tagLimit?: number }) {
  const tags = tagLimit ? pick.mood_tags.slice(0, tagLimit) : pick.mood_tags;
  return (
    <>
      {pick.logoUrl ? (
        <img src={pick.logoUrl} alt={pick.title} className="fm-gallery-logo" draggable={false} />
      ) : (
        <h3 className="fm-gallery-title">{pick.title}</h3>
      )}
      <div className="fm-gallery-tags">
        {tags.map((tag) => <span key={tag} className="fm-tag">{tag}</span>)}
      </div>
      <p className="fm-gallery-meta">{pick.year} · {pick.runtime}</p>
      <p className="fm-gallery-desc">{pick.description}</p>
    </>
  );
}

function fadeIn(el: HTMLElement | null, delay = 0) {
  if (!el) return;
  el.style.transition = `opacity 320ms ${EASE}${delay ? ` ${delay}ms` : ""}`;
  el.style.opacity    = "1";
}

export default function MovieDetailPage({
  pick, saved, isClosing, fromRect, fromPanelRect, onSave, onRefresh, onClose,
}: Props) {
  const scrollRef      = useRef<HTMLDivElement>(null);
  const heroRef        = useRef<HTMLDivElement>(null);
  const contentTextRef = useRef<HTMLDivElement>(null);
  const revealRef      = useRef<HTMLDivElement>(null);
  const posterRef      = useRef<HTMLDivElement>(null);
  const flyRef         = useRef<HTMLDivElement>(null);
  const scrimRef       = useRef<HTMLDivElement>(null);
  const detailFadeRef  = useRef<HTMLDivElement>(null);
  const heroFadeRef    = useRef<HTMLDivElement>(null);
  const flyTextRef     = useRef<HTMLDivElement>(null);
  const savedRect      = useRef<SnapRect | null>(null);
  const savedPanelRect = useRef<SnapRect | null>(null);
  const timersRef      = useRef<ReturnType<typeof setTimeout>[]>([]);

  const panelRect = fromPanelRect ?? fromRect;
  const useFlip = !!fromRect && !!panelRect;
  const isPhoto = !!pick.thumbnailUrl;
  const cast = pick.cast ?? PLACEHOLDER_CAST;


  /* ── Entry ── */
  useLayoutEffect(() => {
    if (!useFlip) return;

    const flyEl         = flyRef.current;
    const scrimEl       = scrimRef.current;
    const detailFadeEl  = detailFadeRef.current;
    const heroFadeEl    = heroFadeRef.current;
    const scrollEl      = scrollRef.current;
    const contentTextEl = contentTextRef.current;
    const heroEl        = heroRef.current;
    const flyTextEl     = flyTextRef.current;
    if (!fromRect || !flyEl || !scrimEl || !detailFadeEl || !scrollEl || !contentTextEl || !heroEl || !flyTextEl) return;

    savedRect.current      = fromRect;
    savedPanelRect.current = fromPanelRect;

    scrollEl.scrollTop = 0;
    scrollEl.querySelectorAll<HTMLElement>(".mdp-deferred").forEach((el) => {
      el.style.transition = "none";
      el.style.opacity    = "0";
    });
    scrollEl.querySelectorAll<HTMLElement>(".mdp-pill, .mdp-platform-btn").forEach((btn) => {
      btn.style.transition = "none";
      btn.style.transform  = "translateY(14px)";
    });
    scrollEl.querySelectorAll<HTMLElement>(".mdp-poster, .mdp-aside").forEach((el) => {
      el.style.transition = "none";
      el.style.transform  = "translateY(14px)";
    });

    flyEl.style.transition   = "none";
    flyEl.style.top          = `${fromRect.top}px`;
    flyEl.style.left         = `${fromRect.left}px`;
    flyEl.style.width        = `${fromRect.width}px`;
    flyEl.style.height       = `${fromRect.height}px`;
    flyEl.style.borderRadius = CARD_RADIUS;
    flyEl.style.background   = "transparent";
    flyEl.style.borderColor  = FLY_ACTIVE_BORDER;
    flyEl.style.boxShadow    = FLY_ACTIVE_SHADOW;
    flyEl.style.opacity      = "1";

    scrimEl.style.transition = "none";
    scrimEl.style.opacity    = "1";

    detailFadeEl.style.transition = "none";
    detailFadeEl.style.opacity    = "0";
    detailFadeEl.style.transform  = "scaleY(0.82)";
    detailFadeEl.style.transformOrigin = "bottom";

    if (heroFadeEl) {
      heroFadeEl.style.transition = "none";
      heroFadeEl.style.opacity    = "0";
    }

    heroEl.style.transition = "none";
    heroEl.style.opacity    = "0";

    scrollEl.style.overflow = "hidden";

    flyTextEl.style.transition = "none";
    flyTextEl.style.top        = `${panelRect.top}px`;
    flyTextEl.style.left       = `${panelRect.left}px`;
    flyTextEl.style.width      = `${panelRect.width}px`;
    flyTextEl.style.opacity    = "1";
    flyTextEl.style.visibility = "visible";

    const raf = requestAnimationFrame(() => requestAnimationFrame(() => {
      const textDelay = Math.round(DUR * 0.06);
      const textDur   = DUR - textDelay;
      const heroTarget = heroEl.getBoundingClientRect();
      const destTarget = contentTextEl.getBoundingClientRect();

      flyEl.style.transition = flyTransitionProps(DUR);
      flyEl.style.top          = `${heroTarget.top}px`;
      flyEl.style.left         = `${heroTarget.left}px`;
      flyEl.style.width        = `${heroTarget.width}px`;
      flyEl.style.height       = `${heroTarget.height}px`;
      flyEl.style.borderRadius = "0";
      flyEl.style.borderColor  = "transparent";
      flyEl.style.boxShadow    = "none";

      scrimEl.style.transition = `opacity ${Math.round(DUR * 0.72)}ms ${EASE} ${Math.round(DUR * 0.18)}ms`;
      scrimEl.style.opacity    = "0";

      detailFadeEl.style.transition = `opacity ${DUR}ms ${EASE}, transform ${DUR}ms ${EASE}`;
      detailFadeEl.style.opacity    = "1";
      detailFadeEl.style.transform  = "scaleY(1)";

      flyTextEl.style.transition = [
        `top ${textDur}ms ${EASE} ${textDelay}ms`,
        `left ${textDur}ms ${EASE} ${textDelay}ms`,
        `width ${textDur}ms ${EASE} ${textDelay}ms`,
      ].join(", ");
      flyTextEl.style.top   = `${destTarget.top}px`;
      flyTextEl.style.left  = `${destTarget.left}px`;
      flyTextEl.style.width = `${destTarget.width}px`;

      timersRef.current.push(setTimeout(() => {
        if (heroFadeEl) {
          heroFadeEl.style.transition = "none";
          heroFadeEl.style.opacity    = "1";
        }
        flyEl.style.transition  = "opacity 160ms ease";
        flyEl.style.opacity     = "0";
        heroEl.style.transition = "opacity 160ms ease";
        heroEl.style.opacity    = "1";
        scrollEl.style.overflow = "";

        flyTextEl.style.visibility = "hidden";
        contentTextEl.classList.add("mdp-info-text--settled");

        scrollEl.querySelectorAll<HTMLElement>(".mdp-deferred").forEach((el, i) => fadeIn(el, i * 40));
        scrollEl.querySelectorAll<HTMLElement>(".mdp-pill, .mdp-platform-btn").forEach((btn) => {
          btn.style.transition = `transform 380ms ${EASE} 40ms`;
          btn.style.transform  = "translateY(0)";
        });
        const posterEl = scrollEl.querySelector<HTMLElement>(".mdp-poster");
        const asideEl  = scrollEl.querySelector<HTMLElement>(".mdp-aside");
        if (posterEl) { posterEl.style.transition = `transform 400ms ${EASE}`; posterEl.style.transform = "translateY(0)"; }
        if (asideEl)  { asideEl.style.transition  = `transform 400ms ${EASE} 80ms`; asideEl.style.transform  = "translateY(0)"; }
      }, DUR + 24));
    }));

    return () => {
      cancelAnimationFrame(raf);
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [useFlip, fromRect, panelRect, fromPanelRect]);

  /* ── Exit ── */
  useEffect(() => {
    if (!isClosing || !savedRect.current || !useFlip) return;

    const flyEl         = flyRef.current;
    const scrimEl       = scrimRef.current;
    const detailFadeEl  = detailFadeRef.current;
    const heroFadeEl    = heroFadeRef.current;
    const scrollEl      = scrollRef.current;
    const contentTextEl = contentTextRef.current;
    const heroEl        = heroRef.current;
    const flyTextEl     = flyTextRef.current;
    if (!flyEl || !scrimEl || !detailFadeEl || !scrollEl || !contentTextEl || !heroEl || !flyTextEl) return;

    const from      = savedRect.current;
    const panelFrom = savedPanelRect.current ?? from;
    const heroRect  = heroEl.getBoundingClientRect();
    const dur       = DUR - 40;
    const destRect  = contentTextEl.getBoundingClientRect();

    contentTextEl.classList.remove("mdp-info-text--settled");

    scrollEl.scrollTop = 0;
    scrollEl.querySelectorAll<HTMLElement>(".mdp-deferred").forEach((el) => {
      el.style.transition = `opacity ${Math.round(dur * 0.15)}ms ease`;
      el.style.opacity    = "0";
    });

    flyEl.style.transition   = "none";
    flyEl.style.top          = `${heroRect.top}px`;
    flyEl.style.left         = `${heroRect.left}px`;
    flyEl.style.width        = `${heroRect.width}px`;
    flyEl.style.height       = `${heroRect.height}px`;
    flyEl.style.borderRadius = "0";
    flyEl.style.borderColor  = "transparent";
    flyEl.style.boxShadow    = "none";
    flyEl.style.opacity      = "1";

    scrimEl.style.transition = "none";
    scrimEl.style.opacity    = "0";

    detailFadeEl.style.transition = "none";
    detailFadeEl.style.opacity    = "1";
    detailFadeEl.style.transform  = "scaleY(1)";
    detailFadeEl.style.transformOrigin = "bottom";

    if (heroFadeEl) {
      heroFadeEl.style.transition = "none";
      heroFadeEl.style.opacity    = "0";
    }

    heroEl.style.transition = "none";
    heroEl.style.opacity    = "0";

    scrollEl.style.overflow = "hidden";

    flyTextEl.style.transition  = "none";
    flyTextEl.style.visibility  = "visible";
    flyTextEl.style.top         = `${destRect.top}px`;
    flyTextEl.style.left        = `${destRect.left}px`;
    flyTextEl.style.width       = `${destRect.width}px`;
    flyTextEl.style.opacity     = "1";

    const raf = requestAnimationFrame(() => requestAnimationFrame(() => {
      flyEl.style.transition = flyTransitionProps(dur);
      flyEl.style.top          = `${from.top}px`;
      flyEl.style.left         = `${from.left}px`;
      flyEl.style.width        = `${from.width}px`;
      flyEl.style.height       = `${from.height}px`;
      flyEl.style.borderRadius = CARD_RADIUS;
      flyEl.style.background   = "transparent";
      flyEl.style.borderColor  = FLY_ACTIVE_BORDER;
      flyEl.style.boxShadow    = FLY_ACTIVE_SHADOW;

      scrimEl.style.transition = `opacity ${Math.round(dur * 0.55)}ms ${EASE} ${Math.round(dur * 0.2)}ms`;
      scrimEl.style.opacity    = "1";

      detailFadeEl.style.transition = `opacity ${Math.round(dur * 0.65)}ms ${EASE}, transform ${Math.round(dur * 0.65)}ms ${EASE}`;
      detailFadeEl.style.opacity    = "0";
      detailFadeEl.style.transform  = "scaleY(0.82)";

      flyTextEl.style.transition = [
        `top ${dur}ms ${EASE}`,
        `left ${dur}ms ${EASE}`,
        `width ${dur}ms ${EASE}`,
      ].join(", ");
      flyTextEl.style.top   = `${panelFrom.top}px`;
      flyTextEl.style.left  = `${panelFrom.left}px`;
      flyTextEl.style.width = `${panelFrom.width}px`;
    }));

    return () => cancelAnimationFrame(raf);
  }, [isClosing, useFlip]);

  return (
    <>
    <div className={`mdp${isClosing ? " mdp--closing" : ""}${useFlip ? " mdp--flip" : ""}`}>

      {useFlip && (
        <div className="mdp-fly" ref={flyRef}>
          <div
            className="mdp-fly-media"
            style={isPhoto
              ? { backgroundImage: `url(${pick.thumbnailUrl})` }
              : { background: pick.posterGradient }
            }
          >
            <div className={`mdp-fly-scrim${isPhoto ? " mdp-fly-scrim--photo" : ""}`} ref={scrimRef} />
            <div className="mdp-fly-hero-fade" ref={detailFadeRef} />
          </div>
        </div>
      )}

      {useFlip && panelRect && (
        <div
          className="mdp-fly-text"
          ref={flyTextRef}
          style={{ top: panelRect.top, left: panelRect.left, width: panelRect.width }}
        >
          <div className="mdp-fly-text-panel">
            <CardText pick={pick} tagLimit={3} />
          </div>
        </div>
      )}

      <div className="mdp-scroll" ref={scrollRef}>
        <div className="mdp-hero" ref={heroRef}>
          {isPhoto ? (
            <div className="mdp-hero-bg" style={{ backgroundImage: `url(${pick.thumbnailUrl})` }} />
          ) : (
            <div className="mdp-hero-bg" style={{ background: pick.posterGradient }}>
              <div className="mdp-hero-glow" style={{ background: pick.posterGlow }} />
            </div>
          )}
          <div className="mdp-hero-fade" ref={heroFadeRef} />
        </div>

        <div className="mdp-page">
          <div className="mdp-main">
            {pick.posterUrl && (
              <div className="mdp-poster mdp-deferred" ref={posterRef}>
                <img src={pick.posterUrl} alt={`${pick.title} poster`} draggable={false} />
              </div>
            )}

            <div className="mdp-info">
              <div className="mdp-info-text" ref={contentTextRef}>
                <CardText pick={pick} />
              </div>

              <div className="mdp-pills mdp-deferred">
                {/* Trailer + save row */}
                <div className="mdp-pills-row">
                  <button type="button" className="mdp-pill">
                    <FilmStrip size={14} weight="duotone" />
                    Watch trailer
                  </button>
                  <button
                    type="button"
                    className={`mdp-pill${saved ? " mdp-pill--saved" : ""}`}
                    onClick={onSave}
                  >
                    <Bookmark size={14} weight={saved ? "fill" : "regular"} />
                    {saved ? "Saved" : "Save for later"}
                  </button>
                </div>

                {/* Streaming platform buttons */}
                {pick.watchPlatforms && pick.watchPlatforms.length > 0 && (
                  <div className="mdp-platform-row">
                    {pick.watchPlatforms.map((platform) => (
                      <button key={platform} type="button" className="mdp-platform-btn" title={platform}>
                        {PLATFORM_LOGOS[platform] && (
                          <img
                            src={PLATFORM_LOGOS[platform]}
                            alt={platform}
                            className="mdp-platform-logo-img"
                            draggable={false}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <aside className="mdp-aside mdp-deferred">
              <div className="mdp-reviews">
                <div className="mdp-rating-row">
                  <div className="mdp-score-block">
                    <p className="mdp-section-label">Reviews</p>
                    <p className="mdp-review-score">
                      <strong className="mdp-score-value">{pick.imdb_score}</strong>
                      <span className="mdp-score-denom">/10</span>
                    </p>
                    <p className="mdp-review-count">Based on {pick.ratingCount ?? "2.4k"} ratings</p>
                  </div>
                  <div className="mdp-user-rating-block">
                    <p className="mdp-user-rating-label">Your rating</p>
                    <button type="button" className="mdp-user-rating-btn" title="Rate this">
                      <Star size={32} weight="regular" />
                    </button>
                  </div>
                </div>
                <blockquote className="mdp-review-quote">"{pick.why_this}"</blockquote>
              </div>

              <div className="mdp-cast">
                <p className="mdp-section-label">Cast</p>
                <ul className="mdp-cast-list">
                  {cast.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>

          <div className="mdp-reveal mdp-deferred" ref={revealRef}>
            <section className="mdp-collections">
              <p className="mdp-section-label">Collections</p>
              <p className="mdp-collections-sub">Playlists this title appears in</p>
              <div className="mdp-collection-list">
                {PLACEHOLDER_COLLECTIONS.map((col) => (
                  <button key={col.name} type="button" className="mdp-collection-card">
                    <div className="col-poster-stack">
                      {col.posters.map((src, pi) => (
                        <img key={src} src={src} alt="" className={`col-poster col-poster--${pi}`} draggable={false} />
                      ))}
                    </div>
                    <span className="mdp-collection-name">{col.name}</span>
                    <span className="mdp-collection-count">{col.count} titles</span>
                  </button>
                ))}
              </div>
            </section>

            <button type="button" className="mdp-skip-link" onClick={onRefresh}>
              Not for me — try another
            </button>
          </div>
        </div>
      </div>

    </div>

    {createPortal(
      <button type="button" className="mdp-back" onClick={onClose}>
        <ArrowLeft size={15} weight="bold" />
        Back
      </button>,
      document.body
    )}
    </>
  );
}
