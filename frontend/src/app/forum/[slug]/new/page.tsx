import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { TopicForm } from "@/components/forum/TopicForm";
import { SECTION_NAMES } from "@/lib/constants";
import { getSectionSlugParams } from "@/lib/static-params";

export const metadata: Metadata = {
  title: "Создать тему — Игровой форум",
};

export function generateStaticParams() {
  return getSectionSlugParams();
}

export default function NewTopicPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const sectionName = SECTION_NAMES[slug];
  if (!sectionName) notFound();

  return (
    <div className="container px-4 py-8 md:px-6 max-w-3xl">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/forum" className="hover:text-foreground">Форумы</Link>
        <span className="mx-2">/</span>
        <Link href={`/forum/${slug}`} className="hover:text-foreground">{sectionName}</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Новая тема</span>
      </nav>
      <h1 className="font-display text-fluid-display font-bold tracking-tight">Создать тему</h1>
      <p className="mt-2 text-muted-foreground">Раздел: {sectionName}</p>
      <TopicForm slug={slug} />
      <div className="mt-6">
        <Button variant="outline" asChild>
          <Link href={`/forum/${slug}`}>Отмена</Link>
        </Button>
      </div>
    </div>
  );
}
