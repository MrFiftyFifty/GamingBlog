from django.db.models import Count

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from ..permissions import IsOwnerOrAdminOrReadOnly
from ..models import Post, Notification
from ..serializers import PostSerializer


class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [
        IsAuthenticatedOrReadOnly,
        IsOwnerOrAdminOrReadOnly
    ]

    def get_queryset(self):
        return (
            Post.objects
            .annotate(likes_count=Count('likes'))
            .order_by('-likes_count', '-created_at')
        )

    def perform_create(self, serializer):
        post = serializer.save(author=self.request.user)

        if post.topic.author != self.request.user:
            Notification.objects.create(
                sender=self.request.user,
                recipient=post.topic.author,
                notification_type='post',
                post=post
            )

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