"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/forum", label: "Форумы" },
  { href: "/search", label: "Поиск" },
  { href: "/auth/login", label: "Войти" },
  { href: "/auth/register", label: "Регистрация" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  useEffect(() => {
    if (open && panelRef.current) {
      const firstLink = panelRef.current.querySelector<HTMLElement>("a[href]");
      firstLink?.focus();
    }
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-md p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-muted-foreground transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Закрыть меню" : "Открыть меню"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden="true">
          {open ? (
            <path d="M18 6 6 18M6 6l12 12" />
          ) : (
            <>
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 top-14 z-40 bg-black/40 transition-opacity duration-200"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <div
        ref={panelRef}
        id="mobile-nav"
        role="dialog"
        aria-modal={open}
        aria-label="Мобильное меню"
        className={cn(
          "fixed left-0 right-0 top-14 z-50 border-b border-border bg-background shadow-lg transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0 pointer-events-none"
        )}
      >
        <nav className="container flex flex-col gap-1 py-4 px-4" aria-label="Мобильная навигация">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-4 py-3 min-h-[44px] flex items-center text-sm font-medium text-foreground transition-colors duration-200 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={close}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
