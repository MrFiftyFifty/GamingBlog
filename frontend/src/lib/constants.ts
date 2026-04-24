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

export const FEATURES = {
  forum: false,
  messages: false,
  moderation: false,
  search: false,
  userProfilesByUsername: false,
  userSettings: false,
  avatarUpload: false,
  passwordReset: false,
  changePassword: false,
  notificationsUnreadCount: false,
  notificationsMarkRead: false,
  topicPin: false,
  topicClose: false,
  postReport: false,
  steamOAuth: false,
  discordOAuth: false,
  googleOAuth: false,
} as const;
