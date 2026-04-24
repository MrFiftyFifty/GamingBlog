"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { Tag } from "@/components/ui/tag";
import { POPULAR_TAGS } from "@/lib/constants";

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  max?: number;
  placeholder?: string;
  id?: string;
}

const TAG_REGEX = /^[a-zа-я0-9_-]{2,24}$/i;

export function TagsInput({
  value,
  onChange,
  max = 5,
  placeholder = "Добавьте тег и нажмите Enter",
  id,
}: TagsInputProps) {
  const [input, setInput] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/^#/, "");
    if (!tag || !TAG_REGEX.test(tag)) return;
    if (value.includes(tag)) return;
    if (value.length >= max) return;
    onChange([...value, tag]);
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && input === "" && value.length) {
      removeTag(value[value.length - 1]);
    }
  }

  const suggestions = POPULAR_TAGS
    .filter(
      (t) =>
        !value.includes(t) &&
        (input === "" || t.toLowerCase().includes(input.toLowerCase()))
    )
    .slice(0, 6);

  return (
    <div>
      <div
        className="flex flex-wrap gap-1.5 rounded-md border border-input bg-background p-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((t) => (
          <Tag key={t} name={t} onRemove={() => removeTag(t)} />
        ))}
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setShowSuggest(true)}
          onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
          placeholder={value.length < max ? placeholder : `Максимум ${max} тегов`}
          disabled={value.length >= max}
          className="flex-1 min-w-[120px] border-0 bg-transparent p-0.5 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />
      </div>
      {showSuggest && suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground mr-1 self-center">Популярные:</span>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(s);
              }}
              className="text-xs rounded-full border border-border bg-background px-2 py-0.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              #{s}
            </button>
          ))}
        </div>
      )}
      <p className="mt-1 text-xs text-muted-foreground">
        {value.length} / {max} тегов · 2–24 символов, буквы/цифры/дефис
      </p>
    </div>
  );
}
