from datetime import timedelta

from django.utils import timezone
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from rest_framework import serializers
from rest_framework.authtoken.models import Token

from .models import User, EmailOTP, Product, LoginLog, ProductUpdateLog


class UserSerializer(serializers.ModelSerializer):
    full_name_english = serializers.SerializerMethodField()
    full_name_chinese = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "first_name_chinese",
            "last_name_chinese",
            "full_name_english",
            "full_name_chinese",
            "role",
            "is_approved",
            "is_active",
            "date_joined",
            "last_login",
        ]
        read_only_fields = ("id", "date_joined", "last_login")
    
    def get_full_name_english(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()
    
    def get_full_name_chinese(self, obj):
        return f"{obj.first_name_chinese} {obj.last_name_chinese}".strip()


class ProductSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description", 
            "price",
            "stock_quantity",
            "category",
            "sku",
            "is_active",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "created_at", "updated_at")
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}".strip()
        return None


class LoginLogSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()
    
    class Meta:
        model = LoginLog
        fields = [
            "id",
            "user",
            "user_name",
            "user_role",
            "login_time",
            "ip_address", 
            "success",
        ]
    
    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username
    
    def get_user_role(self, obj):
        return obj.user.role


class ProductUpdateLogSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    product_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductUpdateLog
        fields = [
            "id",
            "product",
            "product_name",
            "employee",
            "employee_name", 
            "action",
            "changes",
            "timestamp",
        ]
    
    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}".strip() or obj.employee.username
    
    def get_product_name(self, obj):
        return obj.product.name


class RegisterEmployeeSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("username", "email", "password", "first_name", "last_name", "first_name_chinese", "last_name_chinese")

    def create(self, validated_data):
        user = User(
            username=validated_data["username"],
            email=validated_data.get("email"),
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            first_name_chinese=validated_data.get("first_name_chinese", ""),
            last_name_chinese=validated_data.get("last_name_chinese", ""),
            role=User.Roles.EMPLOYEE,
            is_approved=False,
        )
        user.set_password(validated_data["password"])
        user.save()
        return user


class RegisterCustomerSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("username", "email", "password", "first_name", "last_name", "first_name_chinese", "last_name_chinese")

    def create(self, validated_data):
        user = User(
            username=validated_data["username"],
            email=validated_data.get("email"),
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            first_name_chinese=validated_data.get("first_name_chinese", ""),
            last_name_chinese=validated_data.get("last_name_chinese", ""),
            role=User.Roles.CUSTOMER,
            is_approved=True,
            is_active=False,  # Will be activated after OTP verification
        )
        user.set_password(validated_data["password"])
        user.save()

        # Create and email OTP for initial verification
        code = f"{Token.generate_key()[:6].upper()}"  # simple 6-char code
        otp = EmailOTP.objects.create(
            user=user,
            code=code,
            created_at=timezone.now(),
            expires_at=timezone.now() + timedelta(minutes=10),
        )
        send_mail(
            subject="Your SwiSys verification code",
            message=f"Your verification code is: {otp.code}",
            from_email=None,
            recipient_list=[user.email],
            fail_silently=True,
        )
        return user


class VerifyCustomerOTPSerializer(serializers.Serializer):
    username = serializers.CharField()
    code = serializers.CharField(max_length=6)

    def validate(self, attrs):
        username = attrs["username"]
        code = attrs["code"].strip()
        try:
            user = User.objects.get(username=username, role=User.Roles.CUSTOMER)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")
        otp = (
            EmailOTP.objects.filter(user=user, code=code, used=False)
            .order_by("-created_at")
            .first()
        )
        if not otp or not otp.is_valid():
            raise serializers.ValidationError("Invalid or expired code")
        attrs["user"] = user
        attrs["otp"] = otp
        return attrs

    def create(self, validated_data):
        user = validated_data["user"]
        otp = validated_data["otp"]
        
        # Mark OTP as used
        otp.used = True
        otp.save(update_fields=["used"])
        
        # Activate the user account (only needed during signup verification)
        if not user.is_active:
            user.is_active = True
            user.save(update_fields=["is_active"])
        
        token, _ = Token.objects.get_or_create(user=user)
        
        # Log successful login
        LoginLog.objects.create(
            user=user,
            success=True,
        )
        
        return {"token": token.key}


class UnifiedLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")
        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials")

        # Check if employee is approved
        if user.role == User.Roles.EMPLOYEE and not user.is_approved:
            raise serializers.ValidationError("Employee account is pending approval from admin")

        if not user.is_active:
            raise serializers.ValidationError("User account is inactive")

        attrs["user"] = user
        return attrs

    def create(self, validated_data):
        user = validated_data["user"]
        token, _ = Token.objects.get_or_create(user=user)
        
        # Log successful login
        LoginLog.objects.create(
            user=user,
            success=True,
        )
        
        return {
            "success": True,
            "token": token.key, 
            "user": UserSerializer(user).data,
            "user_type": user.role,
            "message": "Login successful"
        }


# Keep the old LoginSerializer for backward compatibility (if needed)
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")
        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials")

        # Customers must login via OTP verification flow
        if user.role == User.Roles.CUSTOMER:
            raise serializers.ValidationError("Customers must verify OTP to obtain a token.")

        if user.role == User.Roles.EMPLOYEE and not user.is_approved:
            raise serializers.ValidationError("Employee is pending approval")

        if not user.is_active:
            raise serializers.ValidationError("User is inactive")

        attrs["user"] = user
        return attrs

    def create(self, validated_data):
        user = validated_data["user"]
        token, _ = Token.objects.get_or_create(user=user)
        
        # Log successful login
        LoginLog.objects.create(
            user=user,
            success=True,
        )
        
        return {"token": token.key, "user": UserSerializer(user).data}


class ApproveEmployeeSerializer(serializers.Serializer):
    employee_id = serializers.IntegerField()
    approved = serializers.BooleanField()
    
    def validate_employee_id(self, value):
        try:
            user = User.objects.get(id=value, role=User.Roles.EMPLOYEE)
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("Employee not found")
    
    def save(self):
        employee_id = self.validated_data['employee_id']
        approved = self.validated_data['approved']
        
        user = User.objects.get(id=employee_id)
        user.is_approved = approved
        user.save()
        
        return user
