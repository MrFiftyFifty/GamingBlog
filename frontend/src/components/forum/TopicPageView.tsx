"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { TopicContent } from "@/components/forum/TopicContent";
import { SECTION_NAMES, FEATURES } from "@/lib/constants";
import { MOCK_TOPICS } from "@/lib/mock-data";
import { useTopic } from "@/hooks/use-forum";

export function TopicPageView({
  slug,
  id,
}: {
  slug: string;
  id: string;
}) {
  const sectionName = SECTION_NAMES[slug];
  if (!sectionName) notFound();

  const { data: apiTopic, isLoading, error } = useTopic(
    FEATURES.forum ? slug : null,
    FEATURES.forum ? id : null
  );

  const mockTopic = MOCK_TOPICS[id];
  const topic = FEATURES.forum ? apiTopic : mockTopic;

  if (FEATURES.forum && isLoading) {
    return (
      <div className="container px-4 py-8 md:px-6 text-muted-foreground">
        Загрузка темы...
      </div>
    );
  }

  if (FEATURES.forum && (error || !topic)) {
    notFound();
  }

  if (!topic || (!FEATURES.forum && (!mockTopic || mockTopic.sectionSlug !== slug))) {
    notFound();
  }

  return (
    <div className="container px-4 py-8 md:px-6">
      <nav className="mb-6 text-fluid-caption text-muted-foreground">
        <Link href="/forum" className="transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
          Форумы
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/forum/${slug}`} className="hover:text-foreground">
          {sectionName}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{topic.title}</span>
      </nav>
      <article className="rounded-lg border border-border bg-card">
        <header className="border-b border-border px-4 py-5 md:px-6 md:py-6">
          <h1 className="font-display text-fluid-display font-bold tracking-tight text-foreground">
            {topic.title}
          </h1>
          <p className="mt-2 text-fluid-caption text-muted-foreground">
            <Link
              href={`/user/${topic.author}`}
              className="transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded font-medium text-foreground"
            >
              {topic.author}
            </Link>
            {" · "}
            {topic.createdAt}
          </p>
        </header>
        <div className="px-4 py-6 md:px-6 md:py-8">
          <MarkdownContent content={topic.content} />
        </div>
      </article>

      <TopicContent sectionSlug={slug} topicId={id} posts={topic.posts} />

      <div className="mt-6 flex gap-4">
        <Button asChild>
          <Link href={`/forum/${slug}`}>Назад к разделу</Link>
        </Button>
      </div>
    </div>
  );
}
