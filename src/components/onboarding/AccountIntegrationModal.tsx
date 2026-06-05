import { useState } from "react";
import { Check, ArrowRight, LinkSimple } from "@phosphor-icons/react";

const PLATFORM_LOGOS: Record<string, string> = {
  "Netflix":     "/netflix-logo.png",
  "Prime Video": "/prime-video-logo.png",
  "Disney+":     "/disney-plus-logo.svg",
  "HBO Max":     "/hbo-max-logo.png",
  "Hulu":        "/hulu-logo.png",
  "Apple TV+":   "/apple-tv-plus-logo.png",
  "Peacock":     "/peacock-logo.png",
  "Tubi":        "/tubi-logo.svg",
};

interface Props {
  platforms: string[];
  onContinue: () => void;
}

export default function AccountIntegrationModal({ platforms, onContinue }: Props) {
  const [connected, setConnected] = useState<string[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);

  function handleConnect(platform: string) {
    if (connected.includes(platform) || connecting === platform) return;
    setConnecting(platform);
    setTimeout(() => {
      setConnected((prev) => [...prev, platform]);
      setConnecting(null);
    }, 1100);
  }

  return (
    <div className="aim-overlay" role="presentation">
      <div className="aim-modal" role="dialog" aria-modal="true" aria-labelledby="aim-title">
        <div className="aim-header">
          <div className="aim-icon-wrap">
            <LinkSimple size={20} weight="bold" />
          </div>
          <h2 className="aim-title" id="aim-title">Connect your accounts</h2>
          <p className="aim-sub">
            Link your services so we can show you exactly what's on your plan.
          </p>
        </div>

        <ul className="aim-list">
          {platforms.map((platform) => {
            const isConnected = connected.includes(platform);
            const isConnecting = connecting === platform;
            return (
              <li key={platform} className="aim-row">
                <img
                  src={PLATFORM_LOGOS[platform] ?? ""}
                  alt={platform}
                  className="aim-logo"
                  draggable={false}
                />
                <span className="aim-platform-name">{platform}</span>
                <button
                  type="button"
                  className={`aim-connect-btn${isConnected ? " aim-connect-btn--done" : ""}${isConnecting ? " aim-connect-btn--loading" : ""}`}
                  onClick={() => handleConnect(platform)}
                  disabled={isConnected || isConnecting}
                >
                  {isConnected ? (
                    <><Check size={13} weight="bold" /> Connected</>
                  ) : isConnecting ? (
                    <span className="aim-spinner" />
                  ) : (
                    <>Connect <ArrowRight size={12} weight="bold" /></>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="aim-footer">
          <button type="button" className="aim-skip" onClick={onContinue}>
            {connected.length > 0 ? "Done" : "Connect later"}
          </button>
        </div>
      </div>
    </div>
  );
}
