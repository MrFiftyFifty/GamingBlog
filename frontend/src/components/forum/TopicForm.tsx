"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { topicSchema, type TopicFormData } from "@/lib/validations/forum";
import * as forumApi from "@/lib/api/forum";
import { cn } from "@/lib/utils";

interface TopicFormProps {
  slug: string;
  topicId?: string;
  defaultValues?: { title: string; tags: string; content: string };
}

export function TopicForm({ slug, topicId, defaultValues }: TopicFormProps) {
  const router = useRouter();
  const isEdit = !!topicId;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TopicFormData>({
    resolver: zodResolver(topicSchema),
    defaultValues: defaultValues ?? { title: "", tags: "", content: "" },
  });

  async function onSubmit(data: TopicFormData) {
    try {
      const tags = data.tags
        ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      if (isEdit) {
        await forumApi.updateTopic(slug, topicId!, {
          title: data.title,
          content: data.content,
          tags,
        });
        toast.success("Тема обновлена");
        router.push(`/forum/${slug}/topic/${topicId}`);
      } else {
        const topic = await forumApi.createTopic(slug, {
          title: data.title,
          content: data.content,
          tags,
        });
        toast.success("Тема создана");
        router.push(`/forum/${slug}/topic/${topic.id}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Произошла ошибка");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-foreground">
          Название темы
        </label>
        <Input
          id="title"
          {...register("title")}
          placeholder="Например: [Новости] Marathon — сезоны и контент"
          className={cn("mt-2", errors.title && "border-destructive")}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-foreground">
          Теги (через запятую)
        </label>
        <Input
          id="tags"
          {...register("tags")}
          placeholder="Marathon, RPG, Экшен"
          className="mt-2"
        />
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-foreground">
          Содержание
        </label>
        <div className="mt-2">
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <MarkdownEditor
                id="content"
                value={field.value}
                onChange={field.onChange}
                placeholder="Опишите тему. Поддерживается Markdown."
                error={!!errors.content}
              />
            )}
          />
        </div>
        {errors.content && (
          <p className="mt-1 text-sm text-destructive">{errors.content.message}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          Максимум 10 МБ на изображение (JPG, PNG, GIF).
        </p>
      </div>
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? isEdit ? "Сохранение..." : "Публикация..."
            : isEdit ? "Сохранить" : "Опубликовать"}
        </Button>
      </div>
    </form>
  );
}
