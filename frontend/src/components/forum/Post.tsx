import Image from "next/image";
import Link from "next/link";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { Reputation } from "@/components/ui/reputation";
import { Reactions } from "@/components/forum/Reactions";

interface PostProps {
  id: string;
  author: string;
  authorAvatar?: string | null;
  authorReputation?: number;
  content: string;
  createdAt: string;
  isTopicAuthor?: boolean;
  reactions?: Record<string, number>;
  myReaction?: string | null;
  onReact?: (id: string, reaction: string | null) => void;
  onQuote?: (content: string, author: string) => void;
  onReport?: (id: string) => void;
}

export function Post({
  id,
  author,
  authorAvatar,
  authorReputation = 0,
  content,
  createdAt,
  isTopicAuthor = false,
  reactions = {},
  myReaction = null,
  onReact,
  onQuote,
  onReport,
}: PostProps) {
  return (
    <article
      id={`post-${id}`}
      className="flex gap-4 border-b border-border py-4 last:border-b-0 md:gap-6"
    >
      <aside className="flex shrink-0 flex-col items-center gap-1">
        {authorAvatar ? (
          <Image
            src={authorAvatar}
            alt=""
            width={48}
            height={48}
            unoptimized
            className="h-12 w-12 rounded-full bg-muted object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-medium text-muted-foreground">
            {author.slice(0, 1).toUpperCase()}
          </div>
        )}
        <Link href={`/user/${author}`} className="text-sm font-medium text-foreground hover:underline truncate max-w-[80px] md:max-w-[120px]">
          {author}
        </Link>
        {authorReputation > 0 && <Reputation value={authorReputation} />}
        {isTopicAuthor && (
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
            Автор
          </span>
        )}
      </aside>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{createdAt}</p>
        <div className="mt-2">
          <MarkdownContent content={content} className="prose-sm" />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Reactions
            postId={id}
            initialCounts={reactions}
            initialMyReaction={myReaction}
            onReact={onReact}
          />
          <button
            type="button"
            onClick={() => onQuote?.(content, author)}
            className="text-fluid-caption text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Процитировать пост от ${author}`}
          >
            Цитировать
          </button>
          <button
            type="button"
            onClick={() => onReport?.(id)}
            className="text-fluid-caption text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Пожаловаться на пост от ${author}`}
          >
            Пожаловаться
          </button>
        </div>
      </div>
    </article>
  );
}
