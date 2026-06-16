from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

User = get_user_model()


class UserSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get("q", "").strip()
        if not query:
            return Response([])

        users = User.objects.filter(username__icontains=query).order_by("username")[:20]
        return Response(
            [
                {
                    "id": user.id,
                    "username": user.username,
                    "avatar": user.avatar.url if user.avatar else None,
                }
                for user in users
            ]
        )


class UserByUsernameView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "avatar": user.avatar.url if user.avatar else None,
            }
        )
