from django.db.models import F

from ..models import Profile


def change_user_reputation(user, amount):
    if not user:
        return

    profile, created = Profile.objects.get_or_create(user=user)

    Profile.objects.filter(id=profile.id).update(
        reputation=F('reputation') + amount
    )


def increase_user_reputation(user, amount=1):
    change_user_reputation(user, amount)


def decrease_user_reputation(user, amount=1):
    change_user_reputation(user, -amount)