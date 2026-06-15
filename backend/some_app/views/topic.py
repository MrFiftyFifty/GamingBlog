from rest_framework import viewsets, status, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from ..models import Topic, ModerationLog
from ..serializers import TopicSerializer
from ..services.moderation_log import create_moderation_log


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
            .prefetch_related('tags', 'moderators')
            .order_by('-is_pinned', '-created_at')
        )

        tag = self.request.query_params.get('tag')

        if tag:
            queryset = queryset.filter(tags__slug=tag)

        return queryset

    def can_manage_topic(self, user, topic):
        if not user or not user.is_authenticated:
            return False

        if user.is_superuser or user.is_staff:
            return True

        if topic.author == user:
            return True

        if topic.moderators.filter(id=user.id).exists():
            return True

        return False

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        topic = serializer.instance

        if not self.can_manage_topic(self.request.user, topic):
            raise PermissionDenied("You do not have permission to edit this topic")

        updated_topic = serializer.save()

        if self.request.user != updated_topic.author:
            create_moderation_log(
                moderator=self.request.user,
                action=ModerationLog.ACTION_EDIT_TOPIC,
                target_object=updated_topic,
                target_user=updated_topic.author,
                topic=updated_topic,
                reason='Topic edited by moderator',
                metadata={
                    'title': updated_topic.title,
                    'content': updated_topic.content[:300]
                }
            )

    def perform_destroy(self, instance):
        if not self.can_manage_topic(self.request.user, instance):
            raise PermissionDenied("You do not have permission to delete this topic")

        if self.request.user != instance.author:
            create_moderation_log(
                moderator=self.request.user,
                action=ModerationLog.ACTION_DELETE_TOPIC,
                target_object=instance,
                target_user=instance.author,
                topic=instance,
                reason='Topic deleted by moderator',
                metadata={
                    'title': instance.title,
                    'content': instance.content[:300]
                }
            )

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
            .prefetch_related('tags', 'moderators')
            .order_by('-created_at')
        )

        page = self.paginate_queryset(topics)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(topics, many=True)
        return Response(serializer.data)