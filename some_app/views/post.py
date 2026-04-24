from django.db.models import Count

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.exceptions import PermissionDenied

from ..permissions import (
    IsOwnerOrAdminOrReadOnly,
    IsTopicModeratorOrAdmin,
    IsNotBannedInTopic
)
from ..models import Post, Notification, TopicBan
from ..serializers import PostSerializer


class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
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
        return Post.objects.annotate(likes_count=Count('likes'))

    def perform_create(self, serializer):
        post = serializer.save(author=self.request.user)

        if TopicBan.objects.filter(user=self.request.user, topic=post.topic).exists():
            raise PermissionDenied("You are banned in this topic")

        if post.topic.author != self.request.user:
            Notification.objects.create(
                sender=self.request.user,
                recipient=post.topic.author,
                notification_type='post',
                post=post
            )

    def perform_update(self, serializer):
        self.check_permissions(self.request)
        serializer.save()

    def perform_destroy(self, instance):
        self.check_permissions(self.request)
        instance.delete()

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        post = self.get_object()

        if post.likes.filter(id=request.user.id).exists():
            return Response(
                {"detail": "already liked"},
                status=status.HTTP_400_BAD_REQUEST
            )

        post.likes.add(request.user)

        if post.author != request.user:
            Notification.objects.create(
                sender=request.user,
                recipient=post.author,
                notification_type='like',
                post=post
            )

        return Response({
            "status": "liked",
            "likes_count": post.likes.count()
        })

    @action(detail=True, methods=['post'])
    def unlike(self, request, pk=None):
        post = self.get_object()

        if not post.likes.filter(id=request.user.id).exists():
            return Response(
                {"detail": "not liked"},
                status=status.HTTP_400_BAD_REQUEST
            )

        post.likes.remove(request.user)

        return Response({
            "status": "unliked",
            "likes_count": post.likes.count()
        })