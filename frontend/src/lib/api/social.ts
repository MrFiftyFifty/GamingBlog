import { apiFetch } from "@/lib/api";
import { FEATURES } from "@/lib/constants";

export interface SocialAccount {
  id: number;
  provider: string;
  uid: string;
  lastLogin: string | null;
  dateJoined: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export function getSocialAccounts() {
  if (!FEATURES.googleOAuth && !FEATURES.steamOAuth) {
    return Promise.resolve([] as SocialAccount[]);
  }
  return apiFetch<SocialAccount[]>("/api/social-accounts/").then((items) =>
    items.map((item) => ({
      ...item,
      provider: item.provider.toLowerCase(),
    }))
  );
}

export function disconnectSocialAccount(id: number) {
  return apiFetch<void>(`/api/social-accounts/${id}/`, { method: "DELETE" });
}

export function googleLoginUrl() {
  return `${API_BASE}/accounts/google/login/`;
}

export function googleConnectUrl() {
  return `${API_BASE}/accounts/google/login/?process=connect`;
}

export function steamLoginUrl() {
  return `${API_BASE}/accounts/steam/login/`;
}

export function steamConnectUrl() {
  return `${API_BASE}/accounts/steam/login/?process=connect`;
}

export async function syncSteamLibrary() {
  return apiFetch<{ status: string; synced?: number }>("/api/steam/sync/", {
    method: "POST",
  });
}
