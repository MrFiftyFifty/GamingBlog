export interface MockPost {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  isTopicAuthor: boolean;
}

export interface MockTopic {
  title: string;
  sectionSlug: string;
  author: string;
  createdAt: string;
  content: string;
  replies: number;
  views: number;
  pinned: boolean;
  tags?: string[];
  posts: MockPost[];
}

export const MOCK_TOPICS: Record<string, MockTopic> = {
  "1": {
    title: "Marathon — сезоны и контент после релиза 5 марта",
    sectionSlug: "action",
    author: "User1",
    createdAt: "12 марта 2026",
    replies: 20,
    views: 150,
    pinned: true,
    content: `Релиз Marathon от Bungie состоялся 5 марта. Ниже — как устроены сезоны и что ждать в первом крупном обновлении.

Сезоны. Игра живёт сезонами длиной около трёх месяцев. В каждом — новая сюжетная линия, карты, оружие и скины. Прогресс сезонного боевого пропуска идёт за выполнение контрактов и ежедневные задания; платный трек даёт косметику, на геймплей не влияет.

Первый сезон. Уже анонсированы две новые карты высадки, режим «Рейд» на четверых и переработка части арсенала. Баланс по отзывам в целом адекватный: нет жёсткого pay-to-win, экстракшен ощущается напряжённо и читаемо.

Сетка и регионы. В настройках матчмейкинга можно выбрать предпочитаемый регион. Для СНГ стабильно работают европейские сервера; пинг обычно в пределах 50–80 мс. Если замечаете рывки — попробуйте другой дата-центр в том же меню.`,
    posts: [
      { id: "2", author: "User2", content: "Сезонный пропуск реально без агрессивного гринда. За вечер пары забегов хватает на пару уровней. Экстракшен заходит.", createdAt: "12 марта 2026", isTopicAuthor: false },
      { id: "3", author: "User3", content: "Подтверждаю по пингу: EU West даёт 60–70 мс из Москвы. Рейд на выходных попробуем.", createdAt: "13 марта 2026", isTopicAuthor: false },
    ],
  },
  "2": {
    title: "Crimson Desert — выход на PC и консолях 19 марта",
    sectionSlug: "rpg",
    author: "User2",
    createdAt: "11 марта 2026",
    replies: 45,
    views: 320,
    pinned: false,
    content: `Crimson Desert от Pearl Abyss выходит 19 марта на PC, PlayStation и Xbox. Кратко по геймплею и системам из превью и бета-тестов.

Сеттинг и сюжет. Открытый мир в духе тёмного фэнтези, война кланов и наёмники. Главный герой — наёмник Макдуф; сюжет линейный с ветвлениями и моральными выборами, влияющими на концовки и отношения с фракциями.

Бой. Экшн в реальном времени: комбо, парирование, увороты, смена оружия в бою. Есть элементы стелса и засад. Сложность настраивается; на высоких уровнях важно использовать окружение и эликсиры.

Прогресс и крафт. Классический RPG-прогресс: уровни, скиллы, крафт оружия и брони, улучшение лагеря. Мультиплеера в кампании нет — только одиночка. После прохождения обещают контент «endgame» в виде повторяемых подземелий и боссов.

Техническая часть. На PC рекомендуют RTX 3070 / RX 6800 для 1080p высокие; на консолях — 60 fps в режиме производительности. Поддержка русского языка в интерфейсе и субтитрах.`,
    posts: [
      { id: "2", author: "User4", content: "Играл в бете — бой действительно тяжёлый, без спама кнопок. Графика на ультрах очень сильная.", createdAt: "11 марта 2026", isTopicAuthor: false },
      { id: "3", author: "User1", content: "Жду ревью по балансу сложности. В бете первые часы были слишком жёсткие, потом патчили.", createdAt: "12 марта 2026", isTopicAuthor: false },
    ],
  },
  "3": {
    title: "Monster Hunter Stories 3: Twisted Reflection — релиз 13 марта",
    sectionSlug: "rpg",
    author: "User3",
    createdAt: "10 марта 2026",
    replies: 18,
    views: 210,
    pinned: false,
    content: `Monster Hunter Stories 3: Twisted Reflection вышла 13 марта на Switch и PC. Spin-off с пошаговыми боями и монстрами-компаньонами; кратко по новому.

Сюжет. История про «искажённое отражение» мира — появляются тёмные копии монстров и свои антагонисты. Герои путешествуют по знакомым локациям в новом виде, открывают заговор и новый тип монстров.

Геймплей. Пошаговые сражения в духе предыдущих Stories: камень-ножницы-бумага, скиллы монстров, катание на монстрах по миру. Добавили дуэли «монстр на монстра» и совместные атаки с напарниками. Есть мультиплеер — кооп по сюжету и арены PvP.

Монстры и яйца. Расширен список монстров из основных игр серии; яйца по-прежнему ищут в гнёздах, выводок влияет на статы и скиллы. Генетика и прокачка отряда остаются главным таймкиллером.

Платформы. На Switch цель — 30 fps; на PC можно выжать 60 и выше. Сохранения между платформами не синхронизируются.`,
    posts: [
      { id: "2", author: "User1", content: "Прошёл первые три главы — сюжет закручен сильнее, чем во второй части. Музыка и визуал на высоте.", createdAt: "10 марта 2026", isTopicAuthor: false },
      { id: "3", author: "User5", content: "Кто уже зашёл в мультиплеер? Ищу партию на арену в выходные.", createdAt: "14 марта 2026", isTopicAuthor: false },
    ],
  },
  "4": {
    title: "Life Is Strange: Reunion — финал истории Макс и Хлои 26 марта",
    sectionSlug: "rpg",
    author: "User4",
    createdAt: "9 марта 2026",
    replies: 12,
    views: 95,
    pinned: false,
    content: `Life Is Strange: Reunion выходит 26 марта — финальная часть истории Макс Кольфилд и Хлои Прайс после событий Double Exposure. Официально позиционируется как закрытие их арки.

Связь с Double Exposure. Reunion продолжает сюжет последней игры: Макс и Хлои снова в одном городе, разбирают последствия решений из прошлых частей и столкновения с новыми последствиями перемотки времени. Разработчики обещают несколько концовок в зависимости от накопленных выборов.

Геймплей. Классический LiS: диалоги, исследование локаций, перемотка времени для решения головоломок и диалогов. Добавлены сцены «воспоминаний», где игрок переигрывает ключевые моменты из первой игры с учётом новых последствий.

Объём и спойлеры. Оценка прохождения — около 6–8 часов. В обсуждениях просьба помечать спойлеры: многие ждут игру годами и хотят пройти без подсказок.`,
    posts: [
      { id: "2", author: "User2", content: "Жду именно из-за закрытия арки. Надеюсь, не затянут и дадут нормальный катарсис.", createdAt: "9 марта 2026", isTopicAuthor: false },
      { id: "3", author: "User1", content: "В треде про спойлеры — согласен. Отдельный топик под спойлеры после релиза имеет смысл.", createdAt: "10 марта 2026", isTopicAuthor: false },
    ],
  },
};

