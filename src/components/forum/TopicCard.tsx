import Link from "next/link";

interface TopicCardProps {
  slug: string;
  id: string;
  title: string;
  author: string;
  replies: number;
  views: number;
  pinned?: boolean;
  createdAt: string;
}

export function TopicCard({
  slug,
  id,
  title,
  author,
  replies,
  views,
  pinned = false,
  createdAt,
}: TopicCardProps) {
  return (
    <article className="grid grid-cols-1 gap-2 border-b border-border px-4 py-3 last:border-b-0 md:grid-cols-[1fr_120px_100px_80px] md:gap-4 md:px-6 md:items-center transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-accent/30">
      <div className="min-w-0">
        <Link
          href={`/forum/${slug}/topic/${id}`}
          className="font-medium text-foreground hover:text-primary transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          {pinned && <span className="mr-2 text-accent-signature text-xs font-medium uppercase tracking-wide">[Закреплено]</span>}
          {title}
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">
          Автор: <Link href={`/user/${author}`} className="transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">{author}</Link>
        </p>
      </div>
      <span className="text-sm text-muted-foreground md:text-center">{replies}</span>
      <span className="text-sm text-muted-foreground md:text-center">{views}</span>
      <span className="text-sm text-muted-foreground md:text-center">{createdAt}</span>
    </article>
  );
}
