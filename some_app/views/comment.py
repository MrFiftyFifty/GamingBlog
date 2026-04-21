from django.db.models import Count

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from ..models import Comment, Notification
from ..permissions import IsOwnerOrAdminOrReadOnly
from ..serializers import CommentSerializer


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [
        IsAuthenticatedOrReadOnly,
        IsOwnerOrAdminOrReadOnly
    ]

    def get_queryset(self):
        qs = Comment.objects.filter(parent__isnull=True).annotate(
            likes_count=Count('likes')
        )

        sort = self.request.query_params.get('sort')

        if sort == 'top':
            return qs.order_by('-likes_count', '-created_at')

        if sort == 'new':
            return qs.order_by('-created_at')

        if sort == 'hot':
            return qs.order_by('-likes_count', '-created_at')

        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        comment = serializer.save(author=self.request.user)

        if comment.post and comment.post.author != self.request.user:
            Notification.objects.create(
                sender=self.request.user,
                recipient=comment.post.author,
                notification_type='comment',
                post=comment.post,
                comment=comment
            )

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