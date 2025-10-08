from rest_framework import generics, status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes, action
from .permissions import IsAdmin, IsCustomerReadOnly, EmployeeProductAccess
from rest_framework.throttling import ScopedRateThrottle
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from .models import EmailOTP, User, Product, LoginLog, ProductUpdateLog
from rest_framework.authtoken.models import Token
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination

from .serializers import (
    RegisterEmployeeSerializer,
    RegisterCustomerSerializer,
    VerifyCustomerOTPSerializer,
    LoginSerializer,
    UnifiedLoginSerializer,
    UserSerializer,
    ProductSerializer,
    LoginLogSerializer,
    ProductUpdateLogSerializer,
    ApproveEmployeeSerializer,
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class RegisterEmployeeView(generics.CreateAPIView):
    serializer_class = RegisterEmployeeSerializer
    permission_classes = [AllowAny]
    throttle_scope = 'register'
    throttle_classes = [ScopedRateThrottle]


class RegisterCustomerView(generics.CreateAPIView):
    serializer_class = RegisterCustomerSerializer
    permission_classes = [AllowAny]
    throttle_scope = 'register'
    throttle_classes = [ScopedRateThrottle]


class VerifyCustomerOTPView(generics.CreateAPIView):
    serializer_class = VerifyCustomerOTPSerializer
    permission_classes = [AllowAny]
    throttle_scope = 'otp'
    throttle_classes = [ScopedRateThrottle]


class ResendCustomerOTPView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    throttle_scope = 'otp'
    throttle_classes = [ScopedRateThrottle]

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        if not username:
            return Response({'detail': 'username is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(username=username, role=User.Roles.CUSTOMER)
        except User.DoesNotExist:
            return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Invalidate previous unused OTPs
        EmailOTP.objects.filter(user=user, used=False, expires_at__gte=timezone.now()).update(used=True)

        # Create a fresh OTP
        code = Token.generate_key()[:6].upper()
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
        return Response({'detail': 'OTP sent'}, status=status.HTTP_200_OK)


class LoginView(generics.CreateAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]
    throttle_scope = 'login'
    throttle_classes = [ScopedRateThrottle]


class UnifiedLoginView(generics.CreateAPIView):
    """Unified login endpoint for all user types with role-based response."""
    serializer_class = UnifiedLoginSerializer
    permission_classes = [AllowAny]
    throttle_scope = 'login'
    throttle_classes = [ScopedRateThrottle]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            result = serializer.save()
            return Response(result, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


# Admin Dashboard Views
class AdminUserListView(generics.ListAPIView):
    """Admin view to list all users with filtering."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(role=role)
        return queryset


class AdminEmployeeListView(generics.ListAPIView):
    """Admin view to list employees with approval status."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        return User.objects.filter(role=User.Roles.EMPLOYEE).order_by('-date_joined')


class AdminCustomerListView(generics.ListAPIView):
    """Admin view to list customers."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        return User.objects.filter(role=User.Roles.CUSTOMER).order_by('-date_joined')


class ProductViewSet(viewsets.ModelViewSet):
    """CRUD operations for products. Admin can do all, employees can create/update, customers can only view."""
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        return Product.objects.all()
    
    def create(self, request, *args, **kwargs):
        # Explicit check for customer role
        if request.user.role == 'customer':
            return Response(
                {"detail": "Customers are not allowed to create products."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        # Explicit check for customer role
        if request.user.role == 'customer':
            return Response(
                {"detail": "Customers are not allowed to update products."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        # Explicit check for customer role
        if request.user.role == 'customer':
            return Response(
                {"detail": "Customers are not allowed to update products."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        return super().partial_update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        # Explicit check for customer role
        if request.user.role == 'customer':
            return Response(
                {"detail": "Customers are not allowed to delete products."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        product = serializer.save(created_by=self.request.user)
        
        # Log the creation
        ProductUpdateLog.objects.create(
            product=product,
            employee=self.request.user,
            action=ProductUpdateLog.Actions.CREATE,
            changes={"created": True}
        )
    
    def perform_update(self, serializer):
        # Track changes
        instance = self.get_object()
        old_data = ProductSerializer(instance).data
        
        product = serializer.save()
        new_data = ProductSerializer(product).data
        
        # Find what changed
        changes = {}
        for field in ['name', 'description', 'price', 'stock_quantity', 'category', 'is_active']:
            if old_data.get(field) != new_data.get(field):
                changes[field] = {
                    'old': old_data.get(field),
                    'new': new_data.get(field)
                }
        
        # Log the update
        if changes:
            ProductUpdateLog.objects.create(
                product=product,
                employee=self.request.user,
                action=ProductUpdateLog.Actions.UPDATE,
                changes=changes
            )
    
    def perform_destroy(self, instance):
        # Log the deletion
        ProductUpdateLog.objects.create(
            product=instance,
            employee=self.request.user,
            action=ProductUpdateLog.Actions.DELETE,
            changes={"deleted": True}
        )
        instance.delete()


class LoginLogListView(generics.ListAPIView):
    """Admin view to see all login logs."""
    serializer_class = LoginLogSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = LoginLog.objects.all()
        user_id = self.request.query_params.get('user_id', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset


class ProductUpdateLogListView(generics.ListAPIView):
    """Admin view to see all product update logs."""
    serializer_class = ProductUpdateLogSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = ProductUpdateLog.objects.all()
        employee_id = self.request.query_params.get('employee_id', None)
        product_id = self.request.query_params.get('product_id', None)
        
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        if product_id:
            queryset = queryset.filter(product_id=product_id)
            
        return queryset


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdmin])
def approve_employee(request, user_id: int):
    """Admin endpoint to approve/disapprove employees."""
    user = get_object_or_404(User, pk=user_id, role=User.Roles.EMPLOYEE)
    
    serializer = ApproveEmployeeSerializer(data={
        'employee_id': user_id,
        'approved': request.data.get('approved', True)
    })
    
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            "status": "updated", 
            "user": UserSerializer(user).data
        })
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_dashboard_stats(request):
    """Get dashboard statistics for admin."""
    from django.db.models import Count
    from datetime import datetime, timedelta
    
    # Get basic counts
    total_users = User.objects.count()
    total_employees = User.objects.filter(role=User.Roles.EMPLOYEE).count()
    total_customers = User.objects.filter(role=User.Roles.CUSTOMER).count()
    pending_employees = User.objects.filter(role=User.Roles.EMPLOYEE, is_approved=False).count()
    total_products = Product.objects.count()
    active_products = Product.objects.filter(is_active=True).count()
    
    # Get recent activity (last 7 days)
    week_ago = timezone.now() - timedelta(days=7)
    recent_logins = LoginLog.objects.filter(login_time__gte=week_ago).count()
    recent_registrations = User.objects.filter(date_joined__gte=week_ago).count()
    recent_product_updates = ProductUpdateLog.objects.filter(timestamp__gte=week_ago).count()
    
    return Response({
        "stats": {
            "total_users": total_users,
            "total_employees": total_employees,
            "total_customers": total_customers,
            "pending_employees": pending_employees,
            "total_products": total_products,
            "active_products": active_products,
            "recent_logins": recent_logins,
            "recent_registrations": recent_registrations,
            "recent_product_updates": recent_product_updates,
        }
    })