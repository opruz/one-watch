import type { Title, UserProviderAccess } from "../../types";
import { formatRuntime } from "../../lib/rank";
import { getProviderStatus, sortProvidersByAccess } from "../../lib/providers";
import { ProviderBadge } from "./ProviderBadge";

interface TitleCardProps {
  title: Title;
  providerAccess: UserProviderAccess;
  reason?: string;
  featured?: boolean;
  onClick: () => void;
}

export function TitleCard({ title, providerAccess, reason, featured, onClick }: TitleCardProps) {
  const providers = sortProvidersByAccess(title.providers, providerAccess);

  return (
    <button
      type="button"
      className={`title-card${featured ? " title-card--featured" : ""}`}
      onClick={onClick}
    >
      <div
        className="title-card__poster"
        style={{
          background: `linear-gradient(145deg, ${title.posterHue} 0%, #0e1518 100%)`,
        }}
      >
        <span className="title-card__initial">{title.title.charAt(0)}</span>
      </div>
      <div className="title-card__body">
        <h3 className="title-card__name">{title.title}</h3>
        <p className="title-card__meta">
          {title.year} · {formatRuntime(title.runtime)}
        </p>
        {reason && <p className="title-card__reason">{reason}</p>}
        <div className="title-card__providers">
          {providers.slice(0, 2).map((p) => (
            <ProviderBadge
              key={p}
              provider={p}
              status={getProviderStatus(p, providerAccess)}
              compact
            />
          ))}
        </div>
      </div>
    </button>
  );
}
