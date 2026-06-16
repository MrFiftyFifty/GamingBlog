"use client";

import { useState, useRef, useEffect } from "react";
import { FONT_SIZES, type FontSize } from "@/lib/constants";

const STORAGE_KEY = "font-size";

function applyFontSize(size: FontSize) {
  const scale = FONT_SIZES.find((s) => s.value === size)?.scale ?? 1;
  document.documentElement.style.setProperty("--text-scale", String(scale));
  document.documentElement.dataset.fontSize = size;
}

export function FontSizeToggle() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<FontSize>("md");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as FontSize | null) ?? "md";
    setCurrent(stored);
    applyFontSize(stored);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function handleChange(size: FontSize) {
    setCurrent(size);
    applyFontSize(size);
    localStorage.setItem(STORAGE_KEY, size);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-md p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Размер шрифта"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 7V4h16v3" />
          <path d="M9 20h6" />
          <path d="M12 4v16" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-40 rounded-lg border border-border bg-card shadow-lg animate-slide-up z-50 py-1"
        >
          {FONT_SIZES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="menuitemradio"
              aria-checked={current === value}
              onClick={() => handleChange(value)}
              className={`flex w-full items-center justify-between px-3 py-2 text-sm transition-colors duration-150 hover:bg-accent ${
                current === value ? "text-accent-signature" : "text-foreground"
              }`}
            >
              <span>{label}</span>
              {current === value && (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
