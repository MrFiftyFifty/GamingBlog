from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import UserSteamGame
from ..serializers import UserSteamGameSerializer
from ..services.steam import sync_user_steam_games


class SteamSyncView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        result = sync_user_steam_games(request.user)
        return Response(result)


class MySteamGamesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        games = (
            UserSteamGame.objects
            .filter(user=request.user)
            .select_related('game')
            .order_by('-playtime_forever')
        )

        serializer = UserSteamGameSerializer(games, many=True)
        return Response(serializer.data)