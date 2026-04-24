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
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

Бэк слушает на `http://localhost:8000`. Django admin: `http://localhost:8000/admin/`.

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

- ✅ Регистрация (`/auth/register`)
- ✅ Логин (`/auth/login`)
- ✅ Профиль авторизованного юзера (`/profile`)
- ✅ Уведомления (`/notifications`) — без счётчика непрочитанных
- ✅ Django admin

## Что пока отключено (feature-flags)

Эндпоинтов на бэке ещё нет. Соответствующие роуты фронта возвращают 404, ссылки скрыты в меню. См. `docs/BACKEND_TODO.md`.

- ❌ Форум (ждём модель `Section` на бэке)
- ❌ Личные сообщения
- ❌ Модерация
- ❌ Поиск
- ❌ Публичные профили по `username`
- ❌ Настройки пользователя, загрузка аватара
- ❌ Сброс/смена пароля
- ❌ Счётчик непрочитанных уведомлений, "пометить всё прочитанным"
- ❌ Закрепить/закрыть тему, пожаловаться на пост

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
