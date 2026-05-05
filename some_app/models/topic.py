from django.conf import settings
from django.db import models


User = settings.AUTH_USER_MODEL


class Topic(models.Model):
    section = models.ForeignKey(
        'Section',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='topics'
    )

    title = models.CharField(max_length=255)
    content = models.TextField()

    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='topics'
    )

    tags = models.ManyToManyField(
        'Tag',
        related_name='topics',
        blank=True
    )

    subscribers = models.ManyToManyField(
        User,
        related_name='subscribed_topics',
        blank=True
    )

    moderators = models.ManyToManyField(
        User,
        related_name='moderated_topics',
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_pinned = models.BooleanField(default=False)

    class Meta:
        ordering = ['-is_pinned', '-created_at']

    def __str__(self):
        return self.title