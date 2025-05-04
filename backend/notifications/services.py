from .models import Notification
from .utils import send_notification_email

def notify_user(user, notif_type, content, send_email=True, email_subject=None):
    Notification.objects.create(
        user=user,
        type=notif_type,
        content=content
    )
    if send_email:
        send_notification_email(
            user,
            email_subject or f"{notif_type.capitalize()} Notification",
            content
        )
