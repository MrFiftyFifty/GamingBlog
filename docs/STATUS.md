## TL;DR

- Репо переведено в монорепо: `frontend/` (Next.js 14) + `backend/` (Django 5).
- Вся работа лежит на локальной ветке `integration` (ещё не пушилась).
- **Фронт полностью рабочий** end-to-end через моки — все экраны открываются, навигация, формы, реакции, теги, достижения и т.д. работают без бэка.
- **Бэк нужно дорабатывать** — твоя зона. Подробный список — в `docs/BACKEND_TODO.md`.
- Авторизация (login / register / профиль) уже интегрирована с твоим SimpleJWT — должна работать сразу после запуска обоих серверов.

---

## Что я сделал

### 1. Монорепо

Собрал в `~/GamingBlog` на ветке `integration`:

```
GamingBlog/
├── .gitignore              # общий Node + Python
├── docker-compose.yml      # Postgres 16 для локальной разработки
├── README.md               # инструкции запуска
├── docs/
│   ├── STATUS.md           # этот файл
│   └── BACKEND_TODO.md     # твой TODO-лист
├── frontend/               # весь твой фронт в master → переехал сюда
│   ├── .env.local.example
│   ├── package.json (+тесты, jest)
│   ├── sentry.{client,server}.config.ts  (заглушки)
│   └── src/...
└── backend/                # весь твой бэк из origin/backend → переехал сюда
    ├── .env.example
    ├── requirements.txt
    └── config, users, some_app, forum, moderation, notifications, core/
```

История веток:
- `master` — как был, твой чистый фронт
- `backend` — как был, твой чистый бэк
- `integration` — локальная ветка с объединением и правками (ничего не запушено)

### 2. Правки в твоём бэке

Я трогал только инфраструктурные настройки, **бизнес-логику не менял**:

