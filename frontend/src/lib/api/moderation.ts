import { apiFetch } from "@/lib/api";
import { FEATURES } from "@/lib/constants";
import { mockComplaints, mockModActions } from "@/lib/mocks/api-mocks";
import type { Complaint, ModAction, PaginatedResponse } from "./types";

export function getComplaints(params?: {
  status?: string;
  page?: number;
}) {
  if (!FEATURES.moderation) return mockComplaints();
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", String(params.page));
  const qs = query.toString();
  return apiFetch<PaginatedResponse<Complaint>>(
    `/api/moderation/complaints/${qs ? `?${qs}` : ""}`
  );
}

export function resolveComplaint(
  complaintId: string,
  action: "dismiss" | "delete_post" | "warn_user" | "ban_user",
  reason: string
) {
  if (!FEATURES.moderation) return Promise.resolve();
  return apiFetch<void>(`/api/moderation/complaints/${complaintId}/resolve/`, {
    method: "POST",
    body: JSON.stringify({ action, reason }),
  });
}

export function getModActions(page?: number) {
  if (!FEATURES.moderation) return mockModActions();
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  const qs = params.toString();
  return apiFetch<PaginatedResponse<ModAction>>(
    `/api/moderation/actions/${qs ? `?${qs}` : ""}`
  );
}

export function banUser(username: string, reason: string, duration?: number) {
  if (!FEATURES.moderation) return Promise.resolve();
  return apiFetch<void>(`/api/moderation/users/${username}/ban/`, {
    method: "POST",
    body: JSON.stringify({ reason, duration }),
  });
}

export function warnUser(username: string, reason: string) {
  if (!FEATURES.moderation) return Promise.resolve();
  return apiFetch<void>(`/api/moderation/users/${username}/warn/`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function deletePost(postId: string, reason: string) {
  if (!FEATURES.moderation) return Promise.resolve();
  return apiFetch<void>(`/api/moderation/posts/${postId}/`, {
    method: "DELETE",
    body: JSON.stringify({ reason }),
  });
}
