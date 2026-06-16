"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/MobileNav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { FontSizeToggle } from "@/components/ui/font-size-toggle";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

function IconSearch({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("h-5 w-5", className)} aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("h-5 w-5", className)} aria-hidden="true">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconBell({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("h-5 w-5", className)} aria-hidden="true">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function UserDropdown() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full p-1 transition-colors duration-200 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {user.image ? (
          <img src={user.image} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-signature text-sm font-semibold text-accent-signature-foreground">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="hidden text-sm font-medium text-foreground lg:inline">
          {user.name}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-card shadow-lg animate-slide-up z-50">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <nav className="py-1">
            {[
              { href: "/profile", label: "Профиль", show: true },
              { href: "/profile/achievements", label: "Достижения", show: true },
              { href: "/messages", label: "Сообщения", show: true },
              { href: "/notifications", label: "Уведомления", show: true },
              { href: "/settings", label: "Настройки", show: true },
              { href: "/moderation", label: "Модерация", show: user.role === "moderator" || user.role === "admin" },
            ].filter((item) => item.show).map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-foreground transition-colors duration-150 hover:bg-accent"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-border py-1">
            <button
              type="button"
              onClick={() => { setOpen(false); signOut(); }}
              className="block w-full px-4 py-2 text-left text-sm text-destructive transition-colors duration-150 hover:bg-destructive/10"
            >
              Выйти
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-display font-semibold text-foreground text-lg tracking-tight transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded" aria-label="На главную">
          <span className="text-accent-signature font-bold">/</span>
          Игровой форум
        </Link>
        <nav className="hidden flex-1 gap-6 md:flex" aria-label="Основная навигация">
          <Link href="/forum" className="text-sm font-medium text-muted-foreground transition-colors duration-200 ease-out-expo hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-1 py-2">
            Форумы
          </Link>
          <Link href="/search" className="text-sm font-medium text-muted-foreground transition-colors duration-200 ease-out-expo hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-1 py-2">
            Поиск
          </Link>
        </nav>
        <div className="flex items-center gap-1">
          <Link href="/search" className="rounded-md p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:hidden" aria-label="Поиск">
            <IconSearch />
          </Link>
          <FontSizeToggle />
          <ThemeToggle />

          {!isLoading && isAuthenticated && (
            <Link href="/notifications" className="relative rounded-md p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" aria-label="Уведомления">
              <IconBell />
            </Link>
          )}

          <MobileNav />

          {isLoading ? (
            <div className="hidden md:block h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : isAuthenticated ? (
            <div className="hidden md:block">
              <UserDropdown />
            </div>
          ) : (
            <div className="hidden gap-2 md:flex">
              <Button variant="ghost" asChild className="min-h-[44px]">
                <Link href="/auth/login">Войти</Link>
              </Button>
              <Button asChild className="min-h-[44px] bg-accent-signature text-accent-signature-foreground hover:bg-accent-signature/90 transition-[transform,background-color] duration-300 ease-out-expo hover:scale-[1.02]">
                <Link href="/auth/register">Регистрация</Link>
              </Button>
            </div>
          )}

          {!isLoading && !isAuthenticated && (
            <Link href="/auth/login" className="rounded-full p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:hidden" aria-label="Войти">
              <IconUser />
            </Link>
          )}
          {!isLoading && isAuthenticated && (
            <div className="md:hidden">
              <Link href="/profile" className="rounded-full p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" aria-label="Профиль">
                <IconUser />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
