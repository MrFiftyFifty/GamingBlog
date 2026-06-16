import type { Metadata } from "next";
import { TopicPageView } from "@/components/forum/TopicPageView";
import { MOCK_TOPICS } from "@/lib/mock-data";
import { getTopicRouteParams } from "@/lib/static-params";

export function generateStaticParams() {
  return getTopicRouteParams();
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; id: string };
}): Promise<Metadata> {
  const topic = MOCK_TOPICS[params.id];
  if (!topic) return {};
  return {
    title: `${topic.title} — Игровой форум`,
    description: topic.content.slice(0, 160),
  };
}

export default function TopicPage({
  params,
}: {
  params: { slug: string; id: string };
}) {
  return <TopicPageView slug={params.slug} id={params.id} />;
}
