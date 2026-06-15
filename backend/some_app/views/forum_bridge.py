from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Post, Section, Topic
from ..serializers import PostSerializer, TopicSerializer


def _section_topic(section_slug: str, topic_id: int) -> Topic:
    section = get_object_or_404(Section, slug=section_slug)
    topic = get_object_or_404(
        Topic.objects.select_related("section", "author").prefetch_related("tags"),
        pk=topic_id,
        section=section,
    )
    return topic


class SectionTopicDetailView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, slug, pk):
        topic = _section_topic(slug, pk)
        posts = (
            Post.objects.filter(topic=topic)
            .select_related("author", "topic", "topic__author")
            .order_by("created_at")
        )
        topic_data = TopicSerializer(topic, context={"request": request}).data
        topic_data["posts"] = PostSerializer(
            posts, many=True, context={"request": request}
        ).data
        return Response(topic_data)

    def patch(self, request, slug, pk):
        topic = _section_topic(slug, pk)
        if not _can_edit_topic(request.user, topic):
            raise PermissionDenied("You do not have permission to edit this topic")
        serializer = TopicSerializer(
            topic, data=request.data, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, slug, pk):
        topic = _section_topic(slug, pk)
        if not _can_edit_topic(request.user, topic):
            raise PermissionDenied("You do not have permission to delete this topic")
        topic.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SectionTopicRepliesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug, pk):
        topic = _section_topic(slug, pk)
        serializer = PostSerializer(data={**request.data, "topic": topic.id}, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save(author=request.user, topic=topic)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


def _can_edit_topic(user, topic) -> bool:
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser or user.is_staff:
        return True
    if topic.author_id == user.id:
        return True
    return topic.moderators.filter(id=user.id).exists()
