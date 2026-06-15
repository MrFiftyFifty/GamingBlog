from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()

DEMO_EMAIL = "demo@gamingblog.local"
DEMO_USERNAME = "demo"
DEMO_PASSWORD = "Demo12345!"


class Command(BaseCommand):
    help = "Create or update demo user for local login and screenshots"

    def add_arguments(self, parser):
        parser.add_argument(
            "--moderator",
            action="store_true",
            help="Grant staff flag (moderation UI on backend; set role via profile if needed)",
        )

    def handle(self, *args, **options):
        user, created = User.objects.get_or_create(
            email=DEMO_EMAIL,
            defaults={
                "username": DEMO_USERNAME,
                "bio": "Demo account for local testing",
                "rating": 128,
            },
        )
        user.username = DEMO_USERNAME
        user.set_password(DEMO_PASSWORD)
        user.is_active = True
        if options["moderator"]:
            user.is_staff = True
        user.save()

        action = "created" if created else "updated"
        self.stdout.write(
            self.style.SUCCESS(
                f"Demo user {action}.\n"
                f"  Email:    {DEMO_EMAIL}\n"
                f"  Username: {DEMO_USERNAME}\n"
                f"  Password: {DEMO_PASSWORD}\n"
                f"  Login:    http://localhost:3000/auth/login\n"
                f"  Profile:  http://localhost:3000/user/{DEMO_USERNAME}"
            )
        )
