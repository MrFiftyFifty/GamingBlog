import useSWR from "swr";
import * as messagesApi from "@/lib/api/messages";

export function useConversations() {
  return useSWR("messages/conversations", () =>
    messagesApi.getConversations()
  );
}

export function useMessages(conversationId: string | null, page?: number) {
  return useSWR(
    conversationId ? ["messages", conversationId, page] : null,
    () => messagesApi.getMessages(conversationId!, page)
  );
}
