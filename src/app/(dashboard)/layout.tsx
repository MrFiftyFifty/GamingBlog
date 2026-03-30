"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/profile", label: "Профиль" },
  { href: "/notifications", label: "Уведомления" },
  { href: "/messages", label: "Сообщения" },
  { href: "/settings", label: "Настройки" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container px-4 py-8 md:px-6">
      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="w-full md:w-56 shrink-0">
          <nav className="rounded-lg border border-border bg-card p-2" aria-label="Личный кабинет">
            <ul className="space-y-1">
              {navItems.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "block rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200",
                      pathname === href
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    )}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
