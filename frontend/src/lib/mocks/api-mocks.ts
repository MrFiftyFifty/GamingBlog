import type {
  Section,
  Topic,
  TopicListItem,
  Post,
  Notification,
  Conversation,
  Message,
  Complaint,
  ModAction,
  Badge,
  User,
  PaginatedResponse,
  SearchResult,
  UpdateSettingsRequest,
} from "@/lib/api/types";
import { SECTIONS } from "@/lib/constants";
import { MOCK_TOPICS } from "@/lib/mock-data";

const delay = (ms = 200) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const MOCK_BADGES: Badge[] = [
  { id: "b1", name: "Первые шаги", description: "Первый пост на форуме", icon: "🎯", earnedAt: "5 марта 2026" },
  { id: "b2", name: "Автор", description: "10 созданных тем", icon: "✍️", earnedAt: "10 марта 2026" },
  { id: "b3", name: "Помощник", description: "25 полезных ответов", icon: "🤝", earnedAt: "15 марта 2026" },
  { id: "b4", name: "Ветеран", description: "1 год на форуме", icon: "🎖️", earnedAt: "" },
  { id: "b5", name: "Популярный", description: "Тема с 100+ ответами", icon: "🔥", earnedAt: "" },
  { id: "b6", name: "Эксперт", description: "500+ репутации", icon: "🏆", earnedAt: "" },
];

export const mockSections = (): Promise<Section[]> =>
  delay().then(() =>
    SECTIONS.map((s) => ({
      slug: s.slug,
      name: s.name,
      description: s.description,
      topicCount: s.topicCount,
      imageSrc: s.imageSrc,
      imageAlt: s.imageAlt,
    }))
  );

export const mockTopics = (sectionSlug: string): Promise<PaginatedResponse<TopicListItem>> =>
  delay().then(() => {
    const items = Object.entries(MOCK_TOPICS)
      .filter(([, t]) => t.sectionSlug === sectionSlug)
      .map(([id, t]) => ({
        id,
        title: t.title,
        author: t.author,
        replies: t.replies,
        views: t.views,
        pinned: t.pinned,
        createdAt: t.createdAt,
        lastActivityAt: t.createdAt,
        tags: t.tags ?? [],
      }));
    return { data: items, total: items.length, page: 1, pageSize: 20, totalPages: 1 };
  });

export const mockTopic = (sectionSlug: string, topicId: string): Promise<Topic> =>
  delay().then(() => {
    const t = MOCK_TOPICS[topicId];
    if (!t) throw new Error("Topic not found");
    return {
      id: topicId,
      sectionSlug,
      title: t.title,
      content: t.content,
      author: t.author,
      createdAt: t.createdAt,
      tags: t.tags ?? [],
      views: t.views,
      pinned: t.pinned,
      closed: false,
      posts: t.posts.map((p) => ({
        id: p.id,
        topicId,
        author: p.author,
        content: p.content,
        createdAt: p.createdAt,
        isTopicAuthor: p.isTopicAuthor,
        likes: Math.floor(Math.random() * 10),
        likedByMe: false,
      })) as Post[],
    };
  });

export const mockNotifications = (): Promise<PaginatedResponse<Notification>> =>
  delay().then(() => ({
    data: [
      { id: "1", type: "reply", message: "ProGamer42 ответил в теме «Marathon — первый взгляд»", link: "/forum/action/topic/1", read: false, createdAt: "15 мар, 14:30", actor: { username: "ProGamer42" } },
      { id: "2", type: "mention", message: "RPGLover упомянул вас в теме «Crimson Desert»", link: "/forum/rpg/topic/2", read: false, createdAt: "14 мар, 20:15", actor: { username: "RPGLover" } },
      { id: "3", type: "badge", message: "Вы получили значок «Автор»", link: "/profile/achievements", read: true, createdAt: "13 мар, 10:00" },
      { id: "4", type: "reply", message: "ActionHero ответил в теме «Life Is Strange: Reunion»", link: "/forum/rpg/topic/4", read: true, createdAt: "12 мар, 18:45", actor: { username: "ActionHero" } },
    ],
    total: 4,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  }));

