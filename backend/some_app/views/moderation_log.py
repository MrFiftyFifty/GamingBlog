from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated

from ..models import ModerationLog, Topic
from ..serializers import ModerationLogSerializer


class ModerationLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ModerationLogSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter
    ]

    search_fields = [
        'action',
        'reason',
        'moderator__username',
        'target_user__username',
        'topic__title'
    ]

    ordering_fields = [
        'created_at',
        'action'
    ]

    ordering = [
        '-created_at'
    ]

    def get_queryset(self):
        user = self.request.user

        queryset = ModerationLog.objects.select_related(
            'moderator',
            'target_user',
            'topic',
            'content_type'
        )

        if user.is_superuser or user.is_staff:
            return queryset

        moderated_topic_ids = Topic.objects.filter(
            moderators=user
        ).values_list('id', flat=True)

        return queryset.filter(topic_id__in=moderated_topic_ids)