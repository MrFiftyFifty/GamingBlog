"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface SpoilerProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

export function Spoiler({ children, label = "Спойлер", className }: SpoilerProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className={cn("my-3 rounded-lg border border-border", className)}>
      <button
        type="button"
        onClick={() => setRevealed(!revealed)}
        className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-accent/30"
        aria-expanded={revealed}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("transition-transform duration-200", revealed && "rotate-90")}
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        {label}
      </button>
      {revealed && (
        <div className="border-t border-border px-4 py-3">
          {children}
        </div>
      )}
    </div>
  );
}
