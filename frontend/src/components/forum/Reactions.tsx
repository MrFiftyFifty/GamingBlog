"use client";

import { useState } from "react";
import { REACTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ReactionsProps {
  postId: string;
  initialCounts?: Record<string, number>;
  initialMyReaction?: string | null;
  onReact?: (postId: string, reaction: string | null) => void;
}

export function Reactions({
  postId,
  initialCounts = {},
  initialMyReaction = null,
  onReact,
}: ReactionsProps) {
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
  const [myReaction, setMyReaction] = useState<string | null>(initialMyReaction);

  function handleClick(name: string) {
    setCounts((prev) => {
      const next = { ...prev };
      if (myReaction) next[myReaction] = Math.max(0, (next[myReaction] ?? 1) - 1);
      if (myReaction !== name) next[name] = (next[name] ?? 0) + 1;
      return next;
    });
    const newReaction = myReaction === name ? null : name;
    setMyReaction(newReaction);
    onReact?.(postId, newReaction);
  }

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-full border border-border bg-background p-0.5"
      role="group"
      aria-label="Реакции"
    >
      {REACTIONS.map(({ emoji, name, label }) => {
        const count = counts[name] ?? 0;
        const isActive = myReaction === name;
        return (
          <button
            key={name}
            type="button"
            onClick={() => handleClick(name)}
            aria-label={`${label}${count ? `: ${count}` : ""}`}
            aria-pressed={isActive}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "bg-accent-signature/15 text-accent-signature scale-105"
                : "hover:bg-accent text-muted-foreground hover:text-foreground"
            )}
          >
            <span aria-hidden="true" className="text-sm leading-none">{emoji}</span>
            {count > 0 && <span className="tabular-nums">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
