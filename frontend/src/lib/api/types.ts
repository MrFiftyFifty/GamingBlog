export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string | null;
  status?: string;
  reputation: number;
  postsCount: number;
  joinedAt: string;
  role: "user" | "moderator" | "admin";
  badges?: Badge[];
  steamId?: string | null;
  discordId?: string | null;
  googleId?: string | null;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface Section {
  slug: string;
  name: string;
  description: string;
  topicCount: number;
  imageSrc: string;
  imageAlt: string;
}

export interface TopicListItem {
  id: string;
  title: string;
  author: string;
  authorAvatar?: string | null;
  replies: number;
  views: number;
  pinned: boolean;
  createdAt: string;
  lastActivityAt: string;
  tags?: string[];
}

export interface Topic {
  id: string;
  sectionSlug: string;
  title: string;
  content: string;
  author: string;
  authorAvatar?: string | null;
  createdAt: string;
  updatedAt?: string;
  tags: string[];
  views: number;
  pinned: boolean;
  closed: boolean;
  posts: Post[];
}

export interface Post {
  id: string;
  topicId: string;
  author: string;
  authorAvatar?: string | null;
  content: string;
  createdAt: string;
  updatedAt?: string;
  isTopicAuthor: boolean;
  likes: number;
  likedByMe: boolean;
}

export interface Notification {
  id: string;
  type: "reply" | "mention" | "badge" | "system";
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
  actor?: { username: string; avatar?: string | null };
}

export interface Conversation {
  id: string;
  participant: { username: string; avatar?: string | null };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: string;
  senderAvatar?: string | null;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Complaint {
  id: string;
  postId: string;
  topicId: string;
  topicTitle: string;
  sectionSlug: string;
  reportedContent: string;
  reportedUser: string;
  reporter: string;
  reason: string;
  description?: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ModAction {
  id: string;
  moderator: string;
  action: "delete_post" | "edit_post" | "warn_user" | "ban_user" | "unban_user" | "pin_topic" | "close_topic" | "dismiss_complaint";
  targetUser?: string;
  targetPostId?: string;
  targetTopicId?: string;
  reason: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data?: T[];
  results?: T[];
  total?: number;
  count?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  next?: string | null;
  previous?: string | null;
}

export interface SearchResult {
  id: string;
  title: string;
  sectionSlug: string;
  sectionName: string;
  author: string;
  excerpt: string;
  createdAt: string;
}

export interface CreateTopicRequest {
  title: string;
  content: string;
  tags: string[];
}

export interface UpdateTopicRequest {
  title?: string;
  content?: string;
  tags?: string[];
}

export interface CreateReplyRequest {
  content: string;
}

export interface ReportRequest {
  reason: string;
  description?: string;
}

export interface UpdateProfileRequest {
  status?: string;
}

export interface UpdateSettingsRequest {
  notifyReplies: boolean;
  notifyMentions: boolean;
}

export interface SendMessageRequest {
  recipientUsername: string;
  content: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}
