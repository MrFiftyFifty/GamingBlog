"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { MOCK_TOPICS } from "@/lib/mock-data";
import { SECTION_NAMES } from "@/lib/constants";

function getLocalResults(query: string) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return Object.values(MOCK_TOPICS)
    .filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q) ||
        t.author.toLowerCase().includes(q)
    )
    .map((t) => ({
      id: t.sectionSlug === "rpg" ? "1" : t.sectionSlug === "action" ? "2" : "3",
      topicId: Object.entries(MOCK_TOPICS).find(([, v]) => v === t)?.[0] ?? "1",
      title: t.title,
      sectionSlug: t.sectionSlug,
      sectionName: SECTION_NAMES[t.sectionSlug] ?? t.sectionSlug,
      author: t.author,
      excerpt: t.content.slice(0, 150) + "...",
      createdAt: t.createdAt,
    }));
}

const PAGE_SIZE = 10;

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") ?? "";
  const initialPage = Number(searchParams.get("page") ?? "1");

  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [page, setPage] = useState(initialPage);

  const results = submittedQuery ? getLocalResults(submittedQuery) : [];
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const paged = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSubmittedQuery(query);
      setPage(1);
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      router.replace(`/search?${params.toString()}`);
    },
    [query, router]
  );

  function handlePageChange(p: number) {
    setPage(p);
    const params = new URLSearchParams();
    if (submittedQuery) params.set("q", submittedQuery);
    if (p > 1) params.set("page", String(p));
    router.replace(`/search?${params.toString()}`);
  }

  return (
    <div className="container px-4 py-8 md:px-6">
      <h1 className="mb-6 font-display text-fluid-display font-bold tracking-tight text-foreground">Поиск по форуму</h1>
      <form className="mb-8 flex flex-col gap-3 sm:flex-row sm:gap-2" onSubmit={handleSearch}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Введите запрос..."
          aria-label="Поиск по форуму"
          className="flex-1 min-h-[44px] rounded-md border border-input bg-background px-3 py-2 text-fluid-body text-foreground placeholder:text-muted-foreground transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
        <Button type="submit" className="min-h-[44px]">Искать</Button>
      </form>
      <div className="rounded-lg border border-border">
        {!submittedQuery ? (
          <p className="p-8 text-center text-fluid-body text-muted-foreground">
            Введите запрос и нажмите &laquo;Искать&raquo;. Результаты появятся здесь.
          </p>
        ) : paged.length === 0 ? (
          <p className="p-8 text-center text-fluid-body text-muted-foreground">
            По запросу &laquo;{submittedQuery}&raquo; ничего не найдено.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {paged.map((r, i) => (
              <li key={`${r.topicId}-${i}`} className="p-4 transition-colors duration-200 hover:bg-accent/30">
                <Link href={`/forum/${r.sectionSlug}/topic/${r.topicId}`} className="font-medium text-foreground hover:text-accent-signature transition-colors duration-200">
                  {r.title}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{r.excerpt}</p>
                <p className="mt-1 text-xs text-muted-foreground">{r.sectionName} · {r.author} · {r.createdAt}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
      {submittedQuery && totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="mt-6"
        />
      )}
    </div>
  );
}
