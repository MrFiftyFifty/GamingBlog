from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


class SteamGame(models.Model):
    appid = models.PositiveIntegerField(unique=True)
    name = models.CharField(max_length=255)
    icon_url = models.URLField(blank=True)

    def __str__(self):
        return self.name


class UserSteamGame(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='steam_games'
    )
    game = models.ForeignKey(
        SteamGame,
        on_delete=models.CASCADE,
        related_name='user_games'
    )

    playtime_forever = models.PositiveIntegerField(default=0)
    playtime_2weeks = models.PositiveIntegerField(default=0)
    last_played = models.DateTimeField(null=True, blank=True)

    stats = models.JSONField(default=dict, blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'game')

    def __str__(self):
        return f"{self.user} -> {self.game}"