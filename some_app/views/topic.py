from rest_framework import viewsets, status, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models import Topic
from ..serializers import TopicSerializer


class TopicViewSet(viewsets.ModelViewSet):
    serializer_class = TopicSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = (
            Topic.objects
            .select_related('section', 'author')
            .prefetch_related('tags')
            .order_by('-is_pinned', '-created_at')
        )

        tag = self.request.query_params.get('tag')

        if tag:
            queryset = queryset.filter(tags__slug=tag)

        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        self.check_permissions(self.request)
        serializer.save()

    def perform_destroy(self, instance):
        self.check_permissions(self.request)
        instance.delete()

    @action(detail=True, methods=['post'])
    def subscribe(self, request, pk=None):
        topic = self.get_object()

        if topic.subscribers.filter(id=request.user.id).exists():
            return Response(
                {"detail": "Вы уже подписаны"},
                status=status.HTTP_400_BAD_REQUEST
            )

        topic.subscribers.add(request.user)

        return Response({
            "status": "subscribed",
            "subscribers_count": topic.subscribers.count()
        })

    @action(detail=True, methods=['post'])
    def unsubscribe(self, request, pk=None):
        topic = self.get_object()

        if not topic.subscribers.filter(id=request.user.id).exists():
            return Response(
                {"detail": "Вы не подписаны"},
                status=status.HTTP_400_BAD_REQUEST
            )

        topic.subscribers.remove(request.user)

        return Response({
            "status": "unsubscribed",
            "subscribers_count": topic.subscribers.count()
        })

    @action(detail=False, methods=['get'])
    def my_subscriptions(self, request):
        user = request.user

        if not user.is_authenticated:
            return Response(
                {"detail": "Требуется авторизация"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        topics = (
            Topic.objects
            .filter(subscribers=user)
            .select_related('section', 'author')
            .prefetch_related('tags')
            .order_by('-created_at')
        )

        page = self.paginate_queryset(topics)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(topics, many=True)
        return Response(serializer.data)