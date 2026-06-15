from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models


User = settings.AUTH_USER_MODEL


class ModerationLog(models.Model):
    ACTION_EDIT_TOPIC = 'edit_topic'
    ACTION_DELETE_TOPIC = 'delete_topic'
    ACTION_EDIT_POST = 'edit_post'
    ACTION_DELETE_POST = 'delete_post'
    ACTION_EDIT_COMMENT = 'edit_comment'
    ACTION_DELETE_COMMENT = 'delete_comment'
    ACTION_BAN_USER = 'ban_user'
    ACTION_UNBAN_USER = 'unban_user'
    ACTION_REVIEW_REPORT = 'review_report'
    ACTION_RESOLVE_REPORT = 'resolve_report'
    ACTION_REJECT_REPORT = 'reject_report'

    ACTION_CHOICES = [
        (ACTION_EDIT_TOPIC, 'Edit topic'),
        (ACTION_DELETE_TOPIC, 'Delete topic'),
        (ACTION_EDIT_POST, 'Edit post'),
        (ACTION_DELETE_POST, 'Delete post'),
        (ACTION_EDIT_COMMENT, 'Edit comment'),
        (ACTION_DELETE_COMMENT, 'Delete comment'),
        (ACTION_BAN_USER, 'Ban user'),
        (ACTION_UNBAN_USER, 'Unban user'),
        (ACTION_REVIEW_REPORT, 'Review report'),
        (ACTION_RESOLVE_REPORT, 'Resolve report'),
        (ACTION_REJECT_REPORT, 'Reject report'),
    ]

    moderator = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='moderation_logs'
    )

    target_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='moderation_logs_as_target'
    )

    topic = models.ForeignKey(
        'Topic',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='moderation_logs'
    )

    action = models.CharField(
        max_length=50,
        choices=ACTION_CHOICES
    )

    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    object_id = models.PositiveIntegerField(null=True, blank=True)

    content_object = GenericForeignKey(
        'content_type',
        'object_id'
    )

    reason = models.TextField(blank=True)

    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.moderator} -> {self.action}'