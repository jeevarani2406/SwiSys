from django.test import TestCase
from django.contrib.auth import get_user_model
from accounts.permissions import IsAdmin, EmployeeProductAccess, IsCustomerReadOnly
from rest_framework.test import APIRequestFactory
from rest_framework.views import APIView
from unittest.mock import Mock

User = get_user_model()


class IsAdminPermissionTest(TestCase):
    """Test IsAdmin permission class."""
    
    def setUp(self):
        """Set up test data."""
        self.factory = APIRequestFactory()
        self.permission = IsAdmin()
        
        self.admin_user = User.objects.create_user(
            username='admin_perm',
            password='admin123',
            role=User.Roles.ADMIN
        )
        
        self.employee_user = User.objects.create_user(
            username='employee_perm',
            password='employee123',
            role=User.Roles.EMPLOYEE,
            is_approved=True
        )
        
        self.customer_user = User.objects.create_user(
            username='customer_perm',
            password='customer123',
            role=User.Roles.CUSTOMER
        )
    
    def test_admin_has_permission(self):
        """Test that admin user has permission."""
        request = self.factory.get('/')
        request.user = self.admin_user
        
        view = Mock()
        
        self.assertTrue(self.permission.has_permission(request, view))
    
    def test_employee_no_permission(self):
        """Test that employee user does not have permission."""
        request = self.factory.get('/')
        request.user = self.employee_user
        
        view = Mock()
        
        self.assertFalse(self.permission.has_permission(request, view))
    
    def test_customer_no_permission(self):
        """Test that customer user does not have permission."""
        request = self.factory.get('/')
        request.user = self.customer_user
        
        view = Mock()
        
        self.assertFalse(self.permission.has_permission(request, view))
    
    def test_anonymous_user_no_permission(self):
        """Test that anonymous user does not have permission."""
        from django.contrib.auth.models import AnonymousUser
        
        request = self.factory.get('/')
        request.user = AnonymousUser()
        
        view = Mock()
        
        self.assertFalse(self.permission.has_permission(request, view))


class EmployeeProductAccessPermissionTest(TestCase):
    """Test EmployeeProductAccess permission class."""
    
    def setUp(self):
        """Set up test data."""
        self.factory = APIRequestFactory()
        self.permission = EmployeeProductAccess()
        
        self.admin_user = User.objects.create_user(
            username='admin_emp',
            password='admin123',
            role=User.Roles.ADMIN
        )
        
        self.employee_user = User.objects.create_user(
            username='employee_emp',
            password='employee123',
            role=User.Roles.EMPLOYEE,
            is_approved=True
        )
        
        self.unapproved_employee = User.objects.create_user(
            username='unapproved_emp',
            password='test123',
            role=User.Roles.EMPLOYEE,
            is_approved=False
        )
        
        self.customer_user = User.objects.create_user(
            username='customer_emp',
            password='customer123',
            role=User.Roles.CUSTOMER
        )
    
    def test_admin_has_permission(self):
        """Test that admin user has permission."""
        request = self.factory.post('/')
        request.user = self.admin_user
        
        view = Mock()
        view.action = 'create'
        
        self.assertTrue(self.permission.has_permission(request, view))
    
    def test_approved_employee_has_permission(self):
        """Test that approved employee has permission."""
        request = self.factory.post('/')
        request.user = self.employee_user
        
        view = Mock()
        view.action = 'create'
        
        self.assertTrue(self.permission.has_permission(request, view))
    
    def test_unapproved_employee_no_permission(self):
        """Test that unapproved employee does not have permission."""
        request = self.factory.post('/')
        request.user = self.unapproved_employee
        
        view = Mock()
        view.action = 'create'
        
        self.assertFalse(self.permission.has_permission(request, view))
    
    def test_customer_no_permission_for_write_operations(self):
        """Test that customer does not have permission for write operations."""
        write_actions = ['create', 'update', 'partial_update', 'destroy']
        
        for action in write_actions:
            with self.subTest(action=action):
                request = self.factory.post('/')
                request.user = self.customer_user
                
                view = Mock()
                view.action = action
                
                self.assertFalse(self.permission.has_permission(request, view))
    
    def test_customer_no_permission_for_read_operations(self):
        """Test that customer does not have permission for read operations in EmployeeProductAccess."""
        read_actions = ['list', 'retrieve']
        
        for action in read_actions:
            with self.subTest(action=action):
                request = self.factory.get('/')
                request.user = self.customer_user
                
                view = Mock()
                view.action = action
                
                self.assertFalse(self.permission.has_permission(request, view))
    
    def test_admin_has_permission_for_all_operations(self):
        """Test that admin has permission for all operations."""
        all_actions = ['list', 'retrieve', 'create', 'update', 'partial_update', 'destroy']
        
        for action in all_actions:
            with self.subTest(action=action):
                request = self.factory.get('/')
                request.user = self.admin_user
                
                view = Mock()
                view.action = action
                
                self.assertTrue(self.permission.has_permission(request, view))