export const FEATURED = {
  href: "/forum/action/topic/1",
  title: "Marathon и релизы марта 2026 — обсуждение",
  excerpt: "Экстракшен-шутер от Bungie, Planet of Lana II, Crimson Desert и другие главные релизы месяца.",
  imageSrc: "/images/home/featured.jpg",
  imageAlt: "Главная тема: релизы марта 2026",
  category: "Главная тема",
};

export const NEWS_ITEMS = [
  { href: "/forum/action/topic/1", title: "Marathon — сезоны и контент после релиза 5 марта", excerpt: "Как устроены сезоны в экстракшен-шутере Bungie и что ждать в первом обновлении.", imageSrc: "/images/home/news-1.jpg", imageAlt: "Marathon, Bungie", date: "12 марта 2026" },
  { href: "/forum/rpg/topic/2", title: "Crimson Desert — выход на PC и консолях 19 марта", excerpt: "Обсуждение геймплея, систем и первых впечатлений от экшн-RPG Pearl Abyss.", imageSrc: "/images/home/news-2.jpg", imageAlt: "Crimson Desert", date: "11 марта 2026" },
  { href: "/forum/rpg/topic/3", title: "Monster Hunter Stories 3: Twisted Reflection — релиз 13 марта", excerpt: "Новая часть spin-off серии: повороты сюжета, монстры и мультиплеер.", imageSrc: "/images/home/news-3.jpg", imageAlt: "Monster Hunter Stories 3", date: "10 марта 2026" },
  { href: "/forum/rpg/topic/4", title: "Life Is Strange: Reunion — финал истории Макс и Хлои 26 марта", excerpt: "Сиквел Double Exposure закрывает сюжетную линию; обсуждение и спойлеры.", imageSrc: "/images/home/news-4.jpg", imageAlt: "Life Is Strange: Reunion", date: "9 марта 2026" },
];

export const ACTIVE_DISCUSSIONS = [
  { slug: "action", id: "1", title: "Marathon — сезоны и контент после релиза 5 марта", excerpt: "Как устроены сезоны в экстракшен-шутере Bungie и что ждать в первом обновлении.", replies: 20, views: 150 },
  { slug: "rpg", id: "2", title: "Crimson Desert — выход 19 марта, первые впечатления", excerpt: "Обсуждение геймплея, систем и первых впечатлений от экшн-RPG Pearl Abyss.", replies: 45, views: 320 },
  { slug: "rpg", id: "3", title: "Monster Hunter Stories 3: Twisted Reflection", excerpt: "Новая часть spin-off серии: сюжет, монстры и мультиплеер.", replies: 18, views: 210 },
];

export function getTopicListForSection(_slug: string) {
  return Object.entries(MOCK_TOPICS)
    .filter(([, t]) => t.sectionSlug === _slug)
    .map(([id, t]) => ({
      id,
      title: t.title,
      author: t.author,
      replies: t.replies,
      views: t.views,
      pinned: t.pinned,
      createdAt: t.createdAt,
    }));
}
