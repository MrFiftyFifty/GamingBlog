import { apiFetch } from "@/lib/api";
import { FEATURES } from "@/lib/constants";
import type { User, RegisterRequest } from "./types";

export function register(data: RegisterRequest) {
  return apiFetch<User>("/api/register/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMe() {
  return apiFetch<User>("/api/profile/");
}

export function forgotPassword(email: string) {
  if (!FEATURES.passwordReset) {
    return Promise.reject(new Error("FEATURE_DISABLED: passwordReset"));
  }
  return apiFetch<void>("/api/auth/forgot-password/", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token: string, password: string) {
  if (!FEATURES.passwordReset) {
    return Promise.reject(new Error("FEATURE_DISABLED: passwordReset"));
  }
  return apiFetch<void>("/api/auth/reset-password/", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

export function changePassword(currentPassword: string, newPassword: string) {
  if (!FEATURES.changePassword) {
    return Promise.reject(new Error("FEATURE_DISABLED: changePassword"));
  }
  return apiFetch<void>("/api/auth/change-password/", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
