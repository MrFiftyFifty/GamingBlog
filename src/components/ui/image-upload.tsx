"use client";

import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  className?: string;
}

export function ImageUpload({ onUpload, className }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 10 * 1024 * 1024) return;

      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
        const res = await fetch(`${API_BASE}/api/upload`, {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          onUpload(data.url);
        }
      } catch {
        // API not available yet
      } finally {
        setUploading(false);
      }
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      className={cn(
        "relative rounded-lg border-2 border-dashed border-input p-6 text-center transition-colors duration-200",
        isDragging && "border-accent-signature bg-accent-signature/5",
        className
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {preview ? (
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="mx-auto max-h-48 rounded-lg object-contain" />
          {uploading && <p className="text-sm text-muted-foreground">Загрузка...</p>}
          <button
            type="button"
            onClick={() => { setPreview(null); if (inputRef.current) inputRef.current.value = ""; }}
            className="text-sm text-destructive hover:underline"
          >
            Удалить
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted-foreground" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
          <p className="text-sm text-muted-foreground">
            Перетащите изображение или{" "}
            <button type="button" onClick={() => inputRef.current?.click()} className="text-accent-signature underline underline-offset-2 hover:text-accent-signature/80">
              выберите файл
            </button>
          </p>
          <p className="text-xs text-muted-foreground">JPG, PNG, GIF, WebP до 10 МБ</p>
        </div>
      )}
    </div>
  );
}
