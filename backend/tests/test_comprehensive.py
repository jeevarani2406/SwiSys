from django.utils import timezone
from datetime import timedelta
from django.test import TestCase
from django.contrib.auth import authenticate
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from accounts.models import User, Product, LoginLog, ProductUpdateLog, EmailOTP
from accounts.permissions import IsAdmin, EmployeeProductAccess, IsCustomerReadOnly
from unittest.mock import Mock
import json


class UserModelTest(TestCase):
    """Test User model functionality including bilingual names and roles."""
    
    def setUp(self):
        self.admin_user = User.objects.create_user(
            username='admin_test',
            password='admin123',
            email='admin@test.com',
            first_name='Admin',
            last_name='User',
            first_name_chinese='管理员',
            last_name_chinese='用户',
            role=User.Roles.ADMIN
        )
        
        self.employee = User.objects.create_user(
            username='employee_test',
            password='employee123',
            email='employee@test.com',
            first_name='John',
            last_name='Employee',
            first_name_chinese='约翰',
            last_name_chinese='员工',
            role=User.Roles.EMPLOYEE,
            is_approved=True
        )
        
        self.customer = User.objects.create_user(
            username='customer_test',
            password='customer123',
            email='customer@test.com',
            first_name='Jane',
            last_name='Customer',
            first_name_chinese='简',
            last_name_chinese='客户',
            role=User.Roles.CUSTOMER
        )
    
    def test_user_roles(self):
        """Test that user roles are correctly assigned."""
        self.assertEqual(self.admin_user.role, User.Roles.ADMIN)
        self.assertEqual(self.employee.role, User.Roles.EMPLOYEE)
        self.assertEqual(self.customer.role, User.Roles.CUSTOMER)
    
    def test_bilingual_names(self):
        """Test bilingual name support."""
        self.assertEqual(self.admin_user.first_name_chinese, '管理员')
        self.assertEqual(self.employee.first_name_chinese, '约翰')
        self.assertEqual(self.customer.first_name_chinese, '简')
    
    def test_can_login_method(self):
        """Test can_login method for different user types."""
        # Admin can always login if active
        self.assertTrue(self.admin_user.can_login())
        
        # Employee can login only if approved and active
        self.assertTrue(self.employee.can_login())
        
        # Unapproved employee cannot login
        unapproved_employee = User.objects.create_user(
            username='unapproved',
            password='test123',
            role=User.Roles.EMPLOYEE,
            is_approved=False
        )
        self.assertFalse(unapproved_employee.can_login())
        
        # Customer can login if active
        self.assertTrue(self.customer.can_login())
    
    def test_authentication(self):
        """Test user authentication."""
        # Test successful authentication
        user = authenticate(username='admin_test', password='admin123')
        self.assertIsNotNone(user)
        self.assertEqual(user.username, 'admin_test')
        
        # Test failed authentication
        user = authenticate(username='admin_test', password='wrongpassword')
        self.assertIsNone(user)


class PermissionsTest(TestCase):
    """Test role-based permissions."""
    
    def setUp(self):
        self.admin_user = User.objects.create_user(
            username='admin_perm',
            password='admin123',
            role=User.Roles.ADMIN
        )
        
        self.employee = User.objects.create_user(
            username='employee_perm',
            password='employee123',
            role=User.Roles.EMPLOYEE,
            is_approved=True
        )
        
        self.customer = User.objects.create_user(
            username='customer_perm',
            password='customer123',
            role=User.Roles.CUSTOMER
        )
        
        self.unapproved_employee = User.objects.create_user(
            username='unapproved_emp',
            password='employee123',
            role=User.Roles.EMPLOYEE,
            is_approved=False
        )
    
    def test_admin_permissions(self):
        """Test admin permissions."""
        request = Mock()
        request.user = self.admin_user
        request.method = 'POST'
        
        admin_permission = IsAdmin()
        self.assertTrue(admin_permission.has_permission(request, None))
    
    def test_employee_product_access(self):
        """Test employee product access permissions."""
        request = Mock()
        request.user = self.employee
        request.method = 'POST'
        
        emp_permission = EmployeeProductAccess()
        self.assertTrue(emp_permission.has_permission(request, None))
        
        # Test unapproved employee
        request.user = self.unapproved_employee
        self.assertFalse(emp_permission.has_permission(request, None))
    
    def test_customer_read_only_access(self):
        """Test customer read-only permissions."""
        request = Mock()
        request.user = self.customer
        
        customer_permission = IsCustomerReadOnly()
        
        # Customer can read
        request.method = 'GET'
        self.assertTrue(customer_permission.has_permission(request, None))
        
        # Customer cannot modify
        request.method = 'POST'
        self.assertFalse(customer_permission.has_permission(request, None))


