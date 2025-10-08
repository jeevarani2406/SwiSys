from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    RegisterEmployeeView,
    RegisterCustomerView,
    VerifyCustomerOTPView,
    ResendCustomerOTPView,
    LoginView,
    UnifiedLoginView,
    MeView,
    approve_employee,
    AdminUserListView,
    AdminEmployeeListView,
    AdminCustomerListView,
    ProductViewSet,
    LoginLogListView,
    ProductUpdateLogListView,
    admin_dashboard_stats,
)
from .health import health_check, ready_check

# Create router for viewsets
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    # Authentication endpoints
    path("register/employee/", RegisterEmployeeView.as_view(), name="register-employee"),
    path("register/customer/", RegisterCustomerView.as_view(), name="register-customer"),
    path("verify/customer/otp/", VerifyCustomerOTPView.as_view(), name="verify-customer-otp"),
    path("resend/customer/otp/", ResendCustomerOTPView.as_view(), name="resend-customer-otp"),
    path("login/", UnifiedLoginView.as_view(), name="unified-login"),  # New unified login
    path("login/legacy/", LoginView.as_view(), name="login"),  # Old login for compatibility
    path("me/", MeView.as_view(), name="me"),
    
    # Admin dashboard endpoints
    path("admin/users/", AdminUserListView.as_view(), name="admin-users"),
    path("admin/employees/", AdminEmployeeListView.as_view(), name="admin-employees"),
    path("admin/customers/", AdminCustomerListView.as_view(), name="admin-customers"),
    path("admin/approve-employee/<int:user_id>/", approve_employee, name="approve-employee"),
    path("admin/login-logs/", LoginLogListView.as_view(), name="admin-login-logs"),
    path("admin/product-logs/", ProductUpdateLogListView.as_view(), name="admin-product-logs"),
    path("admin/dashboard-stats/", admin_dashboard_stats, name="admin-dashboard-stats"),
    
    # Product endpoints (via router)
    path("", include(router.urls)),
    
    # Health checks
    path("health/", health_check, name="health-check"),
    path("ready/", ready_check, name="ready-check"),
]
