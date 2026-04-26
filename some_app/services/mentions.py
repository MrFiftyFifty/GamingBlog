import re

from django.contrib.auth import get_user_model

from ..models import Notification


User = get_user_model()


MENTION_PATTERN = r'(?<!\w)@([\w.@+-]+)'


def extract_usernames_from_text(text):
    if not text:
        return []

    usernames = re.findall(MENTION_PATTERN, text)

    return list(set(usernames))


def create_mention_notifications(sender, text, post=None, comment=None, topic=None):
    usernames = extract_usernames_from_text(text)

    if not usernames:
        return

    mentioned_users = User.objects.filter(username__in=usernames)

    for mentioned_user in mentioned_users:
        if mentioned_user == sender:
            continue

        Notification.objects.create(
            sender=sender,
            recipient=mentioned_user,
            notification_type='mention',
            post=post,
            comment=comment
        )