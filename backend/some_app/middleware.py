from django.utils.timezone import now

from .models import Profile


class OnlineStatusMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            profile, created = Profile.objects.get_or_create(user=request.user)
            profile.is_online = True
            profile.last_seen = now()
            profile.save(update_fields=["is_online", "last_seen"])

        response = self.get_response(request)
        return response