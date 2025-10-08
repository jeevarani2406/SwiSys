from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token

from .models import User


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance: User, created, **kwargs):
    if created:
        # Ensure superusers have admin role
        if instance.is_superuser:
            if instance.role != User.Roles.ADMIN:
                instance.role = User.Roles.ADMIN
                instance.save(update_fields=["role"]) 
        # Employees receive token upon successful login/approval, not at creation
        if instance.role != User.Roles.EMPLOYEE:
            # Employees receive token upon successful login/approval, not at creation
            Token.objects.get_or_create(user=instance)
