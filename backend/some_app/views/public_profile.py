from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Post, Profile, Topic
from ..serializers import ProfileSerializer, TopicSerializer

User = get_user_model()


def get_or_create_profile(user):
    profile, _ = Profile.objects.get_or_create(user=user)
    return profile


class MyProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_or_create_profile(request.user)
        data = ProfileSerializer(profile, context={"request": request}).data
        return Response(data)

    def patch(self, request):
        profile = get_or_create_profile(request.user)
        serializer = ProfileSerializer(
            profile,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class MyProfileAvatarView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get("avatar")
        if not file:
            return Response({"detail": "No avatar file provided"}, status=400)

        profile = get_or_create_profile(request.user)
        profile.avatar = file
        profile.save(update_fields=["avatar"])

        avatar_url = request.build_absolute_uri(profile.avatar.url)
        return Response({"avatarUrl": avatar_url})


class PublicProfileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        profile = get_or_create_profile(user)
        posts_count = Post.objects.filter(author=user).count()

        role = "user"
        if user.is_superuser:
            role = "admin"
        elif user.is_staff:
            role = "moderator"

        profile_data = ProfileSerializer(profile, context={"request": request}).data
        avatar = profile_data.get("avatar")
        if avatar and not str(avatar).startswith("http"):
            avatar = request.build_absolute_uri(avatar)

        joined = user.date_joined.strftime("%d.%m.%Y") if user.date_joined else ""

        return Response(
            {
                "id": str(user.id),
                "username": user.username,
                "email": user.email if request.user == user else None,
                "avatar": avatar,
                "status": profile.status,
                "reputation": profile.reputation,
                "postsCount": posts_count,
                "joinedAt": joined,
                "role": role,
                "ratingLevel": profile.rating_level,
                "isOnline": profile.is_online,
                "steamNickname": profile.steam_nickname,
            }
        )


class UserTopicsListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        topics = (
            Topic.objects.filter(author=user)
            .select_related("section", "author")
            .order_by("-created_at")[:20]
        )
        results = []
        for topic in topics:
            section_slug = topic.section.slug if topic.section else ""
            results.append(
                {
                    "id": str(topic.id),
                    "title": topic.title,
                    "sectionSlug": section_slug,
                    "createdAt": topic.created_at.strftime("%d %b %Y"),
                }
            )
        return Response(results)
