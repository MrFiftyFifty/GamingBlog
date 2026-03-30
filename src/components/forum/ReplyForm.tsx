"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { replySchema, type ReplyFormData } from "@/lib/validations/forum";
import * as forumApi from "@/lib/api/forum";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ReplyFormProps {
  sectionSlug: string;
  topicId: string;
  onReplyAdded?: () => void;
  defaultContent?: string;
}

export function ReplyForm({
  sectionSlug,
  topicId,
  onReplyAdded,
  defaultContent = "",
}: ReplyFormProps) {
  const { isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReplyFormData>({
    resolver: zodResolver(replySchema),
    defaultValues: { content: defaultContent },
  });

  async function onSubmit(data: ReplyFormData) {
    try {
      await forumApi.createReply(sectionSlug, topicId, {
        content: data.content,
      });
      toast.success("Ответ опубликован");
      reset();
      onReplyAdded?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Произошла ошибка");
    }
  }

  if (!isAuthenticated) {
    return (
      <div id="reply" className="mt-8 rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-muted-foreground">
          <Link href="/auth/login" className="font-medium text-foreground underline underline-offset-4 hover:text-accent-signature">
            Войдите
          </Link>{" "}
          чтобы оставить ответ
        </p>
      </div>
    );
  }

  return (
    <form
      id="reply"
      onSubmit={handleSubmit(onSubmit)}
      className="mt-8 rounded-lg border border-border bg-card p-6"
    >
      <h3 className="mb-4 font-display text-fluid-title font-semibold text-foreground">
        Ответить
      </h3>
      <textarea
        {...register("content")}
        rows={6}
        placeholder="Напишите ваш ответ... (поддерживается Markdown)"
        className={cn(
          "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground",
          "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
          errors.content && "border-destructive"
        )}
      />
      {errors.content && (
        <p className="mt-1 text-sm text-destructive">{errors.content.message}</p>
      )}
      <div className="mt-4 flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Отправка..." : "Отправить"}
        </Button>
      </div>
    </form>
  );
}
