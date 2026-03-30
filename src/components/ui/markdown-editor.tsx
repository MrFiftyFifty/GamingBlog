"use client";

import { useState, useRef, useCallback, forwardRef } from "react";
import { MarkdownContent } from "./markdown-content";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  error?: boolean;
  id?: string;
  name?: string;
}

function insertMarkdown(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  onChange: (v: string) => void
) {
  const { selectionStart, selectionEnd, value } = textarea;
  const selected = value.slice(selectionStart, selectionEnd);
  const replacement = `${before}${selected || "текст"}${after}`;
  const newValue =
    value.slice(0, selectionStart) + replacement + value.slice(selectionEnd);
  onChange(newValue);

  requestAnimationFrame(() => {
    textarea.focus();
    const cursorPos = selectionStart + before.length + (selected || "текст").length;
    textarea.setSelectionRange(
      selectionStart + before.length,
      cursorPos
    );
  });
}

const TOOLBAR_ITEMS = [
  { label: "B", title: "Жирный", before: "**", after: "**" },
  { label: "I", title: "Курсив", before: "_", after: "_" },
  { label: "~~", title: "Зачеркнуто", before: "~~", after: "~~" },
  { label: "#", title: "Заголовок", before: "## ", after: "" },
  { label: ">", title: "Цитата", before: "> ", after: "" },
  { label: "</>", title: "Код", before: "`", after: "`" },
  { label: "```", title: "Блок кода", before: "```\n", after: "\n```" },
  { label: "---", title: "Разделитель", before: "\n---\n", after: "" },
  { label: "Link", title: "Ссылка", before: "[", after: "](url)" },
  { label: "Img", title: "Изображение", before: "![alt](", after: ")" },
  { label: "||", title: "Спойлер", before: "||", after: "||" },
];

export const MarkdownEditor = forwardRef<HTMLTextAreaElement, MarkdownEditorProps>(
  function MarkdownEditor(
    { value, onChange, placeholder, rows = 12, error, id, name },
    ref
  ) {
    const [preview, setPreview] = useState(false);
    const localRef = useRef<HTMLTextAreaElement | null>(null);
    const textareaRef = (ref as React.MutableRefObject<HTMLTextAreaElement | null>) || localRef;

    const handleToolbar = useCallback(
      (before: string, after: string) => {
        const el = textareaRef.current;
        if (el) insertMarkdown(el, before, after, onChange);
      },
      [onChange, textareaRef]
    );

    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1 rounded-t-md border border-b-0 border-input bg-muted/50 px-2 py-1.5">
          {TOOLBAR_ITEMS.map((item) => (
            <button
              key={item.title}
              type="button"
              title={item.title}
              onClick={() => handleToolbar(item.before, item.after)}
              className="inline-flex h-8 min-w-[32px] items-center justify-center rounded px-1.5 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
            >
              {item.label}
            </button>
          ))}
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className={cn(
              "inline-flex h-8 items-center rounded px-2 text-xs font-medium transition-colors duration-150",
              preview
                ? "bg-accent-signature text-accent-signature-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {preview ? "Редактор" : "Предпросмотр"}
          </button>
        </div>
        {preview ? (
          <div className="min-h-[200px] rounded-b-md border border-input bg-background p-4">
            {value ? (
              <MarkdownContent content={value} />
            ) : (
              <p className="text-muted-foreground">Нет содержимого для предпросмотра.</p>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            id={id}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            placeholder={placeholder}
            className={cn(
              "w-full rounded-b-md border border-input bg-background px-3 py-2 text-sm text-foreground",
              "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
              error && "border-destructive"
            )}
          />
        )}
      </div>
    );
  }
);
