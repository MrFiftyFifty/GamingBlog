"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const GENRES = [
  "RPG", "Экшен", "Стратегии", "Шутеры", "Инди", "Хоррор",
  "Симуляторы", "Спортивные", "Гонки", "Файтинги", "Пазлы", "VR",
];

const GAMES = [
  "GTA VI", "Marathon", "Elder Scrolls VI", "Elden Ring",
  "Baldur's Gate 3", "The Witcher 4", "Crimson Desert", "Cyberpunk 2077",
  "Starfield", "Hollow Knight: Silksong", "Death Stranding 2", "Doom: The Dark Ages",
  "Civilization VII", "Black Myth: Wukong", "Hades II", "Fable",
];

export default function WelcomePage() {
  const router = useRouter();
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());
  const [selectedGames, setSelectedGames] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<1 | 2>(1);
  const [saving, setSaving] = useState(false);

  function toggleGenre(g: string) {
    setSelectedGenres((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  }

  function toggleGame(g: string) {
    setSelectedGames((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  }

  async function handleFinish() {
    setSaving(true);
    try {
      // API call would go here
      await new Promise((r) => setTimeout(r, 500));
      toast.success("Добро пожаловать на форум!");
      router.push("/forum");
    } catch {
      toast.error("Произошла ошибка");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container px-4 py-12 md:px-6 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="font-display text-fluid-display font-bold tracking-tight text-foreground">
          Добро пожаловать!
        </h1>
        <p className="mt-2 text-fluid-body text-muted-foreground">
          Расскажите нам о ваших игровых предпочтениях, чтобы мы персонализировали ленту.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <span className={cn("h-2 w-8 rounded-full", step >= 1 ? "bg-accent-signature" : "bg-muted")} />
          <span className={cn("h-2 w-8 rounded-full", step >= 2 ? "bg-accent-signature" : "bg-muted")} />
        </div>
      </div>
      {step === 1 ? (
        <div>
          <h2 className="font-display text-fluid-title font-semibold text-foreground mb-4">
            Какие жанры вам интересны?
          </h2>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => toggleGenre(g)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
                  selectedGenres.has(g)
                    ? "border-accent-signature bg-accent-signature text-accent-signature-foreground scale-105"
                    : "border-border bg-card text-foreground hover:border-accent-signature/50 hover:bg-accent-signature/5"
                )}
              >
                {g}
              </button>
            ))}
          </div>
          <div className="mt-8 flex gap-3">
            <Button
              onClick={() => setStep(2)}
              disabled={selectedGenres.size === 0}
            >
              Далее
            </Button>
            <Button variant="ghost" onClick={() => router.push("/forum")}>
              Пропустить
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="font-display text-fluid-title font-semibold text-foreground mb-4">
            Какие игры вас интересуют?
          </h2>
          <div className="flex flex-wrap gap-2">
            {GAMES.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => toggleGame(g)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
                  selectedGames.has(g)
                    ? "border-accent-signature bg-accent-signature text-accent-signature-foreground scale-105"
                    : "border-border bg-card text-foreground hover:border-accent-signature/50 hover:bg-accent-signature/5"
                )}
              >
                {g}
              </button>
            ))}
          </div>
          <div className="mt-8 flex gap-3">
            <Button onClick={handleFinish} disabled={saving}>
              {saving ? "Сохранение..." : "Завершить"}
            </Button>
            <Button variant="outline" onClick={() => setStep(1)}>
              Назад
            </Button>
            <Button variant="ghost" onClick={() => router.push("/forum")}>
              Пропустить
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
