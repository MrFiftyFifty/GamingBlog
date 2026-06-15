import { apiFetch } from "@/lib/api";
import { FEATURES } from "@/lib/constants";
import {
  mockSections,
  mockTopics,
  mockTopic,
  mockSearchForum,
} from "@/lib/mocks/api-mocks";
import {
  normalizePaginatedTopics,
  normalizePost,
  normalizeSections,
  normalizeTopic,
} from "./normalize";
import type {
  Topic,
  Post,
  PaginatedResponse,
  SearchResult,
  CreateTopicRequest,
  UpdateTopicRequest,
  CreateReplyRequest,
  ReportRequest,
} from "./types";

export async function getSections() {
  if (!FEATURES.forum) return mockSections();
  const raw = await apiFetch<unknown>("/api/forum/sections/");
  return normalizeSections(raw);
}

export async function getTopics(
  sectionSlug: string,
  params?: { page?: number; sort?: string; tag?: string }
) {
  if (!FEATURES.forum) return mockTopics(sectionSlug);
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.sort) query.set("ordering", params.sort === "popular" ? "-created_at" : "-created_at");
  if (params?.tag) query.set("tag", params.tag);
  const qs = query.toString();
  const raw = await apiFetch<unknown>(
    `/api/forum/sections/${sectionSlug}/topics/${qs ? `?${qs}` : ""}`
  );
  return normalizePaginatedTopics(raw as Record<string, unknown>);
}

export async function getTopic(sectionSlug: string, topicId: string) {
  if (!FEATURES.forum) return mockTopic(sectionSlug, topicId);
  const raw = await apiFetch<Record<string, unknown>>(
    `/api/forum/sections/${sectionSlug}/topics/${topicId}/`
  );
  return normalizeTopic(raw);
}

export async function createTopic(sectionSlug: string, data: CreateTopicRequest) {
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
  const payload: Record<string, unknown> = {
    title: data.title,
    content: data.content,
  };
  if (data.tags?.length) {
    payload.tag_slugs = data.tags;
  }
  const raw = await apiFetch<Record<string, unknown>>(
    `/api/forum/sections/${sectionSlug}/topics/`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  return normalizeTopic(raw);
}

export async function updateTopic(
  sectionSlug: string,
  topicId: string,
  data: UpdateTopicRequest
) {
  if (!FEATURES.forum) {
    return Promise.resolve({} as Topic);
  }
  const raw = await apiFetch<Record<string, unknown>>(
    `/api/forum/sections/${sectionSlug}/topics/${topicId}/`,
    { method: "PATCH", body: JSON.stringify(data) }
  );
  return normalizeTopic(raw);
}

export async function deleteTopic(sectionSlug: string, topicId: string) {
  if (!FEATURES.forum) return Promise.resolve();
  return apiFetch<void>(
    `/api/forum/sections/${sectionSlug}/topics/${topicId}/`,
    { method: "DELETE" }
  );
}

export async function createReply(
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
  const raw = await apiFetch<Record<string, unknown>>(
    `/api/forum/sections/${sectionSlug}/topics/${topicId}/replies/`,
    { method: "POST", body: JSON.stringify({ content: data.content }) }
  );
  return normalizePost(raw);
}

export async function likePost(postId: string) {
  return apiFetch<{ likes: number }>(`/api/posts/${postId}/like/`, {
    method: "POST",
  }).catch(() => ({ likes: 1 }));
}

export async function unlikePost(postId: string) {
  return apiFetch<{ likes: number }>(`/api/posts/${postId}/unlike/`, {
    method: "POST",
  }).catch(() => ({ likes: 0 }));
}

export async function reactToPost(postId: string, reaction: string) {
  if (!FEATURES.postReactions) {
    return Promise.resolve({ reaction, count: 1 });
  }
  return apiFetch<{ reaction: string; count: number }>(
    `/api/forum/posts/${postId}/react/`,
    { method: "POST", body: JSON.stringify({ reaction }) }
  );
}

const REPORT_REASON_MAP: Record<string, string> = {
  Спам: "spam",
  Оскорбления: "insult",
  "Нецензурная лексика": "insult",
  Реклама: "spam",
  "Нарушение правил": "other",
  Другое: "other",
};

export async function reportPost(postId: string, data: ReportRequest) {
  if (!FEATURES.postReport) return Promise.resolve();
  return apiFetch<void>(`/api/reports/`, {
    method: "POST",
    body: JSON.stringify({
      target_type: "post",
      target_id: Number(postId),
      reason: REPORT_REASON_MAP[data.reason] ?? "other",
      description: data.description ?? "",
    }),
  });
}

export async function searchForum(query: string, page?: number) {
  if (!FEATURES.search) return mockSearchForum(query);
  const params = new URLSearchParams({ search: query });
  if (page) params.set("page", String(page));
  return apiFetch<PaginatedResponse<SearchResult>>(
    `/api/topics/?${params}`
  );
}

export async function pinTopic(sectionSlug: string, topicId: string) {
  if (!FEATURES.topicPin) return Promise.resolve();
  return apiFetch<void>(
    `/api/forum/sections/${sectionSlug}/topics/${topicId}/`,
    { method: "PATCH", body: JSON.stringify({ is_pinned: true }) }
  );
}

export async function closeTopic(sectionSlug: string, topicId: string) {
  if (!FEATURES.topicClose) return Promise.resolve();
  return apiFetch<void>(
    `/api/forum/sections/${sectionSlug}/topics/${topicId}/`,
    { method: "PATCH", body: JSON.stringify({ is_closed: true }) }
  );
}
