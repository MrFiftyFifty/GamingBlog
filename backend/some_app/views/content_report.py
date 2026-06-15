from django.contrib.contenttypes.models import ContentType
from django.db.models import Q

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import ContentReport, Topic, Post, Comment
from ..serializers import ContentReportSerializer


class ContentReportViewSet(viewsets.ModelViewSet):
    serializer_class = ContentReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        queryset = ContentReport.objects.select_related(
            'reporter',
            'moderator',
            'content_type'
        )

        if user.is_superuser or user.is_staff:
            return queryset

        moderated_topic_ids = Topic.objects.filter(
            Q(author=user) | Q(moderators=user)
        ).distinct().values_list('id', flat=True)

        topic_content_type = ContentType.objects.get_for_model(Topic)
        post_content_type = ContentType.objects.get_for_model(Post)
        comment_content_type = ContentType.objects.get_for_model(Comment)

        moderated_post_ids = Post.objects.filter(
            topic_id__in=moderated_topic_ids
        ).values_list('id', flat=True)

        moderated_comment_ids = Comment.objects.filter(
            post__topic_id__in=moderated_topic_ids
        ).values_list('id', flat=True)

        return queryset.filter(
            Q(reporter=user) |
            Q(content_type=topic_content_type, object_id__in=moderated_topic_ids) |
            Q(content_type=post_content_type, object_id__in=moderated_post_ids) |
            Q(content_type=comment_content_type, object_id__in=moderated_comment_ids)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)

    def get_target_topic(self, report):
        content_object = report.content_object

        if isinstance(content_object, Topic):
            return content_object

        if isinstance(content_object, Post):
            return content_object.topic

        if isinstance(content_object, Comment):
            return content_object.post.topic

        return None

    def can_moderate_report(self, user, report):
        if user.is_superuser or user.is_staff:
            return True

        topic = self.get_target_topic(report)

        if not topic:
            return False

        if topic.author == user:
            return True

        return topic.moderators.filter(id=user.id).exists()

    @action(detail=False, methods=['get'])
    def pending(self, request):
        reports = self.get_queryset().filter(status=ContentReport.STATUS_PENDING)

        page = self.paginate_queryset(reports)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(reports, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_reviewed(self, request, pk=None):
        report = self.get_object()

        if not self.can_moderate_report(request.user, report):
            return Response(
                {'detail': 'You do not have permission to review this report'},
                status=status.HTTP_403_FORBIDDEN
            )

        comment = request.data.get('moderator_comment', '')

        report.mark_reviewed(
            moderator=request.user,
            comment=comment
        )

        serializer = self.get_serializer(report)

        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        report = self.get_object()

        if not self.can_moderate_report(request.user, report):
            return Response(
                {'detail': 'You do not have permission to resolve this report'},
                status=status.HTTP_403_FORBIDDEN
            )

        comment = request.data.get('moderator_comment', '')

        report.mark_resolved(
            moderator=request.user,
            comment=comment
        )

        serializer = self.get_serializer(report)

        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        report = self.get_object()

        if not self.can_moderate_report(request.user, report):
            return Response(
                {'detail': 'You do not have permission to reject this report'},
                status=status.HTTP_403_FORBIDDEN
            )

        comment = request.data.get('moderator_comment', '')

        report.mark_rejected(
            moderator=request.user,
            comment=comment
        )

        serializer = self.get_serializer(report)

        return Response(serializer.data)