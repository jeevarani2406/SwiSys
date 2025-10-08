from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User, EmailOTP


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ("username", "email", "role", "is_approved", "is_active", "is_staff")
    list_filter = ("role", "is_approved", "is_active", "is_staff")
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Role & Approval", {"fields": ("role", "is_approved")}),
    )
    add_fieldsets = DjangoUserAdmin.add_fieldsets + (
        ("Role & Approval", {"fields": ("role", "is_approved")}),
    )


@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):
    list_display = ("user", "code", "created_at", "expires_at", "used")
    list_filter = ("used", "created_at")
    search_fields = ("user__username", "user__email", "code")