import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { TopicForm } from "@/components/forum/TopicForm";
import { SECTION_NAMES } from "@/lib/constants";
import { MOCK_TOPICS } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Редактировать тему — Игровой форум",
};

export default function EditTopicPage({
  params,
}: {
  params: { slug: string; id: string };
}) {
  const { slug, id } = params;
  const sectionName = SECTION_NAMES[slug];
  if (!sectionName) notFound();

  const topic = MOCK_TOPICS[id];
  if (!topic || topic.sectionSlug !== slug) notFound();

  return (
    <div className="container px-4 py-8 md:px-6 max-w-3xl">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/forum" className="hover:text-foreground">Форумы</Link>
        <span className="mx-2">/</span>
        <Link href={`/forum/${slug}`} className="hover:text-foreground">{sectionName}</Link>
        <span className="mx-2">/</span>
        <Link href={`/forum/${slug}/topic/${id}`} className="hover:text-foreground">{topic.title}</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Редактирование</span>
      </nav>
      <h1 className="font-display text-fluid-display font-bold tracking-tight">Редактировать тему</h1>
      <TopicForm
        slug={slug}
        topicId={id}
        defaultValues={{
          title: topic.title,
          tags: topic.tags?.join(", ") ?? "",
          content: topic.content,
        }}
      />
      <div className="mt-6">
        <Button variant="outline" asChild>
          <Link href={`/forum/${slug}/topic/${id}`}>Отмена</Link>
        </Button>
      </div>
    </div>
  );
}
