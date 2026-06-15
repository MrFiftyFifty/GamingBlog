from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current_password = request.data.get("current_password") or request.data.get(
            "currentPassword"
        )
        new_password = request.data.get("new_password") or request.data.get("newPassword")

        if not current_password or not new_password:
            return Response(
                {"detail": "current_password and new_password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not request.user.check_password(current_password):
            return Response(
                {"detail": "Неверный текущий пароль"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        request.user.set_password(new_password)
        request.user.save(update_fields=["password"])

        return Response(status=status.HTTP_204_NO_CONTENT)
