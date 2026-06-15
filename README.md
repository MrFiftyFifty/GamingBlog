# GamingBlog

Монорепо веб-форума о компьютерных играх.

- `frontend/` — Next.js 14 (App Router) + TypeScript + TailwindCSS + NextAuth + SWR
- `backend/` — Django 5 + DRF + SimpleJWT + PostgreSQL
- `docker-compose.yml` — PostgreSQL для локальной разработки

## Требования

- Node.js 20+
- Python 3.11+
- Docker Desktop (для PostgreSQL) либо локально установленный PostgreSQL 16

## Быстрый старт

### 1. PostgreSQL

```bash
docker compose up -d postgres
```

Поднимет Postgres на `localhost:5432` с БД `gamingblog` (юзер/пароль: `gamingblog`/`gamingblog`).

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate   # Windows (Git Bash)
# source .venv/bin/activate     # Linux/macOS
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py seed_forum
python manage.py seed_demo_user
python manage.py runserver 0.0.0.0:8000
```

Бэк слушает на `http://localhost:8000`. Django admin: `http://localhost:8000/admin/`.

### Демо-пользователь

После `seed_demo_user` (создаётся автоматически в шагах выше):

| Поле | Значение |
|------|----------|
| Email | `demo@gamingblog.local` |
| Username | `demo` |
| Пароль | `Demo12345!` |

Вход на фронте: `http://localhost:3000/auth/login`, профиль: `http://localhost:3000/user/demo`.

Если PostgreSQL недоступен, в `backend/.env` задайте `USE_SQLITE=true` (локальная БД `backend/db.sqlite3`).

### 3. Frontend

В отдельном терминале:

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Сгенерируй NEXTAUTH_SECRET и впиши в .env.local:
#   openssl rand -base64 32
npm run dev
```

Фронт на `http://localhost:3000`.

## Что работает сейчас

После интеграции ветки `backend` (код коллеги в каталоге `backend/`):

- ✅ Регистрация и логин (JWT, `/api/register/`, `/api/token/`)
- ✅ Профиль (`/api/profile/`, `/profile`)
- ✅ Разделы форума и список тем (`/api/forum/sections/`, темы по разделу)
- ✅ Просмотр темы и ответы (bridge API под фронт)
- ✅ Уведомления (список, счётчик, прочитано)
- ✅ Сброс пароля (API; нужен SMTP в `.env`)
- ✅ OpenAPI: `http://localhost:8000/api/docs/`
- ✅ Django admin

## Что пока на моках (feature-flags = false)

См. `frontend/src/lib/constants.ts` и `docs/BACKEND_TODO.md`.

- ⚠️ Личные сообщения и модерация подключены к API коллеги через адаптеры (`private-messages`, `reports`, `moderation-logs`)
- ❌ Публичные профили по `username`, настройки, аватар
- ❌ OAuth Steam / Discord / Google (нужны ключи в `.env`)

## Структура API

Фронт зовёт бэк по `NEXT_PUBLIC_API_URL` (по умолчанию `http://localhost:8000`) с JWT (`Authorization: Bearer <access>`) в заголовках.

Текущие используемые эндпоинты:

| Метод | Путь | Назначение |
|---|---|---|
| POST | `/api/token/` | Логин (email + password) → `{access, refresh}` |
| POST | `/api/token/refresh/` | Обновление access-токена |
| POST | `/api/register/` | Регистрация |
| GET | `/api/profile/` | Данные текущего юзера |
| GET | `/notifications/` | Список уведомлений |
| POST | `/posts/{id}/like/` | Лайк поста |
| POST | `/posts/{id}/unlike/` | Снять лайк |

## Ветки

- `master` — стабильный фронт (до интеграции)
- `backend` — стабильный бэк (до интеграции)
- `integration` — монорепо (текущая)

## Git push (когда будешь готов)

```bash
git push origin integration
```

Открой PR `integration → master`, дай коллеге ревью, потом мерджи.

## GitHub Pages (демо фронтенда)

Workflow: `.github/workflows/deploy.yml` (по образцу [ark-task](https://github.com/MrFiftyFifty/ark-task)).

**Один раз в репозитории:** Settings → Pages → Build and deployment → Source: **GitHub Actions**.

После push в `main` или `integration` сайт будет доступен по адресу:

**https://mrfiftyfifty.github.io/GamingBlog/**

Локальная проверка статической сборки:

```bash
cd frontend
npm run build:pages
npm run restore:pages   # вернуть middleware и NextAuth API для dev
```

Ограничения GitHub Pages: только статический экспорт Next.js (без Django и без NextAuth API). На Pages работают главная, форум и демо-страницы с mock-данными; вход и запись к бэкенду — только при локальном запуске или при отдельном хостинге API.
