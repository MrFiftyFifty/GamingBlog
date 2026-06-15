import { apiFetch } from "@/lib/api";
import { FEATURES } from "@/lib/constants";
import { mockComplaints, mockModActions } from "@/lib/mocks/api-mocks";
import {
  normalizeComplaint,
  normalizeModAction,
  normalizePaginated,
} from "./normalize";

async function resolveUserId(username: string): Promise<number> {
  const user = await apiFetch<{ id: number }>(
    `/api/users/${encodeURIComponent(username)}/`
  );
  return user.id;
}

export async function getComplaints(params?: {
  status?: string;
  page?: number;
}) {
  if (!FEATURES.moderation) return mockComplaints();

  if (params?.status === "pending") {
    const raw = await apiFetch<unknown>("/api/reports/pending/");
    return normalizePaginated(raw, normalizeComplaint);
  }

  const query = new URLSearchParams();
  if (params?.status && params.status !== "pending") {
    const backendStatus = params.status === "dismissed" ? "rejected" : params.status;
    query.set("status", backendStatus);
  }
  if (params?.page) query.set("page", String(params.page));
  const qs = query.toString();
  const raw = await apiFetch<unknown>(`/api/reports/${qs ? `?${qs}` : ""}`);
  const normalized = normalizePaginated(raw, normalizeComplaint);
  if (params?.status === "resolved") {
    normalized.results = (normalized.results ?? []).filter((c) => c.status === "resolved");
  }
  return normalized;
}

export async function resolveComplaint(
  complaintId: string,
  action: "dismiss" | "delete_post" | "warn_user" | "ban_user",
  reason: string,
  context?: { postId?: string; topicId?: string; reportedUser?: string }
) {
  if (!FEATURES.moderation) return Promise.resolve();

  const body = { moderator_comment: reason };

  if (action === "delete_post" && context?.postId) {
    await apiFetch<void>(`/api/posts/${context.postId}/`, { method: "DELETE" });
    await apiFetch(`/api/reports/${complaintId}/resolve/`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return;
  }

  if (action === "ban_user" && context?.topicId && context?.reportedUser) {
    const userId = await resolveUserId(context.reportedUser);
    await apiFetch(`/api/topics/${context.topicId}/moderation/`, {
      method: "POST",
      body: JSON.stringify({ user: userId, reason }),
    });
    await apiFetch(`/api/reports/${complaintId}/resolve/`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return;
  }

  if (action === "dismiss") {
    await apiFetch(`/api/reports/${complaintId}/reject/`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return;
  }

  await apiFetch(`/api/reports/${complaintId}/resolve/`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getModActions(page?: number) {
  if (!FEATURES.moderation) return mockModActions();
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  const qs = params.toString();
  const raw = await apiFetch<unknown>(
    `/api/moderation-logs/${qs ? `?${qs}` : ""}`
  );
  return normalizePaginated(raw, normalizeModAction);
}

export async function banUser(
  username: string,
  reason: string,
  topicId?: string
) {
  if (!FEATURES.moderation) return Promise.resolve();
  if (!topicId) {
    throw new Error("Для блокировки укажите тему (topicId)");
  }
  const userId = await resolveUserId(username);
  return apiFetch<void>(`/api/topics/${topicId}/moderation/`, {
    method: "POST",
    body: JSON.stringify({ user: userId, reason }),
  });
}

export async function warnUser(username: string, reason: string) {
  if (!FEATURES.moderation) return Promise.resolve();
  const reports = await getComplaints({ status: "pending" });
  const pending = reports.results?.find((c) => c.reportedUser === username);
  if (pending) {
    await resolveComplaint(pending.id, "warn_user", reason);
    return;
  }
  throw new Error("Нет активной жалобы для предупреждения");
}

export async function deletePost(postId: string, reason: string) {
  if (!FEATURES.moderation) return Promise.resolve();
  return apiFetch<void>(`/api/posts/${postId}/`, {
    method: "DELETE",
    body: JSON.stringify({ reason }),
  });
}
