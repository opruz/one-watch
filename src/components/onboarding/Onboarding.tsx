import { useState } from "react";
import AccountIntegrationModal from "./AccountIntegrationModal";

const PLATFORMS = [
  { id: "Netflix",     logo: "/netflix-logo.png" },
  { id: "Prime Video", logo: "/prime-video-logo.png" },
  { id: "Disney+",     logo: "/disney-plus-logo.svg" },
  { id: "HBO Max",     logo: "/hbo-max-logo.png" },
  { id: "Hulu",        logo: "/hulu-logo.png" },
  { id: "Apple TV+",   logo: "/apple-tv-plus-logo.png" },
  { id: "Peacock",     logo: "/peacock-logo.png" },
  { id: "Tubi",        logo: "/tubi-logo.svg" },
];

interface OnboardingProps {
  onComplete: (platforms: string[]) => void;
  onBrowse: (platforms: string[]) => void;
}

export default function Onboarding({ onComplete, onBrowse }: OnboardingProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [showIntegration, setShowIntegration] = useState(false);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );

  return (
    <div className="ob-wrap">
      <div className="ob-inner">
        <div className="ob-brand">
          <span className="ob-logo">◉</span>
          <span className="ob-logo-text">One Watch</span>
        </div>

        <div className="ob-headline">
          <h1 className="ob-title">What are you watching tonight?</h1>
          <p className="ob-sub">
            Select your streaming services and we'll find the perfect pick for your mood.
          </p>
        </div>

        <p className="ob-platform-label">Your services</p>

        <div className="ob-platform-grid">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`ob-platform-btn${selected.includes(p.id) ? " ob-platform-btn--on" : ""}`}
              onClick={() => toggle(p.id)}
              aria-label={p.id}
              aria-pressed={selected.includes(p.id)}
            >
              <img
                src={p.logo}
                alt={p.id}
                className="ob-platform-logo"
                draggable={false}
              />
              {selected.includes(p.id) && (
                <span className="ob-platform-check" aria-hidden="true">✓</span>
              )}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="ob-cta"
          disabled={selected.length === 0}
          onClick={() => setShowIntegration(true)}
        >
          Get started →
        </button>

        <button
          type="button"
          className="ob-browse-link"
          onClick={() => onBrowse(selected)}
        >
          or browse the full catalogue
        </button>
      </div>

      {showIntegration && (
        <AccountIntegrationModal
          platforms={selected}
          onContinue={() => { setShowIntegration(false); onComplete(selected); }}
        />
      )}
    </div>
  );
}
