import { useEffect, useLayoutEffect, useRef } from "react";
import { ArrowLeft, Bookmark, FilmStrip, Play } from "@phosphor-icons/react";
import { type FocusPick } from "../../data/focusData";

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

const PLACEHOLDER_CAST = [
  "Jordan Smith",
  "Riley Chen",
  "Morgan Lee",
  "Casey Wong",
  "Alex Rivera",
];

const PLACEHOLDER_COLLECTIONS = [
  { name: "Late Night Picks", count: 8 },
  { name: "Must Watch Again", count: 14 },
  { name: "Shared with Friends", count: 5 },
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
      <p className="fm-gallery-meta">{pick.year} · {pick.runtime} · ★ {pick.imdb_score}</p>
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
  const watchPlatform = pick.watchPlatforms?.[0];

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

    scrollEl.querySelectorAll<HTMLElement>(".mdp-deferred").forEach((el) => {
      el.style.transition = "none";
      el.style.opacity    = "0";
    });

    const { width: heroW, height: heroH } = heroEl.getBoundingClientRect();
    const destRect = contentTextEl.getBoundingClientRect();

    flyEl.style.transition   = "none";
    flyEl.style.top          = `${fromRect.top}px`;
    flyEl.style.left         = `${fromRect.left}px`;
    flyEl.style.width        = `${fromRect.width}px`;
    flyEl.style.height       = `${fromRect.height}px`;
    flyEl.style.borderRadius = "16px";
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

    const raf = requestAnimationFrame(() => {
      const textDelay = Math.round(DUR * 0.06);
      const textDur   = DUR - textDelay;

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
      flyTextEl.style.top   = `${destRect.top}px`;
      flyTextEl.style.left  = `${destRect.left}px`;
      flyTextEl.style.width = `${destRect.width}px`;

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
      }, DUR + 24));
    });

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

    scrollEl.querySelectorAll<HTMLElement>(".mdp-deferred").forEach((el) => {
      el.style.transition = `opacity ${Math.round(dur * 0.15)}ms ease`;
      el.style.opacity    = "0";
    });

    flyEl.style.transition   = "none";
    flyEl.style.top          = "0";
    flyEl.style.left         = "0";
    flyEl.style.width        = `${heroRect.width}px`;
    flyEl.style.height       = `${heroRect.height}px`;
    flyEl.style.borderRadius = "0";
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

    const raf = requestAnimationFrame(() => {
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
    });

    return () => cancelAnimationFrame(raf);
  }, [isClosing, useFlip]);

  return (
    <div className={`mdp${isClosing ? " mdp--closing" : ""}${useFlip ? " mdp--flip" : ""}`}>

      {useFlip && (
        <div
          className="mdp-fly"
          ref={flyRef}
          style={isPhoto
            ? { backgroundImage: `url(${pick.thumbnailUrl})` }
            : { background: pick.posterGradient }
          }
        >
          <div className={`mdp-fly-scrim${isPhoto ? " mdp-fly-scrim--photo" : ""}`} ref={scrimRef} />
          <div className="mdp-fly-hero-fade" ref={detailFadeRef} />
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

      <button type="button" className="mdp-back" onClick={onClose}>
        <ArrowLeft size={15} weight="bold" />
        Back
      </button>

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
                <button type="button" className="mdp-pill mdp-pill--primary">
                  <Play size={14} weight="fill" />
                  {watchPlatform ? `Watch on ${watchPlatform}` : "Watch movie"}
                </button>
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
                  {saved ? "Saved" : "Watch later"}
                </button>
              </div>
            </div>

            <aside className="mdp-aside mdp-deferred">
              <div className="mdp-reviews">
                <p className="mdp-section-label">Reviews</p>
                <p className="mdp-review-score">★ {pick.imdb_score}</p>
                <p className="mdp-review-count">Based on 2.4k ratings</p>
                <blockquote className="mdp-review-quote">"{pick.why_this}"</blockquote>
              </div>

              <div className="mdp-cast">
                <p className="mdp-section-label">Cast</p>
                <ul className="mdp-cast-list">
                  {PLACEHOLDER_CAST.map((name) => (
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
  );
}
