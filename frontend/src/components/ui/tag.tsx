import Link from "next/link";
import { cn } from "@/lib/utils";

interface TagProps {
  name: string;
  sectionSlug?: string;
  onRemove?: () => void;
  className?: string;
}

export function Tag({ name, sectionSlug, onRemove, className }: TagProps) {
  const classes = cn(
    "inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground transition-colors duration-150 hover:bg-accent",
    className
  );

  if (onRemove) {
    return (
      <span className={classes}>
        #{name}
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 rounded-full text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label={`Убрать тег ${name}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </span>
    );
  }

  if (sectionSlug) {
    return (
      <Link
        href={`/forum/${sectionSlug}?tag=${encodeURIComponent(name)}`}
        className={classes}
      >
        #{name}
      </Link>
    );
  }

  return <span className={classes}>#{name}</span>;
}

interface TagListProps {
  tags: string[];
  sectionSlug?: string;
  className?: string;
}

export function TagList({ tags, sectionSlug, className }: TagListProps) {
  if (!tags.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {tags.map((t) => (
        <Tag key={t} name={t} sectionSlug={sectionSlug} />
      ))}
    </div>
  );
}
