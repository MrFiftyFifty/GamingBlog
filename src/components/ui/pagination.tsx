"use client";

import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "dots")[] = [];
  const delta = 1;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "dots") {
      pages.push("dots");
    }
  }

  return (
    <nav className={cn("flex items-center justify-center gap-1", className)} aria-label="Навигация по страницам">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
        aria-label="Предыдущая страница"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
      </button>
      {pages.map((p, i) =>
        p === "dots" ? (
          <span key={`dots-${i}`} className="inline-flex h-9 w-9 items-center justify-center text-sm text-muted-foreground">
            ...
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors duration-200",
              p === currentPage
                ? "bg-accent-signature text-accent-signature-foreground"
                : "hover:bg-accent"
            )}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
        aria-label="Следующая страница"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
      </button>
    </nav>
  );
}
