"use client";

import { cn } from "@/lib/utils";

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const SORT_OPTIONS = [
  { value: "new", label: "Новые" },
  { value: "active", label: "Активные" },
  { value: "popular", label: "Популярные" },
];

export function SortSelect({ value, onChange, className }: SortSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Сортировка тем"
      className={cn(
        "rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]",
        className
      )}
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
