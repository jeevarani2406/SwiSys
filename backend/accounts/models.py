from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import uuid


class User(AbstractUser):
    class Roles(models.TextChoices):
        ADMIN = "admin", "Admin"
        EMPLOYEE = "employee", "Employee"
        CUSTOMER = "customer", "Customer"

    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.CUSTOMER)
    # Employees require admin approval before login
    is_approved = models.BooleanField(default=False)
    
    # Chinese name fields
    first_name_chinese = models.CharField(max_length=150, blank=True)
    last_name_chinese = models.CharField(max_length=150, blank=True)

    def can_login(self) -> bool:
        if self.role == self.Roles.EMPLOYEE:
            return self.is_approved and self.is_active
        return self.is_active


class EmailOTP(models.Model):
    """One-time code for email verification (customers on signup/login)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="email_otps")
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)

    def is_valid(self) -> bool:
        return (not self.used) and timezone.now() <= self.expires_at


class Product(models.Model):
    """Product model for the system."""
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.PositiveIntegerField(default=0)
    category = models.CharField(max_length=100)
    sku = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_products')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name


class LoginLog(models.Model):
    """Track user login activity."""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_logs')
    login_time = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    success = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-login_time']
    
    def __str__(self):
        return f"{self.user.username} - {self.login_time}"


class ProductUpdateLog(models.Model):
    """Track product updates by employees."""
    
    class Actions(models.TextChoices):
        CREATE = "create", "Created"
        UPDATE = "update", "Updated"
        DELETE = "delete", "Deleted"
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='update_logs')
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='product_update_logs')
    action = models.CharField(max_length=10, choices=Actions.choices)
    changes = models.JSONField(default=dict)  # Store what fields were changed
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.employee.username} {self.action} {self.product.name}"

# Create your models here.