class IsCustomerReadOnlyPermissionTest(TestCase):
    """Test IsCustomerReadOnly permission class."""
    
    def setUp(self):
        """Set up test data."""
        self.factory = APIRequestFactory()
        self.permission = IsCustomerReadOnly()
        
        self.admin_user = User.objects.create_user(
            username='admin_customer',
            password='admin123',
            role=User.Roles.ADMIN
        )
        
        self.employee_user = User.objects.create_user(
            username='employee_customer',
            password='employee123',
            role=User.Roles.EMPLOYEE,
            is_approved=True
        )
        
        self.customer_user = User.objects.create_user(
            username='customer_customer',
            password='customer123',
            role=User.Roles.CUSTOMER
        )
    
    def test_admin_has_permission_for_all_methods(self):
        """Test that admin has permission for all HTTP methods."""
        methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
        
        for method in methods:
            with self.subTest(method=method):
                request = self.factory.generic(method, '/')
                request.user = self.admin_user
                
                view = Mock()
                
                self.assertTrue(self.permission.has_permission(request, view))
    
    def test_employee_has_permission_for_all_methods(self):
        """Test that employee has permission for all HTTP methods."""
        methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
        
        for method in methods:
            with self.subTest(method=method):
                request = self.factory.generic(method, '/')
                request.user = self.employee_user
                
                view = Mock()
                
                self.assertTrue(self.permission.has_permission(request, view))
    
    def test_customer_has_permission_for_read_methods(self):
        """Test that customer has permission for read methods only."""
        read_methods = ['GET', 'HEAD', 'OPTIONS']
        
        for method in read_methods:
            with self.subTest(method=method):
                request = self.factory.generic(method, '/')
                request.user = self.customer_user
                
                view = Mock()
                
                self.assertTrue(self.permission.has_permission(request, view))
    
    def test_customer_no_permission_for_write_methods(self):
        """Test that customer does not have permission for write methods."""
        write_methods = ['POST', 'PUT', 'PATCH', 'DELETE']
        
        for method in write_methods:
            with self.subTest(method=method):
                request = self.factory.generic(method, '/')
                request.user = self.customer_user
                
                view = Mock()
                
                self.assertFalse(self.permission.has_permission(request, view))
    
    def test_anonymous_user_no_permission(self):
        """Test that anonymous user does not have permission."""
        from django.contrib.auth.models import AnonymousUser
        
        request = self.factory.get('/')
        request.user = AnonymousUser()
        
        view = Mock()
        
        self.assertFalse(self.permission.has_permission(request, view))


class PermissionIntegrationTest(TestCase):
    """Test permission classes working together."""
    
    def setUp(self):
        """Set up test data."""
        self.factory = APIRequestFactory()
        
        self.admin_user = User.objects.create_user(
            username='admin_integration',
            password='admin123',
            role=User.Roles.ADMIN
        )
        
        self.employee_user = User.objects.create_user(
            username='employee_integration',
            password='employee123',
            role=User.Roles.EMPLOYEE,
            is_approved=True
        )
        
        self.customer_user = User.objects.create_user(
            username='customer_integration',
            password='customer123',
            role=User.Roles.CUSTOMER
        )
    
    def test_combined_permissions_admin_only_view(self):
        """Test view that requires admin access only."""
        permissions = [IsAdmin()]
        
        # Admin should have access
        request = self.factory.get('/')
        request.user = self.admin_user
        view = Mock()
        
        for permission in permissions:
            self.assertTrue(permission.has_permission(request, view))
        
        # Employee should not have access
        request.user = self.employee_user
        for permission in permissions:
            self.assertFalse(permission.has_permission(request, view))
        
        # Customer should not have access
        request.user = self.customer_user
        for permission in permissions:
            self.assertFalse(permission.has_permission(request, view))
    
    def test_combined_permissions_product_management(self):
        """Test view that uses EmployeeProductAccess and IsCustomerReadOnly."""
        permissions = [EmployeeProductAccess(), IsCustomerReadOnly()]
        
        # Test admin POST (should pass both)
        request = self.factory.post('/')
        request.user = self.admin_user
        view = Mock()
        view.action = 'create'
        
        for permission in permissions:
            self.assertTrue(permission.has_permission(request, view))
        
        # Test employee POST (should pass both)
        request.user = self.employee_user
        for permission in permissions:
            self.assertTrue(permission.has_permission(request, view))
        
        # Test customer POST (should fail both)
        request.user = self.customer_user
        employee_access = EmployeeProductAccess()
        customer_readonly = IsCustomerReadOnly()
        
        self.assertFalse(employee_access.has_permission(request, view))
        self.assertFalse(customer_readonly.has_permission(request, view))
        
        # Test customer GET (EmployeeProductAccess should deny, IsCustomerReadOnly should allow)
        request = self.factory.get('/')
        request.user = self.customer_user
        view.action = 'list'
        
        self.assertFalse(employee_access.has_permission(request, view))  # EmployeeProductAccess denies customers
        self.assertTrue(customer_readonly.has_permission(request, view))  # IsCustomerReadOnly allows read
