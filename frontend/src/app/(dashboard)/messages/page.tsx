"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { messageSchema, type MessageFormData } from "@/lib/validations/user";
import * as messagesApi from "@/lib/api/messages";
import { useConversations, useMessages } from "@/hooks/use-messages";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [reply, setReply] = useState("");

  const {
    data: conversations = [],
    isLoading: loadingConversations,
    mutate: refreshConversations,
  } = useConversations();

  const {
    data: messagesData,
    isLoading: loadingMessages,
    mutate: refreshMessages,
  } = useMessages(selectedId);

  const messages = messagesData?.data ?? [];
  const selectedConversation = conversations.find((c) => c.id === selectedId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
  });

  useEffect(() => {
    if (selectedId) {
      messagesApi.markConversationRead(selectedId).catch(() => undefined);
    }
  }, [selectedId]);

  async function onNewMessage(data: MessageFormData) {
    try {
      await messagesApi.sendMessage(data);
      toast.success("Сообщение отправлено");
      reset();
      setNewMessageOpen(false);
      await refreshConversations();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Произошла ошибка");
    }
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim() || !selectedId || !selectedConversation) return;
    try {
      await messagesApi.sendMessage({
        recipientUsername: selectedConversation.participant.username,
        content: reply,
      });
      setReply("");
      await Promise.all([refreshMessages(), refreshConversations()]);
    } catch {
      toast.error("Не удалось отправить сообщение");
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-fluid-display font-bold tracking-tight text-foreground">
          Личные сообщения
        </h1>
        <Button variant="outline" size="sm" onClick={() => setNewMessageOpen(true)}>
          Новое сообщение
        </Button>
      </div>
      <div className="rounded-lg border border-border bg-card min-h-[500px] flex flex-col md:flex-row">
        <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-border overflow-y-auto">
          {loadingConversations ? (
            <p className="p-4 text-sm text-muted-foreground">Загрузка диалогов...</p>
          ) : conversations.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Нет диалогов.</p>
          ) : (
            <ul className="divide-y divide-border">
              {conversations.map((conv) => (
                <li key={conv.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(conv.id)}
                    className={cn(
                      "flex w-full items-start gap-3 p-4 text-left transition-colors duration-200 hover:bg-accent/30",
                      selectedId === conv.id && "bg-accent/50"
                    )}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {conv.participant.username[0]?.toUpperCase() ?? "?"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground truncate">
                          {conv.participant.username}
                        </span>
                        <span className="text-xs text-muted-foreground">{conv.lastMessageAt}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-signature px-1.5 text-xs font-medium text-accent-signature-foreground">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
        <div className="flex flex-1 flex-col">
          {selectedConversation ? (
            <>
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-medium text-foreground">
                  {selectedConversation.participant.username}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMessages ? (
                  <p className="text-sm text-muted-foreground">Загрузка сообщений...</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "max-w-[80%] rounded-lg px-4 py-2",
                        msg.sender === "me"
                          ? "ml-auto bg-accent-signature text-accent-signature-foreground"
                          : "bg-muted"
                      )}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p
                        className={cn(
                          "mt-1 text-xs",
                          msg.sender === "me"
                            ? "text-accent-signature-foreground/70"
                            : "text-muted-foreground"
                        )}
                      >
                        {msg.createdAt}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleReply} className="border-t border-border p-4 flex gap-2">
                <Input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Написать сообщение..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!reply.trim()}>
                  Отправить
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground p-8">
              Выберите диалог или создайте новое сообщение.
            </div>
          )}
        </div>
      </div>

      <Modal open={newMessageOpen} onClose={() => setNewMessageOpen(false)} title="Новое сообщение">
        <form onSubmit={handleSubmit(onNewMessage)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Получатель</label>
            <Input {...register("recipientUsername")} placeholder="Имя пользователя" />
            {errors.recipientUsername && (
              <p className="mt-1 text-sm text-destructive">{errors.recipientUsername.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Сообщение</label>
            <textarea
              {...register("content")}
              rows={4}
              placeholder="Текст сообщения..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.content && (
              <p className="mt-1 text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setNewMessageOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Отправка..." : "Отправить"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
