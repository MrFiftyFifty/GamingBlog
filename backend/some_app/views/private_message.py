from django.db.models import Q

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import PrivateMessage
from ..serializers import PrivateMessageSerializer


class PrivateMessageViewSet(viewsets.ModelViewSet):
    serializer_class = PrivateMessageSerializer
    permission_classes = [IsAuthenticated]
    throttle_scope = 'messages'

    def get_queryset(self):
        return PrivateMessage.objects.filter(
            Q(sender=self.request.user) | Q(recipient=self.request.user)
        ).select_related(
            'sender',
            'recipient'
        ).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    def destroy(self, request, *args, **kwargs):
        message = self.get_object()

        if message.sender != request.user:
            return Response(
                {"detail": "You can delete only your own sent messages."},
                status=status.HTTP_403_FORBIDDEN
            )

        message.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def inbox(self, request):
        messages = PrivateMessage.objects.filter(
            recipient=request.user
        ).select_related(
            'sender',
            'recipient'
        ).order_by('-created_at')

        page = self.paginate_queryset(messages)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def sent(self, request):
        messages = PrivateMessage.objects.filter(
            sender=request.user
        ).select_related(
            'sender',
            'recipient'
        ).order_by('-created_at')

        page = self.paginate_queryset(messages)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def conversation(self, request):
        user_id = request.query_params.get('user_id')

        if not user_id:
            return Response(
                {"detail": "user_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        messages = PrivateMessage.objects.filter(
            Q(sender=request.user, recipient_id=user_id) |
            Q(sender_id=user_id, recipient=request.user)
        ).select_related(
            'sender',
            'recipient'
        ).order_by('created_at')

        unread_messages = messages.filter(
            recipient=request.user,
            is_read=False
        )

        unread_messages.update(is_read=True)

        page = self.paginate_queryset(messages)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        message = self.get_object()

        if message.recipient != request.user:
            return Response(
                {"detail": "You can mark as read only received messages."},
                status=status.HTTP_403_FORBIDDEN
            )

        message.is_read = True
        message.save(update_fields=['is_read'])

        return Response({
            "status": "read"
        })

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = PrivateMessage.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()

        return Response({
            "unread_count": count
        })