from django.db.models import Count

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.exceptions import PermissionDenied

from ..models import Comment, Notification, TopicBan, ModerationLog
from ..serializers import CommentSerializer
from ..services.mentions import create_mention_notifications
from ..services.moderation_log import create_moderation_log


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['content', 'author__username']
    ordering_fields = ['created_at', 'likes_count']
    ordering = ['-created_at']

    def get_queryset(self):
        return (
            Comment.objects
            .filter(parent__isnull=True)
            .select_related('author', 'post', 'post__author', 'post__topic')
            .annotate(likes_count=Count('likes'))
        )

    def get_comment_topic(self, comment):
        if comment.post:
            return comment.post.topic

        if comment.parent and comment.parent.post:
            return comment.parent.post.topic

        return None

    def can_manage_comment(self, user, comment):
        if not user or not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        if comment.author == user:
            return True

        topic = self.get_comment_topic(comment)

        if not topic:
            return False

        if topic.author == user:
            return True

        if topic.moderators.filter(id=user.id).exists():
            return True

        return False

    def perform_create(self, serializer):
        post = serializer.validated_data.get('post')
        parent = serializer.validated_data.get('parent')

        topic = None

        if post:
            topic = post.topic

        if parent and parent.post:
            topic = parent.post.topic

        if topic and TopicBan.objects.filter(user=self.request.user, topic=topic).exists():
            raise PermissionDenied("You are banned in this topic")

        comment = serializer.save(author=self.request.user)

        if comment.post and comment.post.author != self.request.user:
            Notification.objects.create(
                sender=self.request.user,
                recipient=comment.post.author,
                notification_type='comment',
                post=comment.post,
                comment=comment
            )

        create_mention_notifications(
            sender=self.request.user,
            text=comment.content,
            post=comment.post,
            comment=comment,
            topic=topic
        )

    def perform_update(self, serializer):
        comment = serializer.instance

        if not self.can_manage_comment(self.request.user, comment):
            raise PermissionDenied("You do not have permission to edit this comment")

        updated_comment = serializer.save()
        topic = self.get_comment_topic(updated_comment)

        if self.request.user != updated_comment.author:
            create_moderation_log(
                moderator=self.request.user,
                action=ModerationLog.ACTION_EDIT_COMMENT,
                target_object=updated_comment,
                target_user=updated_comment.author,
                topic=topic,
                reason='Comment edited by moderator',
                metadata={
                    'content': updated_comment.content[:300]
                }
            )

    def perform_destroy(self, instance):
        if not self.can_manage_comment(self.request.user, instance):
            raise PermissionDenied("You do not have permission to delete this comment")

        topic = self.get_comment_topic(instance)

        if self.request.user != instance.author:
            create_moderation_log(
                moderator=self.request.user,
                action=ModerationLog.ACTION_DELETE_COMMENT,
                target_object=instance,
                target_user=instance.author,
                topic=topic,
                reason='Comment deleted by moderator',
                metadata={
                    'content': instance.content[:300]
                }
            )

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