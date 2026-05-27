import type { CSSProperties } from "react";
import type { Provider, ProviderStatus } from "../../types";
import { PROVIDER_COLORS, PROVIDER_LOGOS } from "../../types";

interface ProviderBadgeProps {
  provider: Provider;
  status: ProviderStatus;
  compact?: boolean;
}

const STATUS_TEXT: Record<ProviderStatus, string> = {
  subscribed: "Subscribed",
  free: "Free movies",
  unavailable: "Not subscribed",
};

export function ProviderBadge({ provider, status, compact = false }: ProviderBadgeProps) {
  return (
    <span
      className={`provider-badge provider-badge--${status}${compact ? " provider-badge--compact" : ""}`}
      style={
        status === "unavailable"
          ? undefined
          : ({ "--provider-color": PROVIDER_COLORS[provider] } as CSSProperties)
      }
    >
      <span className="provider-badge__logo">{PROVIDER_LOGOS[provider]}</span>
      {!compact && <span className="provider-badge__name">{provider}</span>}
      {status === "subscribed" && <span className="provider-badge__check">✓</span>}
      {!compact && <span className="provider-badge__state">{STATUS_TEXT[status]}</span>}
    </span>
  );
}
