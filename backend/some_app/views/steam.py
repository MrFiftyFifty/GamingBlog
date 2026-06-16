from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import UserSteamGame
from ..serializers import UserSteamGameSerializer
from ..services.steam import sync_user_steam_games


class SteamSyncView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        result = sync_user_steam_games(request.user)

        return Response({
            "status": "success",
            "message": "Steam games synchronized successfully",
            "synced": result.get("synced", 0)
        })


class MySteamGamesView(ListAPIView):
    serializer_class = UserSteamGameSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            UserSteamGame.objects
            .filter(user=self.request.user)
            .select_related('game')
            .order_by('-playtime_forever')
        )