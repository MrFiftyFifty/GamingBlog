import useSWR from "swr";
import * as forumApi from "@/lib/api/forum";

export function useSections() {
  return useSWR("forum/sections", () => forumApi.getSections());
}

export function useTopics(
  sectionSlug: string | null,
  params?: { page?: number; sort?: string }
) {
  return useSWR(
    sectionSlug ? ["forum/topics", sectionSlug, params] : null,
    () => forumApi.getTopics(sectionSlug!, params)
  );
}

export function useTopic(sectionSlug: string | null, topicId: string | null) {
  return useSWR(
    sectionSlug && topicId ? ["forum/topic", sectionSlug, topicId] : null,
    () => forumApi.getTopic(sectionSlug!, topicId!)
  );
}

export function useSearch(query: string | null, page?: number) {
  return useSWR(
    query ? ["forum/search", query, page] : null,
    () => forumApi.searchForum(query!, page)
  );
}