- `backend/config/settings.py` — перевёл на `django-environ`. Теперь `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `DATABASE_URL`, CORS — через `.env`. Дефолты адекватные.
- Добавил `corsheaders` (middleware + INSTALLED_APPS), чтобы фронт с `localhost:3000` мог ходить в бэк.
- `backend/requirements.txt` — добавил `django-environ`, `django-cors-headers`, `django-filter` (он у тебя был в INSTALLED_APPS, но не в requirements).
- `backend/.env.example` — положил рядом.
- Файловая структура, модели, сериализаторы, вьюхи, URL — **не трогал**.

Тебе нужно только:
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

### 3. Фронт

Большая часть изменений — адаптация фронта под твой бэк и подготовка UI под все фичи ТЗ.

**Адаптация auth под SimpleJWT:**
- NextAuth Credentials провайдер теперь ходит в твой `POST /api/token/`, получает `{access, refresh}`, потом `GET /api/profile/` с `Bearer`.
- `apiFetch` автоматически подставляет `Authorization: Bearer <access>` из сессии.
- Пути выровнены: `register` → `/api/register/`, `getMe` → `/api/profile/`, `notifications` → `/notifications/`, лайки → `/posts/{id}/like|unlike/`.

**Mock-режим для всего, чего пока нет на бэке:**
- `frontend/src/lib/mocks/api-mocks.ts` — моки для секций, топиков, уведомлений, сообщений, жалоб, мод-действий, поиска, пользователей, значков.
- `frontend/src/lib/constants.ts` → `FEATURES` — флаги для каждой фичи. Когда `false`, API-функция возвращает мок. Когда ты сделаешь соответствующий эндпоинт на бэке, я (или ты) просто переключаешь флаг на `true`, и фронт начинает ходить в реальный бэк.
- Это значит: **фронт работает без бэка**. Все экраны (форум, сообщения, модерация, достижения) открываются, UI живой, можно тыкать кнопки.

**Новые фичи ТЗ (добавлено):**
- Теги тем (chip-input, популярные подсказки, отображение)
- Множественные реакции (👍❤️😂😮😡🏆) вместо одиночного лайка
- @mentions (парсятся в markdown-контенте, кликабельны на `/user/{name}`)
- Цитирование постов (кнопка на каждом посте прокидывает цитату в форму ответа)
- Репутация (4 уровня: Новичок/Активный/Ветеран/Эксперт)
- Страница `/profile/achievements` со значками
- Font-size toggle (S/M/L, сохраняется в localStorage, масштабирует весь fluid-текст)
- Skip-to-content link для screen readers
- SEO: `sitemap.xml`, `robots.txt`, полные OpenGraph + Twitter meta, canonical URL
- Аналитика (GA4 + Яндекс.Метрика) через env-переменные `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_YM_ID`
- Jest + React Testing Library настроены, один тест в примере

---

## Что тебе делать дальше — КОРОТКО

Смотри **`docs/BACKEND_TODO.md`** — там вся детализация с эндпоинтами и моделями. Кратко порядок:

### P0 (без этого форум не работает по-настоящему)

1. **Модель `Section`** — добавить, сделать миграцию с дефолтными секциями (`rpg`, `action`, `multiplayer`).
2. **FK `Topic.section` → `Section`** — чтобы топики жили в секциях.
3. **Эндпоинты форума под префиксом `/api/forum/sections/...`**:
   - `GET /api/forum/sections/`
   - `GET /api/forum/sections/{slug}/topics/`
   - `GET /api/forum/sections/{slug}/topics/{id}/`
   - `POST /api/forum/sections/{slug}/topics/`
   - `PATCH /api/forum/sections/{slug}/topics/{id}/`
   - `DELETE /api/forum/sections/{slug}/topics/{id}/`
   - `POST /api/forum/sections/{slug}/topics/{id}/replies/`
4. **Префикс `/api/`** — твои текущие `/topics/`, `/posts/`, `/comments/`, `/notifications/` нужно убрать из корня и положить под `/api/`. Фронт ждёт `/api/` префикс везде. В `config/urls.py` это одна правка — см. `BACKEND_TODO.md`.

### P1 (когда P0 закрыт)

5. `role` поле в `User` (user/moderator/admin), возвращать в `/api/profile/`.
6. `GET /api/notifications/unread-count/`, `POST .../{id}/read/`, `POST .../read-all/`.
7. `GET /api/forum/search/?q=` — Postgres FTS, русский язык.
8. `POST .../pin/`, `.../close/`, `.../report/` для топиков и постов.

### P2 (расширение)

9. Личные сообщения (`/api/messages/*`) — модели Conversation, Message.
10. Модерация (`/api/moderation/*`) — жалобы, бан, варн, лог действий.
11. Профили пользователей: `/api/users/{username}/`, `/api/users/me/settings/`, `/api/users/me/avatar/`.
12. Восстановление пароля: `forgot-password`, `reset-password`, `change-password`.

### Как включить реальный бэк вместо мока

В `frontend/src/lib/constants.ts` найди `FEATURES` и переключи флаг на `true`:

```ts
export const FEATURES = {
  forum: true,        // <-- когда эндпоинты секций готовы
  messages: false,
  moderation: false,
  // ... и так далее
};
```

После этого фронт начнёт ходить в твой бэк по соответствующему разделу.

---

## Как запустить локально

В трёх терминалах (или бэкэнд и фронт-дев в фоне):

```bash
# Terminal 1 — Postgres
cd ~/GamingBlog
docker compose up -d postgres

# Terminal 2 — Backend
cd ~/GamingBlog/backend
python -m venv .venv
source .venv/Scripts/activate   # Windows Git Bash
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000

# Terminal 3 — Frontend
cd ~/GamingBlog/frontend
npm install
cp .env.local.example .env.local
# В .env.local замени NEXTAUTH_SECRET на сгенерённый:
#   openssl rand -base64 32
npm run dev
```

Открой `http://localhost:3000`.

**Что должно работать сразу:**
- Регистрация на `/auth/register` (создаёт юзера в твоей БД через `POST /api/register/`)
- Логин на `/auth/login` (получает JWT через `POST /api/token/`)
- Профиль на `/profile` (читает через `GET /api/profile/`)
- Уведомления, форум, сообщения, модерация, достижения, настройки — **работают на моках** (пока не сделаешь бэк-эндпоинты).

**Django admin:** `http://localhost:8000/admin/` — для управления пользователями напрямую.

---

## Git workflow

Сейчас:
- Вся интеграция на локальной ветке `integration` (в моём клоне, не запушена).
- `master` и `backend` на origin — как были до начала работы, нетронутые.

**Когда ты прочитаешь этот файл и будешь готов:**

1. Я пушу ветку:
   ```bash
   cd ~/GamingBlog
   git push -u origin integration
   ```
2. Открываю PR `integration → master` на GitHub, даю тебе ссылку.
3. Ты ревьюишь — особенно правки в `backend/config/settings.py` и `backend/requirements.txt` (это единственные места, где я тронул твой код).
4. Если всё ок — мерджишь в `master`. После этого `master` становится реальным стволом проекта.
5. Дальше работаем от `master`. Ты делаешь свои фичи из `BACKEND_TODO.md` на отдельных ветках (`backend/sections`, `backend/messages` и т.д.), я переключаю соответствующие `FEATURES` флаги по мере готовности эндпоинтов.

---

## Что НЕ сделано и почему

Честный список того, где есть пробелы:

### На фронте

| Фича | Статус | Почему |
|---|---|---|
| Unit-тесты на все компоненты | Только 1 пример | Рутинная работа, делается по мере надобности |
| hCaptcha при регистрации | env-слот есть, компонент не подключён | Не критично, включим когда появится реальный deployment |
| Полный WCAG 2.1 AA аудит | Базовое есть (aria, skip-link, font-size, keyboard) | Нужен прогон через axe / Lighthouse на всех экранах |
| Email-дайджесты — частота (daily/weekly) | Только on/off в settings | Работа на бэке (кроме UI выбора) |
| Sentry | Заготовка закомментирована | Требует `npm install @sentry/nextjs` и DSN |

### Сознательно не делал (требует бэка или помечено "опционально" в ТЗ)

- Real-time через Socket.io (требует Django Channels или отдельный WS-сервер)
- OAuth Steam/Discord/Google (нужны реальные credentials от провайдеров)
- 2FA (в ТЗ "опционально")
- Push-уведомления (в ТЗ "опционально")
- Antispam-фильтр, чёрный список слов (бэк)
- Rate limiting (бэк — обычно через DRF throttling)

### Несоответствие ТЗ

- ТЗ рекомендует **Node.js + Nest.js** на бэке. У нас **Django** — это решение оставлено за тобой. ТЗ изначально был ориентиром, не жёстким требованием.
- ТЗ упоминает **Redis** (кэш, сессии, rate-limiting, pub/sub). Пока не подключён.

---

## Полный список эндпоинтов, которые фронт зовёт

Жирным — что уже должно работать с твоим текущим бэком.

### Auth
- **POST `/api/token/`** — логин (email + password → access + refresh)
- POST `/api/token/refresh/` — обновить access (фронт пока не использует, перелогин)
- **POST `/api/register/`** — регистрация
- **GET `/api/profile/`** — данные текущего юзера
- POST `/api/auth/forgot-password/` — заглушка, ждёт эндпоинт
- POST `/api/auth/reset-password/` — заглушка
- POST `/api/auth/change-password/` — заглушка

### Forum (ЖДЁТ модель Section и префикс `/api/forum/`)
- GET `/api/forum/sections/`
- GET `/api/forum/sections/{slug}/topics/?page=&sort=&tag=`
- GET `/api/forum/sections/{slug}/topics/{id}/`
- POST `/api/forum/sections/{slug}/topics/`
- PATCH `/api/forum/sections/{slug}/topics/{id}/`
- DELETE `/api/forum/sections/{slug}/topics/{id}/`
- POST `/api/forum/sections/{slug}/topics/{id}/replies/`
- **POST `/posts/{id}/like/`** — под твой текущий путь
- **POST `/posts/{id}/unlike/`** — под твой текущий путь
- POST `/api/forum/posts/{id}/react/` — мульти-реакции, ещё нет на бэке
- POST `/api/forum/posts/{id}/report/` — жалобы, нет на бэке
- GET `/api/forum/search/?q=` — поиск, нет на бэке
- POST `/api/forum/sections/{slug}/topics/{id}/pin/`
- POST `/api/forum/sections/{slug}/topics/{id}/close/`

### Notifications (ЖДЁТ префикс `/api/`)
- **GET `/notifications/`** — под твой текущий путь
- GET `/api/notifications/unread-count/` — ещё нет
- POST `/api/notifications/{id}/read/` — ещё нет
- POST `/api/notifications/read-all/` — ещё нет

### Messages (ЖДЁТ реализацию)
- GET `/api/messages/conversations/`
- GET `/api/messages/conversations/{id}/?page=`
- POST `/api/messages/`
- POST `/api/messages/conversations/{id}/read/`

### Moderation (ЖДЁТ реализацию)
- GET `/api/moderation/complaints/?status=&page=`
- POST `/api/moderation/complaints/{id}/resolve/`
- GET `/api/moderation/actions/?page=`
- POST `/api/moderation/users/{username}/ban/`
- POST `/api/moderation/users/{username}/warn/`
- DELETE `/api/moderation/posts/{id}/`

### Users (ЖДЁТ реализацию)
- GET `/api/users/{username}/`
- PATCH `/api/users/me/profile/`
- POST `/api/users/me/avatar/` (multipart)
- GET `/api/users/me/settings/`
- PATCH `/api/users/me/settings/`
- GET `/api/users/search/?q=`
- GET `/api/users/{username}/topics/?page=`

---
