from django.contrib import admin
from django.urls import path, include
from users.password_reset import (
    PasswordResetRequestAPIView,
    PasswordResetConfirmAPIView,
)
from users.password_change import ChangePasswordView

from django.conf import settings
from django.conf.urls.static import static

from rest_framework_simplejwt.views import TokenRefreshView
from users.views import MyTokenObtainPairView, RegisterView, ProfileView

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

from users.social_accounts import (
    SocialAccountListAPIView,
    SocialAccountDisconnectAPIView,
)


urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/profile/', ProfileView.as_view(), name='profile'),
    path('api/password-reset/', PasswordResetRequestAPIView.as_view(), name='password-reset'),
    path('api/password-reset-confirm/', PasswordResetConfirmAPIView.as_view(), name='password-reset-confirm'),
    path('api/auth/forgot-password/', PasswordResetRequestAPIView.as_view(), name='auth-forgot-password'),
    path('api/auth/reset-password/', PasswordResetConfirmAPIView.as_view(), name='auth-reset-password'),
    path('api/auth/change-password/', ChangePasswordView.as_view(), name='auth-change-password'),

    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    path('accounts/', include('allauth.urls')),
    path('api/social-accounts/', SocialAccountListAPIView.as_view(), name='social-accounts'),
    path('api/social-accounts/<int:pk>/', SocialAccountDisconnectAPIView.as_view(), name='social-account-disconnect'),

    path('api/', include('some_app.urls')),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)