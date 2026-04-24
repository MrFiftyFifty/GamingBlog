"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const MOCK_USER = {
  username: "",
  reputation: 120,
  postsCount: 45,
  joinedAt: "январь 2024",
  role: "user" as const,
  badges: [
    { id: "1", name: "Первый пост", icon: "📝" },
    { id: "2", name: "10 ответов", icon: "💬" },
    { id: "3", name: "Полезный контент", icon: "⭐" },
  ],
  recentTopics: [
    { id: "1", title: "Marathon — первый взгляд на новый шутер от Bungie", sectionSlug: "rpg", createdAt: "15 мар 2026" },
    { id: "2", title: "Crimson Desert — дата выхода и подробности", sectionSlug: "rpg", createdAt: "14 мар 2026" },
  ],
};

export default function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;
  const { user: currentUser } = useAuth();
  const user = { ...MOCK_USER, username };
  const isOwnProfile = currentUser?.name === username;

  return (
    <div className="container px-4 py-8 md:px-6 max-w-3xl">
      <div className="rounded-lg border border-border bg-card p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="h-24 w-24 shrink-0 rounded-full bg-muted flex items-center justify-center text-3xl font-bold text-muted-foreground">
            {username.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-fluid-display font-bold tracking-tight">{username}</h1>
              {user.role !== "user" && (
                <span className="rounded bg-accent-signature/10 px-2 py-0.5 text-xs font-medium text-accent-signature capitalize">
                  {user.role === "moderator" ? "Модератор" : "Администратор"}
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>Репутация: <strong className="text-foreground">{user.reputation}</strong></span>
              <span>Сообщений: <strong className="text-foreground">{user.postsCount}</strong></span>
              <span>На форуме с {user.joinedAt}</span>
            </div>
            {user.badges.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {user.badges.map((badge) => (
                  <span
                    key={badge.id}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                    title={badge.name}
                  >
                    {badge.icon} {badge.name}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-4 flex gap-2">
              {isOwnProfile ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/profile">Редактировать профиль</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/messages">Написать сообщение</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
        <section className="mt-8">
          <h2 className="font-display text-fluid-title font-semibold text-foreground">Последние темы</h2>
          {user.recentTopics.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Пользователь еще не создавал тем.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {user.recentTopics.map((t) => (
                <li key={t.id} className="rounded-md border border-border p-3 transition-colors duration-200 hover:bg-accent/30">
                  <Link href={`/forum/${t.sectionSlug}/topic/${t.id}`} className="text-sm font-medium text-foreground hover:text-accent-signature transition-colors duration-200">
                    {t.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t.createdAt}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
