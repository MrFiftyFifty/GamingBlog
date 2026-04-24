import { apiFetch } from "@/lib/api";
import { FEATURES } from "@/lib/constants";
import {
  mockSections,
  mockTopics,
  mockTopic,
  mockSearchForum,
} from "@/lib/mocks/api-mocks";
import type {
  Section,
  Topic,
  TopicListItem,
  Post,
  PaginatedResponse,
  SearchResult,
  CreateTopicRequest,
  UpdateTopicRequest,
  CreateReplyRequest,
  ReportRequest,
} from "./types";

export function getSections() {
  if (!FEATURES.forum) return mockSections();
  return apiFetch<Section[]>("/api/forum/sections/");
}

export function getTopics(
  sectionSlug: string,
  params?: { page?: number; sort?: string; tag?: string }
) {
  if (!FEATURES.forum) return mockTopics(sectionSlug);
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.sort) query.set("sort", params.sort);
  if (params?.tag) query.set("tag", params.tag);
  const qs = query.toString();
  return apiFetch<PaginatedResponse<TopicListItem>>(
    `/api/forum/sections/${sectionSlug}/topics/${qs ? `?${qs}` : ""}`
  );
}

export function getTopic(sectionSlug: string, topicId: string) {
  if (!FEATURES.forum) return mockTopic(sectionSlug, topicId);
  return apiFetch<Topic>(
    `/api/forum/sections/${sectionSlug}/topics/${topicId}/`
  );
}

export function createTopic(sectionSlug: string, data: CreateTopicRequest) {
  if (!FEATURES.forum) {
    return Promise.resolve({
      id: String(Date.now()),
      sectionSlug,
      title: data.title,
      content: data.content,
      tags: data.tags,
      author: "me",
      createdAt: new Date().toLocaleDateString("ru-RU"),
      views: 0,
      pinned: false,
      closed: false,
      posts: [],
    } as Topic);
  }
  return apiFetch<Topic>(`/api/forum/sections/${sectionSlug}/topics/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateTopic(
  sectionSlug: string,
  topicId: string,
  data: UpdateTopicRequest
) {
  if (!FEATURES.forum) {
    return Promise.resolve({} as Topic);
  }
  return apiFetch<Topic>(
    `/api/forum/sections/${sectionSlug}/topics/${topicId}/`,
    { method: "PATCH", body: JSON.stringify(data) }
  );
}

export function deleteTopic(sectionSlug: string, topicId: string) {
  if (!FEATURES.forum) return Promise.resolve();
  return apiFetch<void>(
    `/api/forum/sections/${sectionSlug}/topics/${topicId}/`,
    { method: "DELETE" }
  );
}

export function createReply(
  sectionSlug: string,
  topicId: string,
  data: CreateReplyRequest
) {
  if (!FEATURES.forum) {
    return Promise.resolve({
      id: String(Date.now()),
      topicId,
      author: "me",
      content: data.content,
      createdAt: new Date().toLocaleDateString("ru-RU"),
      isTopicAuthor: false,
      likes: 0,
      likedByMe: false,
    } as Post);
  }
  return apiFetch<Post>(
    `/api/forum/sections/${sectionSlug}/topics/${topicId}/replies/`,
    { method: "POST", body: JSON.stringify(data) }
  );
}

export function likePost(postId: string) {
  return apiFetch<{ likes: number }>(`/posts/${postId}/like/`, {
    method: "POST",
  }).catch(() => ({ likes: 1 }));
}

export function unlikePost(postId: string) {
  return apiFetch<{ likes: number }>(`/posts/${postId}/unlike/`, {
    method: "POST",
  }).catch(() => ({ likes: 0 }));
}

export function reactToPost(postId: string, reaction: string) {
  if (!FEATURES.postReactions) {
    return Promise.resolve({ reaction, count: 1 });
  }
  return apiFetch<{ reaction: string; count: number }>(
    `/api/forum/posts/${postId}/react/`,
    { method: "POST", body: JSON.stringify({ reaction }) }
  );
}

export function reportPost(postId: string, data: ReportRequest) {
  if (!FEATURES.postReport) return Promise.resolve();
  return apiFetch<void>(`/api/forum/posts/${postId}/report/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function searchForum(query: string, page?: number) {
  if (!FEATURES.search) return mockSearchForum(query);
  const params = new URLSearchParams({ q: query });
  if (page) params.set("page", String(page));
  return apiFetch<PaginatedResponse<SearchResult>>(
    `/api/forum/search/?${params}`
  );
}

export function pinTopic(sectionSlug: string, topicId: string) {
  if (!FEATURES.topicPin) return Promise.resolve();
  return apiFetch<void>(
    `/api/forum/sections/${sectionSlug}/topics/${topicId}/pin/`,
    { method: "POST" }
  );
}

export function closeTopic(sectionSlug: string, topicId: string) {
  if (!FEATURES.topicClose) return Promise.resolve();
  return apiFetch<void>(
    `/api/forum/sections/${sectionSlug}/topics/${topicId}/close/`,
    { method: "POST" }
  );
}
