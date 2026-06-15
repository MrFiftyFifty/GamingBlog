from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny, IsAdminUser, SAFE_METHODS

from ..models import Tag
from ..serializers import TagSerializer


class TagViewSet(viewsets.ModelViewSet):
    serializer_class = TagSerializer

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter
    ]

    search_fields = [
        'name',
        'slug'
    ]

    ordering_fields = [
        'name',
        'created_at'
    ]

    ordering = [
        'name'
    ]

    def get_queryset(self):
        return Tag.objects.all().order_by('name')

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]

        return [IsAdminUser()]