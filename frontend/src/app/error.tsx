"use client";

import { Button } from "@/components/ui/button";

export default function RootError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container flex min-h-[50dvh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-fluid-display font-bold tracking-tight text-foreground">
        Произошла ошибка
      </h1>
      <p className="mt-3 text-fluid-body text-muted-foreground max-w-md">
        Что-то пошло не так. Попробуйте обновить страницу.
      </p>
      <Button onClick={reset} className="mt-6">
        Попробовать снова
      </Button>
    </div>
  );
}
