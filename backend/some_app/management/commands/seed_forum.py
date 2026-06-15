from django.core.management.base import BaseCommand

from some_app.models import Section


DEFAULT_SECTIONS = [
    {
        "slug": "rpg",
        "title": "RPG / Новинки",
        "description": "Обсуждение ролевых игр и новинок",
    },
    {
        "slug": "action",
        "title": "Экшен",
        "description": "Экшен-игры и шутеры",
    },
    {
        "slug": "multiplayer",
        "title": "Мультиплеер",
        "description": "Поиск команды, кооператив",
    },
]


class Command(BaseCommand):
    help = "Create default forum sections for GamingBlog"

    def handle(self, *args, **options):
        created = 0
        for item in DEFAULT_SECTIONS:
            _, was_created = Section.objects.get_or_create(
                slug=item["slug"],
                defaults={
                    "title": item["title"],
                    "description": item["description"],
                },
            )
            if was_created:
                created += 1
        self.stdout.write(
            self.style.SUCCESS(
                f"Sections ready ({created} created, {len(DEFAULT_SECTIONS) - created} already existed)"
            )
        )
