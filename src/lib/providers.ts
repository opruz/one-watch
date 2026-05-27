import type { Provider, ProviderStatus, UserProviderAccess } from "../types";

export function getProviderStatus(
  provider: Provider,
  access: UserProviderAccess,
): ProviderStatus {
  if (access.subscribed.includes(provider)) {
    return "subscribed";
  }

  if (access.freeWithoutSubscription.includes(provider)) {
    return "free";
  }

  return "unavailable";
}

export function sortProvidersByAccess(
  providers: Provider[],
  access: UserProviderAccess,
): Provider[] {
  const priority: Record<ProviderStatus, number> = {
    subscribed: 0,
    free: 1,
    unavailable: 2,
  };

  return [...providers].sort(
    (a, b) =>
      priority[getProviderStatus(a, access)] - priority[getProviderStatus(b, access)],
  );
}
