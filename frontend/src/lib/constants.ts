export const SECTION_NAMES: Record<string, string> = {
  rpg: "RPG / Новинки",
  action: "Экшен",
  multiplayer: "Мультиплеер",
};

export const SECTIONS = [
  { slug: "rpg", name: "RPG / Новинки", description: "Обсуждение ролевых игр и новинок", topicCount: 12, imageSrc: "/images/forum/rpg.jpg", imageAlt: "RPG" },
  { slug: "action", name: "Экшен", description: "Экшен-игры и шутеры", topicCount: 8, imageSrc: "/images/forum/action.jpg", imageAlt: "Экшен" },
  { slug: "multiplayer", name: "Мультиплеер", description: "Поиск команды, кооператив", topicCount: 24, imageSrc: "/images/forum/multiplayer.jpg", imageAlt: "Мультиплеер" },
] as const;

export const POPULAR_TAGS = [
  "rpg", "action", "shooter", "mmo", "strategy", "indie",
  "starfield", "crimson-desert", "marathon", "eldenring",
  "гайд", "баг", "обзор", "новость", "lfg",
];

export const REACTIONS: { emoji: string; name: string; label: string }[] = [
  { emoji: "👍", name: "like", label: "Нравится" },
  { emoji: "❤️", name: "love", label: "Круто" },
  { emoji: "😂", name: "laugh", label: "Смешно" },
  { emoji: "😮", name: "wow", label: "Удивлён" },
  { emoji: "😡", name: "angry", label: "Возмущён" },
  { emoji: "🏆", name: "trophy", label: "Топ" },
];

export type FontSize = "sm" | "md" | "lg";

export const FONT_SIZES: { value: FontSize; label: string; scale: number }[] = [
  { value: "sm", label: "Мелкий", scale: 0.875 },
  { value: "md", label: "Обычный", scale: 1 },
  { value: "lg", label: "Крупный", scale: 1.125 },
];

export const FEATURES = {
  forum: true,
  messages: true,
  moderation: true,
  search: true,
  userProfilesByUsername: true,
  userSettings: true,
  avatarUpload: true,
  passwordReset: true,
  changePassword: true,
  notificationsUnreadCount: true,
  notificationsMarkRead: true,
  topicPin: false,
  topicClose: false,
  postReport: true,
  postReactions: false,
  steamOAuth:
    typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_STEAM_OAUTH === "true" ||
      (process.env.NODE_ENV === "development" &&
        process.env.NEXT_PUBLIC_STEAM_OAUTH !== "false")),
  discordOAuth: false,
  googleOAuth:
    typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_GOOGLE_OAUTH === "true" ||
      (process.env.NODE_ENV === "development" &&
        process.env.NEXT_PUBLIC_GOOGLE_OAUTH !== "false")),
} as const;
