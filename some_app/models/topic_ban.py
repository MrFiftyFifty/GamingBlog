from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


class TopicBan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    topic = models.ForeignKey('Topic', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'topic')

    def __str__(self):
        return f"{self.user} banned in {self.topic}"