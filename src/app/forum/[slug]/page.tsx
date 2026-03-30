"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TopicCard } from "@/components/forum/TopicCard";
import { SortSelect } from "@/components/forum/SortSelect";
import { Pagination } from "@/components/ui/pagination";
import { SECTION_NAMES } from "@/lib/constants";
import { getTopicListForSection } from "@/lib/mock-data";

const PAGE_SIZE = 10;

export default function SectionPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const sectionName = SECTION_NAMES[slug];
  if (!sectionName) notFound();

  const [sort, setSort] = useState("new");
  const [page, setPage] = useState(1);

  const allTopics = getTopicListForSection(slug);

  const sorted = [...allTopics].sort((a, b) => {
    if (sort === "popular") return b.views - a.views;
    if (sort === "active") return b.replies - a.replies;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const topics = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="container px-4 py-8 md:px-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <nav className="text-fluid-caption text-muted-foreground">
            <Link href="/forum" className="transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">Форумы</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{sectionName}</span>
          </nav>
          <h1 className="mt-2 font-display text-fluid-display font-bold tracking-tight text-foreground">{sectionName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <SortSelect value={sort} onChange={(v) => { setSort(v); setPage(1); }} />
          <Button asChild>
            <Link href={`/forum/${slug}/new`}>Создать тему</Link>
          </Button>
        </div>
      </div>
      <div className="rounded-lg border border-border">
        <div className="grid grid-cols-1 gap-0 md:grid-cols-[1fr_120px_100px_80px] md:gap-4 border-b border-border bg-muted/50 px-4 py-3 text-fluid-caption font-medium text-muted-foreground md:px-6">
          <span>Тема</span>
          <span className="hidden md:block">Ответы</span>
          <span className="hidden md:block">Просмотры</span>
          <span className="hidden md:block">Дата</span>
        </div>
        {topics.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground">В этом разделе пока нет тем.</p>
        ) : (
          topics.map((topic) => (
            <TopicCard
              key={topic.id}
              slug={slug}
              id={topic.id}
              title={topic.title}
              author={topic.author}
              replies={topic.replies}
              views={topic.views}
              pinned={topic.pinned}
              createdAt={topic.createdAt}
            />
          ))
        )}
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          className="mt-6"
        />
      )}
    </div>
  );
}
