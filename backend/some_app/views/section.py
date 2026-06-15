from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import NotFound

from ..models import Section, Topic
from ..serializers import SectionSerializer, TopicSerializer


class SectionListCreateView(ListCreateAPIView):
    serializer_class = SectionSerializer

    def get_queryset(self):
        return Section.objects.all().order_by('title')

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]

        return [AllowAny()]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class SectionTopicsView(ListCreateAPIView):
    serializer_class = TopicSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_queryset(self):
        slug = self.kwargs.get('slug')

        try:
            section = Section.objects.get(slug=slug)
        except Section.DoesNotExist:
            raise NotFound("Section not found")

        return (
            Topic.objects
            .filter(section=section)
            .select_related('section', 'author')
            .order_by('-is_pinned', '-created_at')
        )

    def perform_create(self, serializer):
        slug = self.kwargs.get('slug')
        section = Section.objects.get(slug=slug)
        serializer.save(author=self.request.user, section=section)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        slug = self.kwargs.get('slug')
        if slug:
            context['section_slug'] = slug
        return context