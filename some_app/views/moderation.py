from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from ..models import Topic, TopicBan, Notification
from ..serializers import TopicBanSerializer


class ModeratorPanelViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_topic(self):
        topic_id = self.kwargs.get("topic_id")
        return Topic.objects.get(id=topic_id)

    @action(detail=False, methods=["post"])
    def ban(self, request, topic_id=None):
        topic = self.get_topic()
        user_id = request.data.get("user_id")
        reason = request.data.get("reason", "")

        if topic.moderators.filter(id=request.user.id).exists() is False and not request.user.is_superuser:
            return Response({"detail": "not allowed"}, status=403)

        ban, created = TopicBan.objects.get_or_create(
            user_id=user_id,
            topic=topic,
            defaults={"reason": reason}
        )

        if not created:
            ban.reason = reason
            ban.save()

        Notification.objects.create(
            sender=request.user,
            recipient_id=user_id,
            notification_type="ban",
        )

        return Response({
            "status": "banned",
            "user_id": user_id,
            "topic_id": topic.id,
            "reason": reason
        })

    @action(detail=False, methods=["post"])
    def unban(self, request, topic_id=None):
        topic = self.get_topic()
        user_id = request.data.get("user_id")

        TopicBan.objects.filter(
            user_id=user_id,
            topic=topic
        ).delete()

        Notification.objects.create(
            sender=request.user,
            recipient_id=user_id,
            notification_type="unban",
        )

        return Response({
            "status": "unbanned",
            "user_id": user_id
        })

    @action(detail=False, methods=["get"])
    def list_bans(self, request, topic_id=None):
        topic = self.get_topic()

        bans = TopicBan.objects.filter(topic=topic)

        return Response([
            {
                "user_id": b.user_id,
                "reason": b.reason,
                "created_at": b.created_at
            }
            for b in bans
        ])