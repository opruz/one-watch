import type { Provider, Title, UserProviderAccess } from "../../types";
import { formatRuntime } from "../../lib/rank";
import { getProviderStatus, sortProvidersByAccess } from "../../lib/providers";
import { ProviderBadge } from "./ProviderBadge";

interface TitleModalProps {
  title: Title;
  providerAccess: UserProviderAccess;
  onClose: () => void;
}

function getBestProvider(providers: Provider[], providerAccess: UserProviderAccess): Provider {
  return sortProvidersByAccess(providers, providerAccess)[0];
}

export function TitleModal({ title, providerAccess, onClose }: TitleModalProps) {
  const sortedProviders = sortProvidersByAccess(title.providers, providerAccess);
  const bestProvider = getBestProvider(title.providers, providerAccess);
  const bestProviderStatus = getProviderStatus(bestProvider, providerAccess);

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="modal__poster" style={{ background: title.posterHue }}>
          <span>{title.title.charAt(0)}</span>
        </div>
        <div className="modal__content">
          <h2 id="modal-title">{title.title}</h2>
          <p className="modal__meta">
            {title.year} · {formatRuntime(title.runtime)} · {title.genres.join(", ")}
          </p>
          <p className="modal__synopsis">{title.synopsis}</p>
          <div className="modal__moods">
            {title.moods.map((m) => (
              <span key={m} className="chip chip--muted">
                {m}
              </span>
            ))}
          </div>
          <div className="modal__providers">
            <p className="modal__label">Available on</p>
            <div className="modal__provider-list">
              {sortedProviders.map((p) => (
                <ProviderBadge key={p} provider={p} status={getProviderStatus(p, providerAccess)} />
              ))}
            </div>
          </div>
          <button
            type="button"
            className={`btn ${bestProviderStatus === "unavailable" ? "btn--muted" : "btn--primary"} modal__watch`}
          >
            {bestProviderStatus === "unavailable"
              ? `Open in ${bestProvider} (subscription needed)`
              : `Open in ${bestProvider}`}
          </button>
        </div>
      </div>
    </div>
  );
}
