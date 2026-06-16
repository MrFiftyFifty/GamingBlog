import type {
  Complaint,
  Conversation,
  Message,
  ModAction,
  PaginatedResponse,
  Post,
  Section,
  Topic,
  TopicListItem,
} from "./types";

type RawRecord = Record<string, unknown>;

function pickString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function pickNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" ? value : fallback;
}

function pickBool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function normalizeSection(raw: RawRecord): Section {
  const slug = pickString(raw.slug);
  return {
    slug,
    name: pickString(raw.title ?? raw.name, slug),
    description: pickString(raw.description),
    topicCount: pickNumber(raw.topics_count ?? raw.topicCount),
    imageSrc: pickString(raw.imageSrc, `/images/forum/${slug}.jpg`),
    imageAlt: pickString(raw.imageAlt ?? raw.title ?? raw.name, slug),
  };
}

export function normalizeTopicListItem(raw: RawRecord): TopicListItem {
  const author = raw.author as RawRecord | undefined;
  return {
    id: String(raw.id ?? ""),
    title: pickString(raw.title),
    author: pickString(raw.author_username ?? author?.username ?? raw.author),
    authorAvatar: pickString(author?.avatar ?? raw.author_avatar, "") || null,
    replies: pickNumber(raw.posts_count ?? raw.replies),
    views: pickNumber(raw.views_count ?? raw.views),
    pinned: pickBool(raw.is_pinned ?? raw.pinned),
    createdAt: pickString(raw.created_at ?? raw.createdAt),
    lastActivityAt: pickString(raw.updated_at ?? raw.lastActivityAt ?? raw.created_at),
    tags: Array.isArray(raw.tags)
      ? (raw.tags as RawRecord[]).map((tag) => pickString(tag.slug ?? tag.name))
      : undefined,
  };
}

export function normalizePost(raw: RawRecord, topicAuthor?: string): Post {
  const author = raw.author as RawRecord | undefined;
  const authorName = pickString(author?.username ?? raw.author_username ?? raw.author);
  return {
    id: String(raw.id ?? ""),
    topicId: String(raw.topic ?? raw.topicId ?? ""),
    author: authorName,
    authorAvatar: pickString(author?.avatar ?? raw.author_avatar, "") || null,
    content: pickString(raw.content),
    createdAt: pickString(raw.created_at ?? raw.createdAt),
    updatedAt: pickString(raw.updated_at ?? raw.updatedAt, "") || undefined,
    isTopicAuthor: topicAuthor ? authorName === topicAuthor : pickBool(raw.isTopicAuthor),
    likes: pickNumber(raw.likes_count ?? raw.likes),
    likedByMe: pickBool(raw.is_liked ?? raw.likedByMe),
  };
}

export function normalizeTopic(raw: RawRecord): Topic {
  const section = raw.section as RawRecord | undefined;
  const author = raw.author as RawRecord | undefined;
  const authorName = pickString(raw.author_username ?? author?.username ?? raw.author);
  const postsRaw = Array.isArray(raw.posts) ? (raw.posts as RawRecord[]) : [];
  return {
    id: String(raw.id ?? ""),
    sectionSlug: pickString(section?.slug ?? raw.sectionSlug ?? raw.section_slug),
    title: pickString(raw.title),
    content: pickString(raw.content),
    author: authorName,
    authorAvatar: pickString(author?.avatar ?? raw.author_avatar, "") || null,
    createdAt: pickString(raw.created_at ?? raw.createdAt),
    updatedAt: pickString(raw.updated_at ?? raw.updatedAt, "") || undefined,
    tags: Array.isArray(raw.tags)
      ? (raw.tags as RawRecord[]).map((tag) => pickString(tag.slug ?? tag.name))
      : Array.isArray(raw.tag_slugs)
        ? (raw.tag_slugs as string[])
        : [],
    views: pickNumber(raw.views_count ?? raw.views),
    pinned: pickBool(raw.is_pinned ?? raw.pinned),
    closed: pickBool(raw.is_closed ?? raw.closed),
    posts: postsRaw.map((post) => normalizePost(post, authorName)),
  };
}

export function normalizePaginatedTopics(
  raw: RawRecord | RawRecord[]
): PaginatedResponse<TopicListItem> {
  if (Array.isArray(raw)) {
    const results = raw.map((item) => normalizeTopicListItem(item));
    return { results, count: results.length, next: null, previous: null };
  }
  const results = Array.isArray(raw.results)
    ? (raw.results as RawRecord[]).map(normalizeTopicListItem)
    : [];
  return {
    results,
    count: pickNumber(raw.count, results.length),
    next: (raw.next as string | null) ?? null,
    previous: (raw.previous as string | null) ?? null,
  };
}

export function normalizeSections(raw: unknown): Section[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => normalizeSection(item as RawRecord));
  }
  if (raw && typeof raw === "object" && Array.isArray((raw as RawRecord).results)) {
    return ((raw as RawRecord).results as RawRecord[]).map(normalizeSection);
  }
  return [];
}

export function extractResults(raw: unknown): RawRecord[] {
  if (Array.isArray(raw)) {
    return raw as RawRecord[];
  }
  if (raw && typeof raw === "object" && Array.isArray((raw as RawRecord).results)) {
    return (raw as RawRecord).results as RawRecord[];
  }
  return [];
}

