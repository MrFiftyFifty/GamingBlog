from django.contrib.contenttypes.models import ContentType

from ..models import ModerationLog


def create_moderation_log(
    moderator,
    action,
    target_object=None,
    target_user=None,
    topic=None,
    reason='',
    metadata=None
):
    content_type = None
    object_id = None

    if target_object is not None:
        content_type = ContentType.objects.get_for_model(target_object.__class__)
        object_id = target_object.id

    return ModerationLog.objects.create(
        moderator=moderator,
        action=action,
        target_user=target_user,
        topic=topic,
        content_type=content_type,
        object_id=object_id,
        reason=reason,
        metadata=metadata or {}
    )