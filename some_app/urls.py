from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views.topic import TopicViewSet
from .views.post import PostViewSet
from .views.comment import CommentViewSet
from .views.notification import NotificationViewSet
from .views.moderation import ModeratorPanelViewSet
from .views.upload import UploadViewSet

router = DefaultRouter()
router.register(r'topics', TopicViewSet, basename='topic')
router.register(r'posts', PostViewSet, basename='post')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'upload', UploadViewSet, basename='upload')

moderation = ModeratorPanelViewSet.as_view({
    "post": "ban",
    "delete": "unban",
    "get": "list_bans"
})

urlpatterns = [
    path('', include(router.urls)),
    path("topics/<int:topic_id>/moderation/", moderation),
]