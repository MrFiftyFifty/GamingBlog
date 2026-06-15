"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { reportSchema, type ReportFormData } from "@/lib/validations/forum";
import * as forumApi from "@/lib/api/forum";
import { cn } from "@/lib/utils";

const REASONS = [
  "Спам",
  "Оскорбления",
  "Нецензурная лексика",
  "Реклама",
  "Нарушение правил",
  "Другое",
];

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  postId: string;
}

export function ReportModal({ open, onClose, postId }: ReportModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
  });

  async function onSubmit(data: ReportFormData) {
    try {
      await forumApi.reportPost(postId, {
        reason: data.reason,
        description: data.description,
      });
      toast.success("Жалоба отправлена");
      reset();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Произошла ошибка");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Пожаловаться">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Причина</label>
          <select
            {...register("reason")}
            className={cn(
              "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              errors.reason && "border-destructive"
            )}
          >
            <option value="">Выберите причину...</option>
            {REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {errors.reason && (
            <p className="mt-1 text-sm text-destructive">{errors.reason.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Описание (необязательно)</label>
          <textarea
            {...register("description")}
            rows={3}
            placeholder="Опишите подробнее..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {isSubmitting ? "Отправка..." : "Отправить"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
