import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[70dvh] flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-[clamp(6rem,20vw,14rem)] font-bold leading-none tracking-[-0.05em] text-accent-signature/15 select-none">
        404
      </p>
      <h1 className="-mt-4 font-display text-fluid-display font-bold tracking-tight text-foreground sm:-mt-8">
        Страница не найдена
      </h1>
      <p className="mt-4 text-fluid-body text-muted-foreground max-w-md leading-relaxed">
        Такой страницы не существует. Возможно, она была удалена или вы перешли по неверной ссылке.
      </p>
      <div className="mt-10 flex gap-4">
        <Button asChild size="lg" className="min-h-[52px] px-8 bg-accent-signature text-accent-signature-foreground hover:bg-accent-signature/90 font-display font-semibold">
          <Link href="/">На главную</Link>
        </Button>
        <Button variant="outline" asChild size="lg" className="min-h-[52px] px-8 font-display font-medium">
          <Link href="/forum">К форумам</Link>
        </Button>
      </div>
    </div>
  );
}
