"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Post } from "@/components/forum/Post";
import { ReplyForm } from "@/components/forum/ReplyForm";
import { ReportModal } from "@/components/forum/ReportModal";
import * as forumApi from "@/lib/api/forum";
import type { MockPost } from "@/lib/mock-data";

interface TopicContentProps {
  sectionSlug: string;
  topicId: string;
  posts: MockPost[];
}

export function TopicContent({ sectionSlug, topicId, posts }: TopicContentProps) {
  const [reportPostId, setReportPostId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const handleLike = useCallback(async (postId: string) => {
    try {
      await forumApi.likePost(postId);
    } catch {
      toast.error("Не удалось поставить лайк");
    }
  }, []);

  const handleQuote = useCallback((content: string, author: string) => {
    const quoted = `> **${author}:**\n> ${content.split("\n").join("\n> ")}\n\n`;
    setReplyContent((prev) => prev + quoted);
    const el = document.getElementById("reply");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
      {posts.length > 0 && (
        <section className="mt-8" aria-label="Ответы">
          <h2 className="text-fluid-title font-semibold text-foreground mb-4">
            Ответы ({posts.length})
          </h2>
          <div className="rounded-lg border border-border bg-card divide-y divide-border">
            {posts.map((post) => (
              <Post
                key={post.id}
                id={post.id}
                author={post.author}
                content={post.content}
                createdAt={post.createdAt}
                isTopicAuthor={post.isTopicAuthor}
                onLike={handleLike}
                onQuote={handleQuote}
                onReport={setReportPostId}
              />
            ))}
          </div>
        </section>
      )}

      <ReplyForm
        sectionSlug={sectionSlug}
        topicId={topicId}
        defaultContent={replyContent}
      />

      <ReportModal
        open={!!reportPostId}
        onClose={() => setReportPostId(null)}
        postId={reportPostId ?? ""}
      />
    </>
  );
}
