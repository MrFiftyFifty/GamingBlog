from django.db.models import Count

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.exceptions import PermissionDenied

from ..models import Comment, Notification, TopicBan
from ..permissions import (
    IsOwnerOrAdminOrReadOnly,
    IsTopicModeratorOrAdmin,
    IsNotBannedInTopic
)
from ..serializers import CommentSerializer


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [
        IsAuthenticatedOrReadOnly,
        IsOwnerOrAdminOrReadOnly,
        IsTopicModeratorOrAdmin,
        IsNotBannedInTopic
    ]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['content', 'author__username']
    ordering_fields = ['created_at', 'likes_count']
    ordering = ['-created_at']

    def get_queryset(self):
        return Comment.objects.filter(parent__isnull=True).annotate(
            likes_count=Count('likes')
        )

    def perform_create(self, serializer):
        comment = serializer.save(author=self.request.user)

        topic = comment.post.topic if comment.post else None

        if topic and TopicBan.objects.filter(user=self.request.user, topic=topic).exists():
            raise PermissionDenied("You are banned in this topic")

        if comment.post and comment.post.author != self.request.user:
            Notification.objects.create(
                sender=self.request.user,
                recipient=comment.post.author,
                notification_type='comment',
                post=comment.post,
                comment=comment
            )

    def perform_update(self, serializer):
        instance = serializer.save()

        if instance.post:
            self.check_permissions(self.request)

    def perform_destroy(self, instance):
        self.check_permissions(self.request)
        instance.delete()

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        comment = self.get_object()

        if comment.likes.filter(id=request.user.id).exists():
            return Response(
                {"detail": "already liked"},
                status=status.HTTP_400_BAD_REQUEST
            )

        comment.likes.add(request.user)

        if comment.author != request.user:
            Notification.objects.create(
                sender=request.user,
                recipient=comment.author,
                notification_type='like',
                comment=comment
            )

        return Response({
            "status": "liked",
            "likes_count": comment.likes.count()
        })

    @action(detail=True, methods=['post'])
    def unlike(self, request, pk=None):
        comment = self.get_object()

        if not comment.likes.filter(id=request.user.id).exists():
            return Response(
                {"detail": "not liked"},
                status=status.HTTP_400_BAD_REQUEST
            )

        comment.likes.remove(request.user)

        return Response({
            "status": "unliked",
            "likes_count": comment.likes.count()
        })