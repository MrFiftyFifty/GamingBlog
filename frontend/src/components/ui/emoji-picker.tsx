"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  className?: string;
}

const EMOJI_GROUPS = [
  { label: "Частые", emojis: ["😀", "😂", "😍", "🤔", "😎", "👍", "👎", "🎮", "🔥", "💯", "❤️", "🎯"] },
  { label: "Игры", emojis: ["🎮", "🕹️", "🎲", "🏆", "⚔️", "🛡️", "🗡️", "🎯", "🧙", "🐉", "👾", "🤖"] },
  { label: "Реакции", emojis: ["👍", "👎", "👏", "🙌", "💪", "🤝", "🙏", "✌️", "🤷", "🤦", "😤", "💀"] },
  { label: "Другое", emojis: ["⭐", "💎", "🚀", "💡", "📸", "🎬", "🎵", "📝", "🔗", "⚡", "🌟", "🎉"] },
];

export function EmojiPicker({ onSelect, className }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className={cn("relative inline-block", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex h-8 w-8 items-center justify-center rounded text-lg transition-colors duration-150 hover:bg-accent"
        title="Эмодзи"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        😀
      </button>
      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-72 rounded-lg border border-border bg-card p-3 shadow-lg z-50 animate-slide-up">
          {EMOJI_GROUPS.map((group) => (
            <div key={group.label} className="mb-2">
              <p className="mb-1 text-xs font-medium text-muted-foreground">{group.label}</p>
              <div className="flex flex-wrap gap-1">
                {group.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => { onSelect(emoji); setOpen(false); }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded text-lg transition-colors duration-100 hover:bg-accent"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
