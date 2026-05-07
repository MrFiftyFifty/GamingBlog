from allauth.socialaccount.models import SocialAccount

from rest_framework import generics, serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


class SocialAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialAccount
        fields = [
            'id',
            'provider',
            'uid',
            'last_login',
            'date_joined',
            'extra_data'
        ]
        read_only_fields = [
            'id',
            'provider',
            'uid',
            'last_login',
            'date_joined',
            'extra_data'
        ]


class SocialAccountListAPIView(generics.ListAPIView):
    serializer_class = SocialAccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SocialAccount.objects.filter(
            user=self.request.user
        ).order_by('provider')


class SocialAccountDisconnectAPIView(generics.DestroyAPIView):
    serializer_class = SocialAccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SocialAccount.objects.filter(
            user=self.request.user
        )

    def destroy(self, request, *args, **kwargs):
        social_account = self.get_object()

        user_social_accounts_count = SocialAccount.objects.filter(
            user=request.user
        ).count()

        user_has_password = request.user.has_usable_password()

        if user_social_accounts_count <= 1 and not user_has_password:
            return Response(
                {
                    "detail": "Нельзя отвязать последний социальный аккаунт, пока у пользователя не установлен обычный пароль."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        provider = social_account.provider
        social_account.delete()

        if provider == 'steam':
            remaining_steam_accounts = SocialAccount.objects.filter(
                user=request.user,
                provider='steam'
            ).exists()

            if not remaining_steam_accounts and hasattr(request.user, 'profile'):
                profile = request.user.profile
                profile.steam_id = ''
                profile.steam_nickname = ''
                profile.steam_avatar = ''
                profile.save(
                    update_fields=[
                        'steam_id',
                        'steam_nickname',
                        'steam_avatar'
                    ]
                )

        return Response(
            {
                "detail": "Социальный аккаунт успешно отвязан."
            },
            status=status.HTTP_200_OK
        )