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
from .views.forum_bridge import SectionTopicDetailView, SectionTopicRepliesView
from .views.user_lookup import UserSearchView, UserByUsernameView
from .views.public_profile import (
    MyProfileView,
    MyProfileAvatarView,
    PublicProfileView,
    UserTopicsListView,
)
from .views.content_report import ContentReportViewSet
from .views.banned_word import BannedWordViewSet
from .views.tag import TagViewSet
from .views.moderation_log import ModerationLogViewSet


router = DefaultRouter()
router.register(r'topics', TopicViewSet, basename='topic')
router.register(r'posts', PostViewSet, basename='post')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'upload', UploadViewSet, basename='upload')
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'private-messages', PrivateMessageViewSet, basename='private-message')
router.register(r'reports', ContentReportViewSet, basename='report')
router.register(r'banned-words', BannedWordViewSet, basename='banned-word')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'moderation-logs', ModerationLogViewSet, basename='moderation-log')


moderation = ModeratorPanelViewSet.as_view({
    "post": "ban",
    "delete": "unban",
    "get": "list_bans"
})


urlpatterns = [
    path('profiles/me/', MyProfileView.as_view(), name='profile-me'),
    path('profiles/me/avatar/', MyProfileAvatarView.as_view(), name='profile-me-avatar'),

    path('users/search/', UserSearchView.as_view(), name='user-search'),
    path('users/<str:username>/profile/', PublicProfileView.as_view(), name='user-public-profile'),
    path('users/<str:username>/topics/', UserTopicsListView.as_view(), name='user-topics'),
    path('users/<str:username>/', UserByUsernameView.as_view(), name='user-by-username'),

    path('', include(router.urls)),

    path('forum/sections/', SectionListCreateView.as_view(), name='section-list-create'),
    path('forum/sections/<slug:slug>/topics/', SectionTopicsView.as_view(), name='section-topics'),
    path('forum/sections/<slug:slug>/topics/<int:pk>/', SectionTopicDetailView.as_view(), name='section-topic-detail'),
    path('forum/sections/<slug:slug>/topics/<int:pk>/replies/', SectionTopicRepliesView.as_view(), name='section-topic-replies'),

    path('topics/<int:topic_id>/moderation/', moderation),

    path('steam/sync/', SteamSyncView.as_view(), name='steam-sync'),
    path('steam/games/', MySteamGamesView.as_view(), name='steam-games'),
]