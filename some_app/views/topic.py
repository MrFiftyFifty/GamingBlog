from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models import Topic
from ..serializers import TopicSerializer


class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all().order_by('-created_at')
    serializer_class = TopicSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

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

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticatedOrReadOnly])
    def my_subscriptions(self, request):
        user = request.user

        if not user.is_authenticated:
            return Response(
                {"detail": "Требуется авторизация"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        topics = Topic.objects.filter(subscribers=user).order_by('-created_at')

        page = self.paginate_queryset(topics)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(topics, many=True)
        return Response(serializer.data)