from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import Topic, TopicBan, Notification, ModerationLog
from ..serializers import TopicBanSerializer
from ..services.moderation_log import create_moderation_log


User = get_user_model()


class ModeratorPanelViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_topic(self, topic_id):
        return get_object_or_404(Topic, id=topic_id)

    def can_moderate_topic(self, user, topic):
        if not user or not user.is_authenticated:
            return False

        if user.is_superuser or user.is_staff:
            return True

        if topic.author == user:
            return True

        if topic.moderators.filter(id=user.id).exists():
            return True

        return False

    def get_target_user_id(self, request):
        return request.data.get('user') or request.data.get('user_id')

    def get_ban_action(self):
        return getattr(
            ModerationLog,
            'ACTION_BAN_USER',
            getattr(ModerationLog, 'ACTION_BAN', 'ban')
        )

    def get_unban_action(self):
        return getattr(
            ModerationLog,
            'ACTION_UNBAN_USER',
            getattr(ModerationLog, 'ACTION_UNBAN', 'unban')
        )

    def list_bans(self, request, topic_id=None):
        topic = self.get_topic(topic_id)

        if not self.can_moderate_topic(request.user, topic):
            return Response(
                {"detail": "You do not have permission to view bans for this topic"},
                status=status.HTTP_403_FORBIDDEN
            )

        bans = TopicBan.objects.filter(topic=topic).select_related('user')
        serializer = TopicBanSerializer(bans, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def ban(self, request, topic_id=None):
        topic = self.get_topic(topic_id)

        if not self.can_moderate_topic(request.user, topic):
            return Response(
                {"detail": "You do not have permission to ban users in this topic"},
                status=status.HTTP_403_FORBIDDEN
            )

        target_user_id = self.get_target_user_id(request)

        if not target_user_id:
            return Response(
                {"user": "This field is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        target_user = get_object_or_404(User, id=target_user_id)
        reason = request.data.get('reason', '')

        topic_ban, created = TopicBan.objects.get_or_create(
            user=target_user,
            topic=topic,
            defaults={
                'reason': reason
            }
        )

        if not created:
            topic_ban.reason = reason
            topic_ban.save(update_fields=['reason'])

        Notification.objects.create(
            sender=request.user,
            recipient=target_user,
            notification_type='ban'
        )

        create_moderation_log(
            moderator=request.user,
            action=self.get_ban_action(),
            target_object=topic_ban,
            target_user=target_user,
            topic=topic,
            reason=reason,
            metadata={
                'topic_id': topic.id,
                'topic_title': topic.title
            }
        )

        serializer = TopicBanSerializer(topic_ban)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def unban(self, request, topic_id=None):
        topic = self.get_topic(topic_id)

        if not self.can_moderate_topic(request.user, topic):
            return Response(
                {"detail": "You do not have permission to unban users in this topic"},
                status=status.HTTP_403_FORBIDDEN
            )

        target_user_id = self.get_target_user_id(request)

        if not target_user_id:
            return Response(
                {"user": "This field is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        target_user = get_object_or_404(User, id=target_user_id)

        topic_ban = get_object_or_404(
            TopicBan,
            user=target_user,
            topic=topic
        )

        reason = topic_ban.reason

        create_moderation_log(
            moderator=request.user,
            action=self.get_unban_action(),
            target_object=topic,
            target_user=target_user,
            topic=topic,
            reason='User unbanned from topic',
            metadata={
                'topic_id': topic.id,
                'topic_title': topic.title,
                'previous_ban_reason': reason
            }
        )

        topic_ban.delete()

        Notification.objects.create(
            sender=request.user,
            recipient=target_user,
            notification_type='unban'
        )

        return Response(
            {"detail": "User successfully unbanned"},
            status=status.HTTP_200_OK
        )