export const mockConversations = (): Promise<Conversation[]> =>
  delay().then(() => [
    { id: "c1", participant: { username: "ProGamer42" }, lastMessage: "Привет, видел твой гайд по Marathon", lastMessageAt: "15 мар, 16:00", unreadCount: 2 },
    { id: "c2", participant: { username: "RPGLover" }, lastMessage: "Спасибо за ответ в Crimson Desert!", lastMessageAt: "14 мар, 21:20", unreadCount: 0 },
    { id: "c3", participant: { username: "TeamCaptain" }, lastMessage: "Зайдёшь сегодня на пати?", lastMessageAt: "13 мар, 19:45", unreadCount: 1 },
  ]);

export const mockMessages = (conversationId: string): Promise<PaginatedResponse<Message>> =>
  delay().then(() => ({
    data: [
      { id: "m1", conversationId, sender: "ProGamer42", content: "Привет!", createdAt: "15 мар, 15:30", read: true },
      { id: "m2", conversationId, sender: "me", content: "Приветствую", createdAt: "15 мар, 15:35", read: true },
      { id: "m3", conversationId, sender: "ProGamer42", content: "Видел твой гайд по Marathon, очень помог", createdAt: "15 мар, 16:00", read: false },
    ],
    total: 3,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  }));

export const mockComplaints = (): Promise<PaginatedResponse<Complaint>> =>
  delay().then(() => ({
    data: [
      { id: "cp1", postId: "p1", topicId: "1", topicTitle: "Marathon — сезоны", sectionSlug: "action", reportedContent: "Реклама стороннего сервиса", reportedUser: "Spammer99", reporter: "User1", reason: "spam", status: "pending", createdAt: "15 мар, 14:00" },
      { id: "cp2", postId: "p2", topicId: "2", topicTitle: "Crimson Desert", sectionSlug: "rpg", reportedContent: "Оскорбления в адрес пользователя", reportedUser: "Toxic42", reporter: "RPGLover", reason: "harassment", status: "pending", createdAt: "14 мар, 21:00" },
    ],
    total: 2,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  }));

export const mockModActions = (): Promise<PaginatedResponse<ModAction>> =>
  delay().then(() => ({
    data: [
      { id: "a1", moderator: "ModAlex", action: "delete_post", targetPostId: "p1", reason: "spam", createdAt: "15 мар, 15:00" },
      { id: "a2", moderator: "ModAlex", action: "warn_user", targetUser: "Toxic42", reason: "harassment", createdAt: "14 мар, 22:00" },
    ],
    total: 2,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  }));

export const mockUser = (username: string): Promise<User> =>
  delay().then(() => ({
    id: `mock-${username}`,
    username,
    reputation: 128,
    postsCount: 42,
    joinedAt: "1 января 2026",
    role: "user",
    badges: MOCK_BADGES.filter((b) => b.earnedAt),
  }));

export const mockUserTopics = (username: string): Promise<{ id: string; title: string; sectionSlug: string; createdAt: string }[]> =>
  delay().then(() =>
    Object.entries(MOCK_TOPICS)
      .filter(([, t]) => t.author === username)
      .map(([id, t]) => ({ id, title: t.title, sectionSlug: t.sectionSlug, createdAt: t.createdAt }))
  );

export const mockUserSearch = (query: string): Promise<{ username: string; avatar?: string | null }[]> =>
  delay().then(() => {
    const users = ["ProGamer42", "RPGLover", "ActionHero", "TeamCaptain", "ModAlex", "User1", "User2"];
    return users
      .filter((u) => u.toLowerCase().includes(query.toLowerCase()))
      .map((u) => ({ username: u }));
  });

export const mockSearchForum = (query: string): Promise<PaginatedResponse<SearchResult>> =>
  delay().then(() => {
    const q = query.toLowerCase();
    const results = Object.entries(MOCK_TOPICS)
      .filter(([, t]) =>
        t.title.toLowerCase().includes(q) || t.content.toLowerCase().includes(q)
      )
      .map(([id, t]) => ({
        id,
        title: t.title,
        sectionSlug: t.sectionSlug,
        sectionName: SECTIONS.find((s) => s.slug === t.sectionSlug)?.name ?? t.sectionSlug,
        author: t.author,
        excerpt: t.content.slice(0, 200),
        createdAt: t.createdAt,
      }));
    return { data: results, total: results.length, page: 1, pageSize: 20, totalPages: 1 };
  });

export const mockSettings = (): Promise<UpdateSettingsRequest> =>
  delay().then(() => ({ notifyReplies: true, notifyMentions: true }));

export const mockUnreadCount = (): Promise<{ count: number }> =>
  delay(100).then(() => ({ count: 2 }));
