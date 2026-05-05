from django.db.models import Count

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.exceptions import PermissionDenied

from ..models import Post, Notification, TopicBan, ModerationLog
from ..serializers import PostSerializer
from ..services.mentions import create_mention_notifications
from ..services.moderation_log import create_moderation_log
from ..services.reputation import increase_user_reputation, decrease_user_reputation


class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['content', 'author__username']
    ordering_fields = ['created_at', 'likes_count']
    ordering = ['-created_at']

    def get_queryset(self):
        return (
            Post.objects
            .select_related('author', 'topic', 'topic__author')
            .annotate(likes_count=Count('likes'))
        )

    def can_manage_post(self, user, post):
        if not user or not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        if post.author == user:
            return True

        topic = post.topic

        if topic.author == user:
            return True

        if topic.moderators.filter(id=user.id).exists():
            return True

        return False

    def perform_create(self, serializer):
        topic = serializer.validated_data.get('topic')

        if TopicBan.objects.filter(
            user=self.request.user,
            topic=topic
        ).exists():
            raise PermissionDenied("You are banned in this topic")

        post = serializer.save(author=self.request.user)

        if post.topic.author != self.request.user:
            Notification.objects.create(
                sender=self.request.user,
                recipient=post.topic.author,
                notification_type='post',
                post=post
            )

        create_mention_notifications(
            sender=self.request.user,
            text=post.content,
            post=post,
            topic=post.topic
        )

    def perform_update(self, serializer):
        post = serializer.instance

        if not self.can_manage_post(self.request.user, post):
            raise PermissionDenied("You do not have permission to edit this post")

        updated_post = serializer.save()

        if self.request.user != updated_post.author:
            create_moderation_log(
                moderator=self.request.user,
                action=ModerationLog.ACTION_EDIT_POST,
                target_object=updated_post,
                target_user=updated_post.author,
                topic=updated_post.topic,
                reason='Post edited by moderator',
                metadata={
                    'content': updated_post.content[:300]
                }
            )

    def perform_destroy(self, instance):
        if not self.can_manage_post(self.request.user, instance):
            raise PermissionDenied("You do not have permission to delete this post")

        if self.request.user != instance.author:
            create_moderation_log(
                moderator=self.request.user,
                action=ModerationLog.ACTION_DELETE_POST,
                target_object=instance,
                target_user=instance.author,
                topic=instance.topic,
                reason='Post deleted by moderator',
                metadata={
                    'content': instance.content[:300]
                }
            )

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
            increase_user_reputation(post.author)

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

        if post.author != request.user:
            decrease_user_reputation(post.author)

        return Response({
            "status": "unliked",
            "likes_count": post.likes.count()
        })