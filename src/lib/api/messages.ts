import { apiFetch } from "@/lib/api";
import type {
  Conversation,
  Message,
  PaginatedResponse,
  SendMessageRequest,
} from "./types";

export function getConversations() {
  return apiFetch<Conversation[]>("/api/messages/conversations");
}

export function getMessages(conversationId: string, page?: number) {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  const qs = params.toString();
  return apiFetch<PaginatedResponse<Message>>(
    `/api/messages/conversations/${conversationId}${qs ? `?${qs}` : ""}`
  );
}

export function sendMessage(data: SendMessageRequest) {
  return apiFetch<Message>("/api/messages", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function markConversationRead(conversationId: string) {
  return apiFetch<void>(
    `/api/messages/conversations/${conversationId}/read`,
    { method: "POST" }
  );
}
