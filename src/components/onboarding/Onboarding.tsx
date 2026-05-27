import { useState } from "react";
import { Crosshair, Compass } from "@phosphor-icons/react";

const PLATFORMS = [
  { id: "Netflix", label: "Netflix", color: "#E50914", abbr: "N" },
  { id: "Prime Video", label: "Prime Video", color: "#00A8E1", abbr: "P" },
  { id: "Disney+", label: "Disney+", color: "#1A6EE5", abbr: "D+" },
  { id: "Max", label: "Max", color: "#702BE2", abbr: "M" },
  { id: "Hulu", label: "Hulu", color: "#1CE783", abbr: "H" },
  { id: "Apple TV+", label: "Apple TV+", color: "#a0a0a0", abbr: "▶" },
];

interface OnboardingProps {
  onComplete: (platforms: string[]) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  return (
    <div className="ob-wrap">
      <div className="ob-inner">
        {/* Brand */}
        <div className="ob-brand">
          <span className="ob-logo">◉</span>
          <span className="ob-logo-text">One Watch</span>
        </div>

        <div className="ob-headline">
          <h1 className="ob-title">What are you watching tonight?</h1>
          <p className="ob-sub">
            Two modes. One perfect pick or the full catalogue — your call.
          </p>
        </div>

        {/* Mode preview pills */}
        <div className="ob-modes">
          <div className="ob-mode-card">
            <span className="ob-mode-icon"><Crosshair size={22} weight="duotone" /></span>
            <div>
              <p className="ob-mode-name">Focus</p>
              <p className="ob-mode-desc">Answer 3 questions. Get one perfect pick.</p>
            </div>
          </div>
          <div className="ob-mode-card">
            <span className="ob-mode-icon"><Compass size={22} weight="duotone" /></span>
            <div>
              <p className="ob-mode-name">Explore</p>
              <p className="ob-mode-desc">Browse the full catalogue by mood & genre.</p>
            </div>
          </div>
        </div>

        <p className="ob-platform-label">Select the services you subscribe to</p>

        {/* Platform grid */}
        <div className="ob-platform-grid">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`ob-platform-btn${selected.includes(p.id) ? " ob-platform-btn--on" : ""}`}
              style={{ "--pc": p.color } as React.CSSProperties}
              onClick={() => toggle(p.id)}
            >
              <span className="ob-platform-abbr" style={{ color: p.color }}>
                {p.abbr}
              </span>
              <span className="ob-platform-name">{p.label}</span>
              {selected.includes(p.id) && (
                <span className="ob-platform-check">✓</span>
              )}
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          type="button"
          className="ob-cta"
          disabled={selected.length === 0}
          onClick={() => onComplete(selected)}
        >
          Get started →
        </button>
        {selected.length === 0 && (
          <p className="ob-hint">Select at least one platform to continue</p>
        )}
      </div>
    </div>
  );
}
