from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.utils import timezone


User = settings.AUTH_USER_MODEL


class ContentReport(models.Model):
    REASON_SPAM = 'spam'
    REASON_INSULT = 'insult'
    REASON_ADULT = 'adult'
    REASON_VIOLENCE = 'violence'
    REASON_OTHER = 'other'

    REASON_CHOICES = [
        (REASON_SPAM, 'Spam'),
        (REASON_INSULT, 'Insult or harassment'),
        (REASON_ADULT, 'Adult content'),
        (REASON_VIOLENCE, 'Violence'),
        (REASON_OTHER, 'Other'),
    ]

    STATUS_PENDING = 'pending'
    STATUS_REVIEWED = 'reviewed'
    STATUS_RESOLVED = 'resolved'
    STATUS_REJECTED = 'rejected'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_REVIEWED, 'Reviewed'),
        (STATUS_RESOLVED, 'Resolved'),
        (STATUS_REJECTED, 'Rejected'),
    ]

    reporter = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='content_reports'
    )

    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE
    )

    object_id = models.PositiveIntegerField()

    content_object = GenericForeignKey(
        'content_type',
        'object_id'
    )

    reason = models.CharField(
        max_length=30,
        choices=REASON_CHOICES
    )

    description = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING
    )

    moderator = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='moderated_content_reports'
    )

    moderator_comment = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['reporter', 'content_type', 'object_id'],
                name='unique_report_per_user_and_content'
            )
        ]

    def mark_reviewed(self, moderator, comment=''):
        self.status = self.STATUS_REVIEWED
        self.moderator = moderator
        self.moderator_comment = comment
        self.save(update_fields=[
            'status',
            'moderator',
            'moderator_comment',
            'updated_at'
        ])

    def mark_resolved(self, moderator, comment=''):
        self.status = self.STATUS_RESOLVED
        self.moderator = moderator
        self.moderator_comment = comment
        self.resolved_at = timezone.now()
        self.save(update_fields=[
            'status',
            'moderator',
            'moderator_comment',
            'resolved_at',
            'updated_at'
        ])

    def mark_rejected(self, moderator, comment=''):
        self.status = self.STATUS_REJECTED
        self.moderator = moderator
        self.moderator_comment = comment
        self.resolved_at = timezone.now()
        self.save(update_fields=[
            'status',
            'moderator',
            'moderator_comment',
            'resolved_at',
            'updated_at'
        ])

    def __str__(self):
        return f'{self.reporter} reported {self.content_type} #{self.object_id}'