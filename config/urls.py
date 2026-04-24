from django.contrib import admin
from django.urls import path, include

from rest_framework_simplejwt.views import TokenRefreshView
from users.views import MyTokenObtainPairView, RegisterView, ProfileView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('some_app.urls')),
    path('api/token/', MyTokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/profile/', ProfileView.as_view(), name='profile'),
    path('accounts/', include('allauth.urls')),
]