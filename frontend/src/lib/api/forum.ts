import { apiFetch } from "@/lib/api";
import { FEATURES } from "@/lib/constants";
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
  return apiFetch<Section[]>("/api/forum/sections/");
}

export function getTopics(
  sectionSlug: string,
  params?: { page?: number; sort?: string }
) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.sort) query.set("sort", params.sort);
  const qs = query.toString();
  return apiFetch<PaginatedResponse<TopicListItem>>(
    `/api/forum/sections/${sectionSlug}/topics/${qs ? `?${qs}` : ""}`
  );
}

export function getTopic(sectionSlug: string, topicId: string) {
  return apiFetch<Topic>(
    `/api/forum/sections/${sectionSlug}/topics/${topicId}/`
  );
}

export function createTopic(sectionSlug: string, data: CreateTopicRequest) {
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
  return apiFetch<Topic>(
    `/api/forum/sections/${sectionSlug}/topics/${topicId}/`,
    { method: "PATCH", body: JSON.stringify(data) }
  );
}

export function deleteTopic(sectionSlug: string, topicId: string) {
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
  return apiFetch<Post>(
    `/api/forum/sections/${sectionSlug}/topics/${topicId}/replies/`,
    { method: "POST", body: JSON.stringify(data) }
  );
}

export function likePost(postId: string) {
  return apiFetch<{ likes: number }>(`/posts/${postId}/like/`, {
    method: "POST",
  });
}

export function unlikePost(postId: string) {
  return apiFetch<{ likes: number }>(`/posts/${postId}/unlike/`, {
    method: "POST",
  });
}

export function reportPost(postId: string, data: ReportRequest) {
  if (!FEATURES.postReport) {
    return Promise.reject(new Error("FEATURE_DISABLED: postReport"));
  }
  return apiFetch<void>(`/api/forum/posts/${postId}/report/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function searchForum(query: string, page?: number) {
  if (!FEATURES.search) {
    return Promise.resolve({
      count: 0,
      next: null,
      previous: null,
      results: [],
    } as PaginatedResponse<SearchResult>);
  }
  const params = new URLSearchParams({ q: query });
  if (page) params.set("page", String(page));
  return apiFetch<PaginatedResponse<SearchResult>>(
    `/api/forum/search/?${params}`
  );
}

export function pinTopic(sectionSlug: string, topicId: string) {
  if (!FEATURES.topicPin) {
    return Promise.reject(new Error("FEATURE_DISABLED: topicPin"));
  }
  return apiFetch<void>(
    `/api/forum/sections/${sectionSlug}/topics/${topicId}/pin/`,
    { method: "POST" }
  );
}

export function closeTopic(sectionSlug: string, topicId: string) {
  if (!FEATURES.topicClose) {
    return Promise.reject(new Error("FEATURE_DISABLED: topicClose"));
  }
  return apiFetch<void>(
    `/api/forum/sections/${sectionSlug}/topics/${topicId}/close/`,
    { method: "POST" }
  );
}
