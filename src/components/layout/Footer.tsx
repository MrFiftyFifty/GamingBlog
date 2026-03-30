"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export function Footer() {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container flex flex-col gap-6 py-8 px-4 md:px-6 md:flex-row md:justify-between md:items-center">
        <div className="flex flex-col gap-2">
          <Link href="/" className="font-semibold text-foreground transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
            Игровой форум
          </Link>
          <p className="text-sm text-muted-foreground">
            Сообщество для обсуждения компьютерных игр
          </p>
        </div>
        <nav className="flex flex-wrap gap-6 text-sm" aria-label="Дополнительная навигация">
          <Link href="/forum" className="text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-1 py-2">
            Форумы
          </Link>
          <Link href="/search" className="text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-1 py-2">
            Поиск
          </Link>
          {!isAuthenticated && (
            <Link href="/auth/login" className="text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-1 py-2">
              Войти
            </Link>
          )}
        </nav>
      </div>
      <div className="border-t border-border py-4">
        <div className="container px-4 md:px-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Игровой форум. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
