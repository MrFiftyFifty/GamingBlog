"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { assetPath } from "@/lib/asset-path";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

function preprocessMentions(md: string): string {
  return md.replace(/(^|\s)@([A-Za-z0-9_]{2,30})/g, "$1[@$2](/user/$2)");
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  const processed = preprocessMentions(content);

  return (
    <div className={cn("prose prose-lg dark:prose-invert max-w-none prose-p:leading-relaxed", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          a: ({ children, href, ...props }) => {
            const isMention = href?.startsWith("/user/");
            return (
              <a
                href={href}
                target={href?.startsWith("http") ? "_blank" : undefined}
                rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                className={
                  isMention
                    ? "mention text-accent-signature font-medium no-underline hover:underline"
                    : "text-accent-signature underline underline-offset-4 hover:text-accent-signature/80 transition-colors duration-200"
                }
                {...props}
              >
                {children}
              </a>
            );
          },
          img: ({ alt, src, ...props }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={typeof src === "string" ? assetPath(src) : src}
              alt={alt ?? ""}
              loading="lazy"
              className="rounded-lg max-w-full h-auto"
              {...props}
            />
          ),
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
