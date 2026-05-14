from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

from rest_framework import serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


User = get_user_model()


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.strip().lower()


class PasswordResetRequestAPIView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'password_reset'

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']

        user = User.objects.filter(
            email__iexact=email,
            is_active=True
        ).first()

        response_data = {
            "detail": "Если пользователь с таким email существует, инструкция по восстановлению пароля отправлена."
        }

        if not user:
            return Response(response_data, status=status.HTTP_200_OK)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

        subject = "Восстановление пароля"
        message = (
            "Вы запросили восстановление пароля.\n\n"
            f"Перейдите по ссылке, чтобы задать новый пароль:\n{reset_url}\n\n"
            "Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо."
        )

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False
            )
        except Exception as error:
            if settings.DEBUG:
                return Response(
                    {
                        "detail": "Не удалось отправить письмо.",
                        "error": str(error)
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            return Response(
                {
                    "detail": "Не удалось отправить письмо."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        if settings.DEBUG:
            response_data["debug"] = {
                "uid": uid,
                "token": token,
                "reset_url": reset_url
            }

        return Response(response_data, status=status.HTTP_200_OK)


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        new_password = attrs.get('new_password')
        new_password_confirm = attrs.get('new_password_confirm')

        if new_password != new_password_confirm:
            raise serializers.ValidationError({
                "new_password_confirm": "Пароли не совпадают."
            })

        try:
            uid = force_str(urlsafe_base64_decode(attrs.get('uid')))
            user = User.objects.get(pk=uid, is_active=True)
        except Exception:
            raise serializers.ValidationError({
                "uid": "Некорректная ссылка восстановления пароля."
            })

        token_is_valid = default_token_generator.check_token(
            user,
            attrs.get('token')
        )

        if not token_is_valid:
            raise serializers.ValidationError({
                "token": "Ссылка восстановления пароля недействительна или устарела."
            })

        validate_password(new_password, user)

        attrs['user'] = user

        return attrs

    def save(self):
        user = self.validated_data['user']
        new_password = self.validated_data['new_password']

        user.set_password(new_password)
        user.save()

        return user


class PasswordResetConfirmAPIView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'password_reset'

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "detail": "Пароль успешно изменён."
            },
            status=status.HTTP_200_OK
        )