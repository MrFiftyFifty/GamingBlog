from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views.topic import TopicViewSet
from .views.post import PostViewSet
from .views.comment import CommentViewSet

router = DefaultRouter()
router.register(r'topics', TopicViewSet, basename='topic')
router.register(r'posts', PostViewSet, basename='post')
router.register(r'comments', CommentViewSet, basename='comment')

urlpatterns = [
    path('', include(router.urls)),
]