function formatShortDate(value: unknown): string {
  const text = pickString(value);
  if (!text) return "";
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function formatMessageDate(value: unknown): string {
  const text = pickString(value);
  if (!text) return "";
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return date.toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const REASON_LABELS: Record<string, string> = {
  spam: "Спам",
  insult: "Оскорбления",
  adult: "Контент 18+",
  violence: "Насилие",
  other: "Другое",
};

export function normalizeMessage(
  raw: RawRecord,
  currentUserId: string,
  conversationId: string
): Message {
  const senderId = String(raw.sender ?? "");
  const isMine = pickBool(raw.is_mine) || senderId === currentUserId;
  return {
    id: String(raw.id ?? ""),
    conversationId,
    sender: isMine ? "me" : pickString(raw.sender_username),
    senderAvatar: null,
    content: pickString(raw.content),
    createdAt: formatMessageDate(raw.created_at),
    read: pickBool(raw.is_read, true),
  };
}

export function buildConversations(
  messages: RawRecord[],
  currentUserId: string
): Conversation[] {
  const byUser = new Map<string, Conversation>();

  for (const msg of messages) {
    const senderId = String(msg.sender ?? "");
    const recipientId = String(msg.recipient ?? "");
    const isMine = senderId === currentUserId;
    const otherId = isMine ? recipientId : senderId;
    const otherName = isMine
      ? pickString(msg.recipient_username)
      : pickString(msg.sender_username);
    if (!otherId) continue;

    const existing = byUser.get(otherId);
    const unreadBump = !isMine && !pickBool(msg.is_read) ? 1 : 0;
    const createdAt = pickString(msg.created_at);

    if (!existing) {
      byUser.set(otherId, {
        id: otherId,
        participant: { username: otherName, avatar: null },
        lastMessage: pickString(msg.content),
        lastMessageAt: formatShortDate(createdAt),
        unreadCount: unreadBump,
      });
      continue;
    }

    existing.lastMessage = pickString(msg.content);
    existing.lastMessageAt = formatShortDate(createdAt);
    if (unreadBump) {
      existing.unreadCount += 1;
    }
  }

  return Array.from(byUser.values());
}

export function normalizeComplaint(raw: RawRecord): Complaint {
  const objectType = pickString(raw.reported_object_type ?? raw.target_type);
  const objectId = String(raw.reported_object_id ?? raw.target_id ?? "");
  const statusRaw = pickString(raw.status, "pending");
  const status =
    statusRaw === "rejected"
      ? "dismissed"
      : statusRaw === "reviewed"
        ? "pending"
        : (statusRaw as Complaint["status"]);

  return {
    id: String(raw.id ?? ""),
    postId: objectType === "post" ? objectId : "",
    topicId: objectType === "topic" ? objectId : "",
    topicTitle:
      objectType === "topic"
        ? pickString(raw.reported_object_preview)
        : pickString(raw.topic_title, "—"),
    sectionSlug: pickString(raw.section_slug, "rpg"),
    reportedContent: pickString(raw.reported_object_preview, "—"),
    reportedUser: pickString(raw.reported_user ?? raw.target_username, "—"),
    reporter: pickString(raw.reporter_username ?? raw.reporter),
    reason: REASON_LABELS[pickString(raw.reason)] ?? pickString(raw.reason),
    description: pickString(raw.description, "") || undefined,
    status,
    createdAt: formatShortDate(raw.created_at),
    resolvedAt: raw.resolved_at ? formatShortDate(raw.resolved_at) : undefined,
    resolvedBy: pickString(raw.moderator_username, "") || undefined,
  };
}

export function normalizeModAction(raw: RawRecord): ModAction {
  return {
    id: String(raw.id ?? ""),
    moderator: pickString(raw.moderator_username ?? raw.moderator),
    action: pickString(raw.action) as ModAction["action"],
    targetUser: pickString(raw.target_username ?? raw.target_user, "") || undefined,
    reason: pickString(raw.reason),
    createdAt: formatShortDate(raw.created_at),
  };
}

export function normalizePublicUser(raw: RawRecord): import("./types").User {
  return {
    id: String(raw.id ?? ""),
    username: pickString(raw.username),
    email: pickString(raw.email, "") || undefined,
    avatar: (raw.avatar as string | null) ?? null,
    status: pickString(raw.status, "") || undefined,
    reputation: pickNumber(raw.reputation),
    postsCount: pickNumber(raw.postsCount ?? raw.posts_count),
    joinedAt: pickString(raw.joinedAt ?? raw.joined_at),
    role: (pickString(raw.role, "user") as import("./types").User["role"]) || "user",
    badges: Array.isArray(raw.badges) ? (raw.badges as import("./types").User["badges"]) : [],
    steamId: pickString(raw.steamId ?? raw.steam_id, "") || null,
    discordId: null,
    googleId: null,
  };
}

export function normalizePaginated<T>(
  raw: unknown,
  mapItem: (item: RawRecord) => T
): PaginatedResponse<T> {
  const results = extractResults(raw).map(mapItem);
  const record = (raw && typeof raw === "object" ? raw : {}) as RawRecord;
  return {
    results,
    count: pickNumber(record.count, results.length),
    next: (record.next as string | null) ?? null,
    previous: (record.previous as string | null) ?? null,
  };
}
