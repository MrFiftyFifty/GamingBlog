import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { FeaturedCard } from "@/components/home/FeaturedCard";
import { NewsCard } from "@/components/home/NewsCard";
import { ScrollReveal } from "@/components/providers/ScrollReveal";
import { FEATURED, NEWS_ITEMS, ACTIVE_DISCUSSIONS } from "@/lib/mock-data";
import { assetPath } from "@/lib/asset-path";

export const metadata: Metadata = {
  title: "Игровой форум — обсуждение компьютерных игр",
  description: "Сообщество для обсуждения компьютерных игр. Гайды, впечатления, обзоры и поиск команды.",
};

export default function HomePage() {
  return (
    <div className="w-full">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src={assetPath("/images/home/featured.jpg")}
            alt=""
            fill
            className="object-cover opacity-[0.08] dark:opacity-[0.15]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>

        <div className="container px-4 sm:px-6">
          <div className="hero-stagger flex min-h-[70dvh] flex-col justify-center py-20 md:py-28 lg:py-32">
            <p className="text-fluid-caption font-medium uppercase tracking-[0.2em] text-accent-signature">
              Сообщество геймеров
            </p>
            <h1 className="mt-4 font-display text-fluid-hero font-bold leading-[0.95] tracking-[-0.03em] text-foreground">
              Обсуждаем
              <br />
              <span className="text-accent-signature">игры</span> вместе
            </h1>
            <p className="mt-6 max-w-lg text-fluid-body text-muted-foreground leading-relaxed md:mt-8">
              Гайды, впечатления, новости и поиск команды. Место, где геймеры обсуждают то, что важно.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 md:mt-10">
              <Button asChild size="lg" className="min-h-[52px] px-8 bg-accent-signature text-accent-signature-foreground hover:bg-accent-signature/90 transition-[transform,background-color] duration-300 ease-out-expo hover:scale-[1.03] font-display font-semibold text-base">
                <Link href="/auth/register">Присоединиться</Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="min-h-[52px] px-8 transition-[transform,color,border-color] duration-300 ease-out-expo hover:scale-[1.03] font-display font-medium text-base">
                <Link href="/forum">Смотреть обсуждения</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container px-4 sm:px-6 mt-4 lg:mt-8">
        <ScrollReveal>
          <FeaturedCard
            href={FEATURED.href}
            title={FEATURED.title}
            excerpt={FEATURED.excerpt}
            imageSrc={FEATURED.imageSrc}
            imageAlt={FEATURED.imageAlt}
            category={FEATURED.category}
          />
        </ScrollReveal>
      </section>

      <section className="container px-4 sm:px-6 mt-20 lg:mt-28">
        <ScrollReveal>
          <div className="flex items-end justify-between gap-4 mb-8 md:mb-10">
            <div>
              <p className="text-fluid-caption font-medium uppercase tracking-[0.15em] text-accent-signature">Свежее</p>
              <h2 className="mt-1 font-display text-fluid-display font-bold tracking-tight text-foreground">
                Новости и новинки
              </h2>
            </div>
            <Link href="/forum" className="hidden text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground sm:block">
              Все обсуждения &rarr;
            </Link>
          </div>
        </ScrollReveal>
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {NEWS_ITEMS.map((item, i) => (
            <ScrollReveal key={i} delay={i * 80}>
              <NewsCard
                href={item.href}
                title={item.title}
                excerpt={item.excerpt}
                imageSrc={item.imageSrc}
                imageAlt={item.imageAlt}
                date={item.date}
              />
            </ScrollReveal>
          ))}
        </div>
        <div className="mt-8 sm:hidden">
          <Button variant="outline" asChild size="lg" className="min-h-[44px] w-full">
            <Link href="/forum">Все обсуждения</Link>
          </Button>
        </div>
      </section>

      <section className="container px-4 sm:px-6 mt-24 lg:mt-32 pb-20 lg:pb-28">
        <ScrollReveal>
          <div className="flex items-end justify-between gap-4 mb-8 md:mb-10">
            <div>
              <p className="text-fluid-caption font-medium uppercase tracking-[0.15em] text-accent-signature">Горячее</p>
              <h2 className="mt-1 font-display text-fluid-display font-bold tracking-tight text-foreground">
                Активные обсуждения
              </h2>
            </div>
            <Link href="/forum" className="hidden text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground sm:block">
              Все разделы &rarr;
            </Link>
          </div>
        </ScrollReveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIVE_DISCUSSIONS.map((t, i) => (
            <ScrollReveal key={`${t.slug}-${t.id}`} delay={i * 80}>
              <Link
                href={`/forum/${t.slug}/topic/${t.id}`}
                className="block rounded-xl border border-border bg-card p-6 text-card-foreground transition-[transform,box-shadow,background-color] duration-300 ease-out-expo hover:bg-accent/40 hover:shadow-lg hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <h3 className="font-display text-fluid-title font-semibold text-foreground leading-snug">{t.title}</h3>
                <p className="mt-3 text-fluid-caption text-muted-foreground leading-snug line-clamp-2">{t.excerpt}</p>
                <div className="mt-4 flex items-center gap-3 text-fluid-caption text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    {t.replies}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    {t.views}
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" asChild size="lg" className="min-h-[44px] w-full">
            <Link href="/forum">Все разделы</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
