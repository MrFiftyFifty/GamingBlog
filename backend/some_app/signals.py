from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

from allauth.account.signals import user_logged_in
from allauth.socialaccount.models import SocialAccount

from .models import Profile
from .utils.steam import get_steam_profile


User = get_user_model()


@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.get_or_create(user=instance)


@receiver(user_logged_in)
def update_steam_profile_on_login(request, user, **kwargs):
    steam_account = SocialAccount.objects.filter(
        user=user,
        provider='steam'
    ).first()

    if not steam_account:
        return

    profile, _ = Profile.objects.get_or_create(user=user)

    steam_id = steam_account.uid
    profile.steam_id = steam_id

    steam_data = get_steam_profile(steam_id)

    if steam_data:
        profile.steam_nickname = steam_data.get("nickname", "")
        profile.steam_avatar = steam_data.get("avatar", "")

    profile.save()