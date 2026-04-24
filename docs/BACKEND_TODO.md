# Backend TODO — что нужно добавить на бэке

Фронт уже написан под "расширенный" контракт API. Ниже — список эндпоинтов, моделей и полей, которых сейчас на бэке нет. Расставлены по приоритету.

**Важное общее требование:** все существующие эндпоинты нужно перенести под префикс `/api/...` — сейчас `/topics/`, `/posts/`, `/comments/`, `/notifications/` висят в корне. Фронт ждёт `/api/...`. Простейший фикс в `config/urls.py`:

```python
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include([
        path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        path('register/', RegisterView.as_view(), name='register'),
        path('profile/', ProfileView.as_view(), name='profile'),
        path('', include('some_app.urls')),  # topics/, posts/, comments/, notifications/
    ])),
]
```

---

## P0 — без этого форум не работает

### Модель `Section`

```python
class Section(models.Model):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)  # имя lucide-иконки
    order = models.IntegerField(default=0)
```

FK в `Topic`:
```python
class Topic(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='topics')
    # ... остальное как сейчас
```

Data-миграция: создать дефолтные секции (`rpg`, `shooters`, `mmo`, `strategy`, `lfg`, `news`).

### Эндпоинты форума (под префиксом `/api/forum/`)

| Метод | Путь | Что делает |
|---|---|---|
| GET | `/api/forum/sections/` | Список всех секций |
| GET | `/api/forum/sections/{slug}/topics/?page=&sort=&filter=` | Топики секции (пагинация, сорт: `new`/`popular`/`active`, фильтр) |
| GET | `/api/forum/sections/{slug}/topics/{id}/` | Один топик с постами |
| POST | `/api/forum/sections/{slug}/topics/` | Создать топик в секции |
| PATCH | `/api/forum/sections/{slug}/topics/{id}/` | Отредактировать топик |
| DELETE | `/api/forum/sections/{slug}/topics/{id}/` | Удалить топик |
| POST | `/api/forum/sections/{slug}/topics/{id}/replies/` | Создать ответ (Post) в топике |

### TopicSerializer должен возвращать

```json
{
  "id": 1,
  "title": "...",
  "content": "...",
  "slug_in_section": "...",
  "section": {"id": 1, "slug": "rpg", "name": "RPG"},
  "author": {"id": 1, "username": "...", "avatar": "...", "role": "user"},
  "created_at": "...",
  "updated_at": "...",
  "is_pinned": false,
  "is_closed": false,
  "posts_count": 42,
  "views_count": 123,
  "last_post": {"author": {...}, "created_at": "..."}
}
```

---

## P1 — базовые фичи (следующая итерация)

### Auth
- Поле `role` в `User` (выбор из `user`/`moderator`/`admin`), возвращать в `/api/profile/`.
- `GET /api/auth/me/` — alias для `/api/profile/` (опционально, фронт адаптирован под `/api/profile/`).

### Уведомления
- `GET /api/notifications/unread-count/` → `{count: int}`
- `POST /api/notifications/{id}/read/`
- `POST /api/notifications/read-all/`

### Поиск
- `GET /api/forum/search/?q=...&page=` — полнотекстовый поиск по топикам и постам. Использовать PostgreSQL FTS (`SearchVector`, `SearchQuery`), поддержка русского языка.

### Модерация тем/постов
- `POST /api/forum/sections/{slug}/topics/{id}/pin/` — закрепить (только модератор/админ)
- `POST /api/forum/sections/{slug}/topics/{id}/close/` — закрыть
- `POST /api/forum/posts/{id}/report/` — пожаловаться, `body: {reason: string}`

---

## P2 — расширенные (по мере надобности)

### Личные сообщения (`/api/messages/`)

```
GET    /api/messages/conversations/             — список диалогов
GET    /api/messages/conversations/{id}/?page=  — сообщения в диалоге
POST   /api/messages/                           — отправить ({recipient_id, content})
POST   /api/messages/conversations/{id}/read/   — пометить прочитанным
```

Модели: `Conversation` (M2M users), `Message` (conversation, author, content, is_read, created_at).

### Модерация (`/api/moderation/`)

```
GET   /api/moderation/complaints/?status=&page=   — список жалоб
POST  /api/moderation/complaints/{id}/resolve/    — обработать жалобу
GET   /api/moderation/actions/?page=              — лог действий модераторов
POST  /api/moderation/users/{username}/ban/       — бан, {reason, duration_days?}
POST  /api/moderation/users/{username}/warn/      — варн, {reason}
DELETE /api/moderation/posts/{id}/                — удаление поста модератором
```

Permission: только `role in ('moderator', 'admin')`. Все действия логировать в `ModAction`.

### Пользователи

```
GET    /api/users/{username}/                  — публичный профиль
GET    /api/users/{username}/topics/?page=     — топики юзера
GET    /api/users/search/?q=                   — поиск юзеров по username
PATCH  /api/users/me/profile/                  — обновить bio, username и т.п.
GET    /api/users/me/settings/                 — настройки (темы, уведомления)
PATCH  /api/users/me/settings/                 — обновить настройки
POST   /api/users/me/avatar/                   — загрузить аватар (multipart)
```

### Восстановление пароля

```
POST /api/auth/forgot-password/    — {email}, шлёт email со ссылкой
POST /api/auth/reset-password/     — {token, new_password}
POST /api/auth/change-password/    — {current_password, new_password} (авторизованный)
```

Для email-сервиса — SendGrid / Mailgun (см. ТЗ п. 5.1).

---

## Как фронт адаптирован сейчас

В `frontend/src/lib/constants.ts` есть объект `FEATURES` с флагами. По мере реализации эндпоинтов — переключай соответствующий флаг на `true`:

```ts
export const FEATURES = {
  messages: false,              // /api/messages/*
  moderation: false,            // /api/moderation/*
  search: false,                // /api/forum/search
  userProfilesByUsername: false,// /api/users/{username}
  userSettings: false,          // /api/users/me/settings
  avatarUpload: false,          // /api/users/me/avatar
  passwordReset: false,         // /api/auth/forgot-password + reset
  changePassword: false,        // /api/auth/change-password
  notificationsUnreadCount: false,
  notificationsMarkRead: false,
  topicPin: false,
  topicClose: false,
  postReport: false,
  steamOAuth: false,
};
```

Когда фича готова на бэке — меняешь `false` → `true`, перезапускаешь фронт. Middleware автоматически разрешит соответствующие роуты, UI покажет спрятанные ссылки.

---

## Чек-лист на коммит с бэк-фичами

Для каждой новой группы эндпоинтов коллеге нужно:

1. Добавить/изменить модели в `some_app/models.py` (или создать новый app).
2. Создать миграции: `python manage.py makemigrations && python manage.py migrate`.
3. Написать сериализаторы (`some_app/serializers.py`).
4. Написать viewsets/views (`some_app/views/`).
5. Подключить URL в `some_app/urls.py` (или создать `forum/urls.py`, `messages/urls.py` и т.п.).
6. Подключить их в `config/urls.py` под префиксом `/api/...`.
7. Права доступа: минимум `IsAuthenticatedOrReadOnly` для чтения, `IsOwnerOrAdminOrReadOnly` для изменений.
8. Сказать фронту: переключить флаг в `FEATURES`.
