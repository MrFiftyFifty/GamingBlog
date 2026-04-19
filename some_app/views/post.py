from django.db.models import Count

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from ..permissions import IsOwnerOrAdminOrReadOnly

from ..models import Post
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
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        post = self.get_object()

        if post.likes.filter(id=request.user.id).exists():
            return Response(
                {"detail": "already liked"},
                status=status.HTTP_400_BAD_REQUEST
            )

        post.likes.add(request.user)

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