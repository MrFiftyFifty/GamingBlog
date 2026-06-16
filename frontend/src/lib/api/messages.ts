import { apiFetch } from "@/lib/api";
import { FEATURES } from "@/lib/constants";
import { mockConversations, mockMessages } from "@/lib/mocks/api-mocks";
import {
  buildConversations,
  extractResults,
  normalizeMessage,
} from "./normalize";
import type {
  Message,
  PaginatedResponse,
  SendMessageRequest,
} from "./types";

async function resolveRecipientId(username: string): Promise<number> {
  const user = await apiFetch<{ id: number }>(
    `/api/users/${encodeURIComponent(username)}/`
  );
  return user.id;
}

export async function getConversations(currentUserId: string) {
  if (!FEATURES.messages) return mockConversations();
  const raw = await apiFetch<unknown>("/api/private-messages/");
  const messages = extractResults(raw);
  return buildConversations(messages, currentUserId);
}

export async function getMessages(
  conversationId: string,
  currentUserId: string,
  page?: number
) {
  if (!FEATURES.messages) return mockMessages(conversationId);
  const params = new URLSearchParams({ user_id: conversationId });
  if (page) params.set("page", String(page));
  const raw = await apiFetch<unknown>(
    `/api/private-messages/conversation/?${params}`
  );
  const items = extractResults(raw);
  const results = items.map((item) =>
    normalizeMessage(item, currentUserId, conversationId)
  );
  const record = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const total = typeof record.count === "number" ? record.count : results.length;
  return {
    data: results,
    total,
    page: page ?? 1,
    pageSize: results.length || 20,
    totalPages: Math.max(1, Math.ceil(total / (results.length || 20))),
  } satisfies PaginatedResponse<Message>;
}

export async function sendMessage(data: SendMessageRequest) {
  if (!FEATURES.messages) {
    return Promise.resolve({
      id: String(Date.now()),
      conversationId: "mock",
      sender: "me",
      content: data.content,
      createdAt: new Date().toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: true,
    } as Message);
  }
  const recipientId = await resolveRecipientId(data.recipientUsername);
  const raw = await apiFetch<Record<string, unknown>>("/api/private-messages/", {
    method: "POST",
    body: JSON.stringify({
      recipient_id: recipientId,
      content: data.content,
    }),
  });
  return normalizeMessage(raw, "me", String(recipientId));
}

export function markConversationRead(conversationId: string) {
  if (!FEATURES.messages) return Promise.resolve();
  return apiFetch<void>(
    `/api/private-messages/conversation/?user_id=${encodeURIComponent(conversationId)}`
  );
}
