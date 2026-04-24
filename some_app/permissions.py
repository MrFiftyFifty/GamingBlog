from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import Topic, TopicBan


def get_topic(obj):
    if hasattr(obj, 'topic'):
        return obj.topic
    if hasattr(obj, 'post'):
        return obj.post.topic
    return None


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)


class IsOwnerOrAdminOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        if request.user and request.user.is_superuser:
            return True

        return hasattr(obj, 'author') and obj.author == request.user


class IsTopicModeratorOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True

        topic = get_topic(obj)
        if not topic:
            return False

        return topic.moderators.filter(id=request.user.id).exists()


class IsNotBannedInTopic(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        topic_id = (
            request.data.get('topic')
            or request.data.get('topic_id')
        )

        if not topic_id:
            return True

        try:
            topic = Topic.objects.get(id=topic_id)
        except Topic.DoesNotExist:
            return True

        return not TopicBan.objects.filter(
            user=request.user,
            topic=topic
        ).exists()