from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views.topic import TopicViewSet
from .views.post import PostViewSet
from .views.comment import CommentViewSet
from .views.notification import NotificationViewSet
from .views.moderation import ModeratorPanelViewSet
from .views.upload import UploadViewSet
from .views.profile import ProfileViewSet
from .views.steam import SteamSyncView, MySteamGamesView
from .views.private_message import PrivateMessageViewSet
from .views.section import SectionListCreateView, SectionTopicsView


router = DefaultRouter()
router.register(r'topics', TopicViewSet, basename='topic')
router.register(r'posts', PostViewSet, basename='post')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'upload', UploadViewSet, basename='upload')
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'private-messages', PrivateMessageViewSet, basename='private-message')


moderation = ModeratorPanelViewSet.as_view({
    "post": "ban",
    "delete": "unban",
    "get": "list_bans"
})


urlpatterns = [
    path('', include(router.urls)),

    path('api/forum/sections/', SectionListCreateView.as_view(), name='section-list-create'),
    path('api/forum/sections/<slug:slug>/topics/', SectionTopicsView.as_view(), name='section-topics'),

    path('topics/<int:topic_id>/moderation/', moderation),

    path('steam/sync/', SteamSyncView.as_view(), name='steam-sync'),
    path('steam/games/', MySteamGamesView.as_view(), name='steam-games'),
]