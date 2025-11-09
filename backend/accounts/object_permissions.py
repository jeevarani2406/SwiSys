from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsOwnerOrAdmin(BasePermission):
    """Allow owners of an object or admins to read/write; others read-only."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        u = request.user
        if not u or not u.is_authenticated:
            return False
        if getattr(u, 'role', None) == 'admin' or u.is_superuser:
            return True
        # assumes object has `owner` attribute pointing to a User
        return getattr(obj, 'owner_id', None) == getattr(u, 'id', None)


class IsEmployeeForCustomerObjects(BasePermission):
    """Example: employees can manage objects belonging to their assigned customer(s)."""

    def has_object_permission(self, request, view, obj):
        u = request.user
        if not u or not u.is_authenticated:
            return False
        if getattr(u, 'role', None) == 'admin' or u.is_superuser:
            return True
        if getattr(u, 'role', None) != 'employee':
            return False
        # assumes object has `customer` attribute and employees have relation `customers`
        customer = getattr(obj, 'customer', None)
        if customer is None:
            return False
        # if later you add a M2M: EmployeeProfile.customers
        allowed_customers = getattr(u, 'customers', [])
        try:
            return customer in allowed_customers.all()
        except Exception:
            return False
