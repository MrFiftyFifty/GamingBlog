"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface MentionSuggestion {
  username: string;
  avatar?: string | null;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  error?: boolean;
  id?: string;
  className?: string;
}

export function MentionInput({
  value,
  onChange,
  placeholder,
  rows = 6,
  error,
  id,
  className,
}: MentionInputProps) {
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const detectMention = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const pos = el.selectionStart;
    setCursorPos(pos);
    const textBefore = value.slice(0, pos);
    const match = textBefore.match(/@(\w*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setSelectedIndex(0);
    } else {
      setMentionQuery(null);
      setSuggestions([]);
    }
  }, [value]);

  useEffect(() => {
    if (mentionQuery === null || mentionQuery.length < 1) {
      setSuggestions([]);
      return;
    }
    const mockUsers: MentionSuggestion[] = [
      { username: "GameMaster" },
      { username: "ProGamer42" },
      { username: "SteamFan" },
      { username: "RPGLover" },
      { username: "ActionHero" },
    ].filter((u) =>
      u.username.toLowerCase().includes(mentionQuery.toLowerCase())
    );
    setSuggestions(mockUsers.slice(0, 5));
  }, [mentionQuery]);

  function insertMention(username: string) {
    const textBefore = value.slice(0, cursorPos);
    const mentionStart = textBefore.lastIndexOf("@");
    const newValue =
      value.slice(0, mentionStart) +
      `@${username} ` +
      value.slice(cursorPos);
    onChange(newValue);
    setMentionQuery(null);
    setSuggestions([]);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) {
        const newPos = mentionStart + username.length + 2;
        el.focus();
        el.setSelectionRange(newPos, newPos);
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && suggestions.length > 0 && mentionQuery !== null) {
      e.preventDefault();
      insertMention(suggestions[selectedIndex].username);
    } else if (e.key === "Escape") {
      setMentionQuery(null);
      setSuggestions([]);
    }
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={(e) => { onChange(e.target.value); }}
        onKeyUp={detectMention}
        onKeyDown={handleKeyDown}
        onClick={detectMention}
        rows={rows}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground",
          "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
          error && "border-destructive",
          className
        )}
      />
      {suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute left-0 top-full mt-1 w-60 rounded-lg border border-border bg-card shadow-lg z-50 py-1"
        >
          {suggestions.map((s, i) => (
            <button
              key={s.username}
              type="button"
              onClick={() => insertMention(s.username)}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors duration-100",
                i === selectedIndex ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50"
              )}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {s.username[0].toUpperCase()}
              </span>
              @{s.username}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
