from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser

from ..models import BannedWord
from ..serializers import BannedWordSerializer


class BannedWordViewSet(viewsets.ModelViewSet):
    serializer_class = BannedWordSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return BannedWord.objects.all().order_by('word')