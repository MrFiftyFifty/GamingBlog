import Image from "next/image";
import Link from "next/link";
import { MarkdownContent } from "@/components/ui/markdown-content";

interface PostProps {
  id: string;
  author: string;
  authorAvatar?: string | null;
  content: string;
  createdAt: string;
  isTopicAuthor?: boolean;
  likes?: number;
  likedByMe?: boolean;
  onLike?: (id: string) => void;
  onQuote?: (content: string, author: string) => void;
  onReport?: (id: string) => void;
}

export function Post({
  id,
  author,
  authorAvatar,
  content,
  createdAt,
  isTopicAuthor = false,
  likes = 0,
  likedByMe = false,
  onLike,
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
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onLike?.(id)}
            className={`text-fluid-caption min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 rounded transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              likedByMe ? "text-accent-signature" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={likedByMe ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" /></svg>
            {likes > 0 && <span className="text-xs">{likes}</span>}
          </button>
          <button
            type="button"
            onClick={() => onQuote?.(content, author)}
            className="text-fluid-caption text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Цитировать
          </button>
          <button
            type="button"
            onClick={() => onReport?.(id)}
            className="text-fluid-caption text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Пожаловаться
          </button>
        </div>
      </div>
    </article>
  );
}