class UnifiedLoginAPITest(APITestCase):
    """Test the unified login API endpoint."""
    
    def setUp(self):
        self.client = APIClient()
        
        self.admin_user = User.objects.create_user(
            username='admin_api',
            password='admin123',
            email='admin@api.com',
            role=User.Roles.ADMIN
        )
        
        self.employee = User.objects.create_user(
            username='employee_api',
            password='employee123',
            email='employee@api.com',
            role=User.Roles.EMPLOYEE,
            is_approved=True
        )
        
        self.customer = User.objects.create_user(
            username='customer_api',
            password='customer123',
            email='customer@api.com',
            role=User.Roles.CUSTOMER
        )
        
        self.unapproved_employee = User.objects.create_user(
            username='unapproved_api',
            password='employee123',
            email='unapproved@api.com',
            role=User.Roles.EMPLOYEE,
            is_approved=False
        )
    
    def test_admin_login(self):
        """Test admin login via unified API."""
        url = reverse('unified-login')
        data = {
            'username': 'admin_api',
            'password': 'admin123'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['user_type'], 'admin')
        self.assertIn('token', response.data)
        self.assertEqual(response.data['message'], 'Login successful')
    
    def test_employee_login(self):
        """Test approved employee login."""
        url = reverse('unified-login')
        data = {
            'username': 'employee_api',
            'password': 'employee123'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['user_type'], 'employee')
        self.assertIn('token', response.data)
    
    def test_customer_login(self):
        """Test customer login."""
        url = reverse('unified-login')
        data = {
            'username': 'customer_api',
            'password': 'customer123'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['user_type'], 'customer')
        self.assertIn('token', response.data)
    
    def test_unapproved_employee_login(self):
        """Test that unapproved employees cannot login."""
        url = reverse('unified-login')
        data = {
            'username': 'unapproved_api',
            'password': 'employee123'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('pending approval', str(response.data))
    
    def test_invalid_credentials(self):
        """Test login with invalid credentials."""
        url = reverse('unified-login')
        data = {
            'username': 'nonexistent',
            'password': 'wrongpassword'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Invalid credentials', str(response.data))
    
    def test_login_creates_log(self):
        """Test that successful login creates a log entry."""
        initial_logs = LoginLog.objects.count()
        
        url = reverse('unified-login')
        data = {
            'username': 'admin_api',
            'password': 'admin123'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(LoginLog.objects.count(), initial_logs + 1)
        
        # Check the log entry
        log = LoginLog.objects.latest('login_time')
        self.assertEqual(log.user.username, 'admin_api')
        self.assertTrue(log.success)


class ProductManagementAPITest(APITestCase):
    """Test product management with role-based access."""
    
    def setUp(self):
        self.client = APIClient()
        
        self.admin_user = User.objects.create_user(
            username='admin_prod',
            password='admin123',
            role=User.Roles.ADMIN
        )
        
        self.employee = User.objects.create_user(
            username='employee_prod',
            password='employee123',
            role=User.Roles.EMPLOYEE,
            is_approved=True
        )
        
        self.customer = User.objects.create_user(
            username='customer_prod',
            password='customer123',
            role=User.Roles.CUSTOMER
        )
        
        self.product = Product.objects.create(
            name='Test Product',
            description='Test Description',
            price='99.99',
            stock_quantity=10,
            category='Test Category',
            sku='TEST001',
            created_by=self.admin_user
        )
    
    def test_admin_can_access_products(self):
        """Test that admin can access and modify products."""
        self.client.force_authenticate(user=self.admin_user)
        
        # Test GET
        url = reverse('product-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Test POST
        data = {
            'name': 'New Product',
            'price': '149.99',
            'stock_quantity': 5,
            'category': 'New Category',
            'sku': 'NEW001'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_employee_can_access_products(self):
        """Test that approved employees can access and modify products."""
        self.client.force_authenticate(user=self.employee)
        
        # Test GET
        url = reverse('product-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Test POST
        data = {
            'name': 'Employee Product',
            'price': '199.99',
            'stock_quantity': 3,
            'category': 'Employee Category',
            'sku': 'EMP001'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_customer_read_only_access(self):
        """Test that customers can only read products."""
        self.client.force_authenticate(user=self.customer)
        
        # Test GET (should work)
        url = reverse('product-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Test POST (should be forbidden)
        data = {
            'name': 'Customer Product',
            'price': '299.99',
            'stock_quantity': 1,
            'category': 'Customer Category',
            'sku': 'CUST001'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Test PUT (should be forbidden)
        url = reverse('product-detail', kwargs={'pk': self.product.pk})
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Test DELETE (should be forbidden)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_product_creation_logging(self):
        """Test that product creation is logged."""
        self.client.force_authenticate(user=self.admin_user)
        
        initial_logs = ProductUpdateLog.objects.count()
        
        url = reverse('product-list')
        data = {
            'name': 'Logged Product',
            'price': '399.99',
            'stock_quantity': 7,
            'category': 'Logged Category',
            'sku': 'LOG001'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ProductUpdateLog.objects.count(), initial_logs + 1)
        
        # Check the log entry
        log = ProductUpdateLog.objects.latest('timestamp')
        self.assertEqual(log.employee, self.admin_user)
        self.assertEqual(log.action, ProductUpdateLog.Actions.CREATE)


class CustomerRegistrationTest(APITestCase):
    """Test customer registration with OTP."""
    
    def setUp(self):
        self.client = APIClient()
    
    def test_customer_registration(self):
        """Test customer registration creates inactive user and sends OTP."""
        url = reverse('register-customer')
        data = {
            'username': 'newcustomer',
            'email': 'newcustomer@test.com',
            'password': 'newpass123',
            'first_name': 'New',
            'last_name': 'Customer',
            'first_name_chinese': '新',
            'last_name_chinese': '客户'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check user was created
        user = User.objects.get(username='newcustomer')
        self.assertEqual(user.role, User.Roles.CUSTOMER)
        self.assertFalse(user.is_active)  # Should be inactive until OTP verification
        
        # Check OTP was created
        otp = EmailOTP.objects.filter(user=user).first()
        self.assertIsNotNone(otp)
        self.assertFalse(otp.used)
    
    def test_otp_verification(self):
        """Test OTP verification activates customer account."""
        # First register a customer
        user = User.objects.create_user(
            username='otptest',
            password='test123',
            email='otp@test.com',
            role=User.Roles.CUSTOMER,
            is_active=False
        )
        
        # Create OTP
        otp = EmailOTP.objects.create(
            user=user,
            code='123456',
            created_at=timezone.now(),
            expires_at=timezone.now() + timedelta(minutes=10)
        )
        
        # Verify OTP
        url = reverse('verify-customer-otp')
        data = {
            'username': 'otptest',
            'code': '123456'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        
        # Check user is now active
        user.refresh_from_db()
        self.assertTrue(user.is_active)
        
        # Check OTP is marked as used
        otp.refresh_from_db()
        self.assertTrue(otp.used)


class AdminDashboardTest(APITestCase):
    """Test admin dashboard functionality."""
    
    def setUp(self):
        self.client = APIClient()
        
        self.admin_user = User.objects.create_user(
            username='admin_dash',
            password='admin123',
            role=User.Roles.ADMIN
        )
        
        self.employee = User.objects.create_user(
            username='employee_dash',
            password='employee123',
            role=User.Roles.EMPLOYEE,
            is_approved=False
        )
        
        self.customer = User.objects.create_user(
            username='customer_dash',
            password='customer123',
            role=User.Roles.CUSTOMER
        )
    
    def test_admin_dashboard_stats(self):
        """Test admin dashboard statistics endpoint."""
        self.client.force_authenticate(user=self.admin_user)
        
        url = reverse('admin-dashboard-stats')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('stats', response.data)
        
        stats = response.data['stats']
        self.assertIn('total_users', stats)
        self.assertIn('total_employees', stats)
        self.assertIn('total_customers', stats)
        self.assertIn('pending_employees', stats)
    
    def test_employee_approval(self):
        """Test employee approval functionality."""
        self.client.force_authenticate(user=self.admin_user)
        
        # Check employee is not approved initially
        self.assertFalse(self.employee.is_approved)
        
        # Approve employee
        url = reverse('approve-employee', kwargs={'user_id': self.employee.id})
        data = {'approved': True}
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check employee is now approved
        self.employee.refresh_from_db()
        self.assertTrue(self.employee.is_approved)
    
    def test_non_admin_cannot_access_dashboard(self):
        """Test that non-admin users cannot access admin endpoints."""
        self.client.force_authenticate(user=self.customer)
        
        url = reverse('admin-dashboard-stats')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


