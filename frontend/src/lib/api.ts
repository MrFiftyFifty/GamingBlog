import { getSession } from "next-auth/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function getAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const session = await getSession();
  const token = (session?.user as Record<string, unknown> | undefined)?.accessToken;
  return typeof token === "string" ? token : null;
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new ApiError(message, res.status);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export async function apiUpload<T>(
  path: string,
  formData: FormData
): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: formData,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new ApiError(message, res.status);
  }
  return res.json() as Promise<T>;
}
