from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.conf import settings

from ..models import Upload
from ..serializers import UploadSerializer


class UploadViewSet(viewsets.ModelViewSet):
    queryset = Upload.objects.all()
    serializer_class = UploadSerializer
    permission_classes = [IsAuthenticated]
    throttle_scope = 'upload'

    def create(self, request, *args, **kwargs):
        file = request.FILES.get('file')

        if not file:
            return Response({"error": "No file provided"}, status=400)

        if file.size > 10 * 1024 * 1024:
            return Response({"error": "Max size is 10MB"}, status=400)

        allowed_types = ['image/jpeg', 'image/png', 'image/gif']

        if file.content_type not in allowed_types:
            return Response({"error": "Invalid file type"}, status=400)

        upload = Upload.objects.create(
            file=file,
            uploaded_by=request.user
        )

        file_url = request.build_absolute_uri(upload.file.url)

        return Response({
            "url": file_url
        }, status=status.HTTP_201_CREATED)