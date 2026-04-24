import { apiFetch } from "@/lib/api";
import { FEATURES } from "@/lib/constants";
import { mockConversations, mockMessages } from "@/lib/mocks/api-mocks";
import type {
  Conversation,
  Message,
  PaginatedResponse,
  SendMessageRequest,
} from "./types";

export function getConversations() {
  if (!FEATURES.messages) return mockConversations();
  return apiFetch<Conversation[]>("/api/messages/conversations/");
}

export function getMessages(conversationId: string, page?: number) {
  if (!FEATURES.messages) return mockMessages(conversationId);
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  const qs = params.toString();
  return apiFetch<PaginatedResponse<Message>>(
    `/api/messages/conversations/${conversationId}/${qs ? `?${qs}` : ""}`
  );
}

export function sendMessage(data: SendMessageRequest) {
  if (!FEATURES.messages) {
    return Promise.resolve({
      id: String(Date.now()),
      conversationId: "mock",
      sender: "me",
      content: data.content,
      createdAt: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      read: true,
    } as Message);
  }
  return apiFetch<Message>("/api/messages/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function markConversationRead(conversationId: string) {
  if (!FEATURES.messages) return Promise.resolve();
  return apiFetch<void>(
    `/api/messages/conversations/${conversationId}/read/`,
    { method: "POST" }
  );
}
