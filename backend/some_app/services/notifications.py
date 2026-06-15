from django.core.mail import send_mail


def send_notification_email(user, message):
    if not user.email:
        return

    send_mail(
        subject="Новое уведомление",
        message=message,
        from_email=None,
        recipient_list=[user.email],
        fail_silently=True,
    )