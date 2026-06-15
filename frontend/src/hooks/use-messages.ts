import useSWR from "swr";
import * as messagesApi from "@/lib/api/messages";
import { useAuth } from "@/hooks/useAuth";

export function useConversations() {
  const { user } = useAuth();
  return useSWR(
    user?.id ? ["messages/conversations", user.id] : null,
    () => messagesApi.getConversations(user!.id)
  );
}

export function useMessages(conversationId: string | null, page?: number) {
  const { user } = useAuth();
  return useSWR(
    user?.id && conversationId
      ? ["messages", conversationId, user.id, page]
      : null,
    () => messagesApi.getMessages(conversationId!, user!.id, page)
  );
}
