from django.db import models
from django.conf import settings
from .topic import Topic

User = settings.AUTH_USER_MODEL


class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    likes = models.ManyToManyField(
        User,
        related_name='liked_posts',
        blank=True
    )

    def __str__(self):
        return f"{self.author} -> {self.topic}"