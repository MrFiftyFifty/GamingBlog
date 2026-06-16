"use client";

import { MOCK_BADGES } from "@/lib/mocks/api-mocks";
import { Reputation } from "@/components/ui/reputation";
import { useAuth } from "@/hooks/useAuth";

export default function AchievementsPage() {
  const { user } = useAuth();

  const earned = MOCK_BADGES.filter((b) => b.earnedAt);
  const locked = MOCK_BADGES.filter((b) => !b.earnedAt);

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-fluid-display font-bold tracking-tight text-foreground">
          Достижения
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {user?.name ?? "Гость"}
          <span className="mx-2">·</span>
          <Reputation value={128} showLabel />
        </p>
      </div>

      <section className="mb-10">
        <h2 className="font-display text-fluid-title font-semibold mb-4">
          Получено ({earned.length})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {earned.map((b) => (
            <div
              key={b.id}
              className="rounded-lg border border-border bg-card p-4 text-center transition-transform duration-200 hover:-translate-y-0.5"
              title={b.description}
            >
              <div className="text-4xl" aria-hidden="true">{b.icon}</div>
              <p className="mt-2 text-sm font-semibold text-foreground">{b.name}</p>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{b.description}</p>
              <p className="mt-2 text-xs text-accent-signature">{b.earnedAt}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-fluid-title font-semibold mb-4">
          Заблокированы ({locked.length})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {locked.map((b) => (
            <div
              key={b.id}
              className="rounded-lg border border-border bg-muted/40 p-4 text-center opacity-60"
              title={b.description}
            >
              <div className="text-4xl grayscale" aria-hidden="true">{b.icon}</div>
              <p className="mt-2 text-sm font-semibold text-muted-foreground">{b.name}</p>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{b.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">Не получено</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
