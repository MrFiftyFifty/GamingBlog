from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


class Profile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )

    avatar = models.ImageField(
        upload_to='avatars/',
        default='avatars/default.png',
        blank=True
    )

    status = models.CharField(max_length=255, blank=True)

    games_played = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)

    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(null=True, blank=True)

    steam_id = models.CharField(max_length=50, blank=True)
    steam_nickname = models.CharField(max_length=255, blank=True)
    steam_avatar = models.URLField(blank=True)

    def __str__(self):
        return f"{self.user}"