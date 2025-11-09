from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "admin")


class IsEmployee(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "employee")


class IsCustomer(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "customer")


class IsAdminOrEmployee(BasePermission):
    """Allow admin full access, employees can create/update products."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ["admin", "employee"]
        )


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.role == "admin")


class IsCustomerReadOnly(BasePermission):
    """Allow customers to only view/download data, no modifications."""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        # Admins and employees have full access
        if request.user.role in ["admin", "employee"]:
            return True
            
        # Customers can only read
        if request.user.role == "customer" and request.method in SAFE_METHODS:
            return True
            
        return False


class EmployeeProductAccess(BasePermission):
    """Employees can edit products that admins added."""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
            
        # Admins have full access
        if request.user.role == "admin":
            return True
            
        # Employees can read and modify products
        if request.user.role == "employee" and request.user.is_approved:
            return True
            
        return False
