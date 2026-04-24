from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


class TopicBan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='topic_bans')
    topic = models.ForeignKey('Topic', on_delete=models.CASCADE, related_name='bans')
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} banned in {self.topic}"