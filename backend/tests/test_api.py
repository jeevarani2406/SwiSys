from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from accounts.models import Product, LoginLog
from django.urls import reverse
from django.test.client import Client
import json

User = get_user_model()


class UnifiedLoginAPITest(APITestCase):
    """Test unified login API functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.login_url = reverse('unified-login')
        
        # Create test users
        self.admin_user = User.objects.create_user(
            username='admin_api',
            password='admin123',
            email='admin@api.com',
            role=User.Roles.ADMIN
        )
        
        self.employee_user = User.objects.create_user(
            username='employee_api',
            password='employee123',
            email='employee@api.com',
            role=User.Roles.EMPLOYEE,
            is_approved=True
        )
        
        self.customer_user = User.objects.create_user(
            username='customer_api',
            password='customer123',
            email='customer@api.com',
            role=User.Roles.CUSTOMER
        )
        
        self.unapproved_employee = User.objects.create_user(
            username='unapproved_api',
            password='test123',
            email='unapproved@api.com',
            role=User.Roles.EMPLOYEE,
            is_approved=False
        )
    
    def test_admin_login_success(self):
        """Test successful admin login."""
        data = {
            'username': 'admin_api',
            'password': 'admin123'
        }
        
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user_type'], 'admin')
        self.assertEqual(response.data['user']['username'], 'admin_api')
    
    def test_employee_login_success(self):
        """Test successful employee login."""
        data = {
            'username': 'employee_api',
            'password': 'employee123'
        }
        
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user_type'], 'employee')
        self.assertEqual(response.data['user']['username'], 'employee_api')
    
    def test_customer_login_success(self):
        """Test successful customer login."""
        data = {
            'username': 'customer_api',
            'password': 'customer123'
        }
        
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user_type'], 'customer')
        self.assertEqual(response.data['user']['username'], 'customer_api')
    
    def test_invalid_credentials(self):
        """Test login with invalid credentials."""
        data = {
            'username': 'nonexistent',
            'password': 'wrongpassword'
        }
        
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)
    
    def test_unapproved_employee_login_fails(self):
        """Test that unapproved employees cannot login."""
        data = {
            'username': 'unapproved_api',
            'password': 'test123'
        }
        
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)
    
    def test_missing_username(self):
        """Test login with missing username."""
        data = {
            'password': 'test123'
        }
        
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)
    
    def test_missing_password(self):
        """Test login with missing password."""
        data = {
            'username': 'admin_api'
        }
        
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)
    
    def test_login_creates_log(self):
        """Test that successful login creates a login log."""
        data = {
            'username': 'admin_api',
            'password': 'admin123'
        }
        
        # Count logs before login
        initial_count = LoginLog.objects.count()
        
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check that a new log was created
        final_count = LoginLog.objects.count()
        self.assertEqual(final_count, initial_count + 1)
        
        # Check log details
        log = LoginLog.objects.latest('login_time')
        self.assertEqual(log.user, self.admin_user)
        self.assertTrue(log.success)


class ProductAPITest(APITestCase):
    """Test Product API endpoints with role-based access."""
    
    def setUp(self):
        """Set up test data."""
        # Create users
        self.admin_user = User.objects.create_user(
            username='admin_product',
            password='admin123',
            role=User.Roles.ADMIN
        )
        
        self.employee_user = User.objects.create_user(
            username='employee_product',
            password='employee123',
            role=User.Roles.EMPLOYEE,
            is_approved=True
        )
        
        self.customer_user = User.objects.create_user(
            username='customer_product',
            password='customer123',
            role=User.Roles.CUSTOMER
        )
        
        # Create test product
        self.product = Product.objects.create(
            name='API Test Product',
            description='Test Description',
            price='99.99',
            stock_quantity=10,
            category='Test Category',
            sku='API001',
            created_by=self.admin_user
        )
        
        self.product_url = reverse('product-list')
        self.product_detail_url = reverse('product-detail', kwargs={'pk': self.product.pk})
    
    def test_admin_can_create_product(self):
        """Test that admin can create products."""
        self.client.force_authenticate(user=self.admin_user)
        
        data = {
            'name': 'New Product',
            'description': 'New Description',
            'price': '199.99',
            'stock_quantity': 5,
            'category': 'New Category',
            'sku': 'NEW001'
        }
        
        response = self.client.post(self.product_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'New Product')
        self.assertEqual(response.data['created_by'], self.admin_user.id)
    
    def test_employee_can_create_product(self):
        """Test that employee can create products."""
        self.client.force_authenticate(user=self.employee_user)
        
        data = {
            'name': 'Employee Product',
            'description': 'Employee Description',
            'price': '149.99',
            'stock_quantity': 8,
            'category': 'Employee Category',
            'sku': 'EMP001'
        }
        
        response = self.client.post(self.product_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Employee Product')
    
    def test_customer_cannot_create_product(self):
        """Test that customer cannot create products."""
        self.client.force_authenticate(user=self.customer_user)
        
        data = {
            'name': 'Customer Product',
            'description': 'Should fail',
            'price': '99.99',
            'stock_quantity': 1,
            'category': 'Fail Category',
            'sku': 'FAIL001'
        }
        
        response = self.client.post(self.product_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_all_users_can_list_products(self):
        """Test that all authenticated users can list products."""
        # Test admin
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.product_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Test employee
        self.client.force_authenticate(user=self.employee_user)
        response = self.client.get(self.product_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Test customer
        self.client.force_authenticate(user=self.customer_user)
        response = self.client.get(self.product_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_admin_can_update_product(self):
        """Test that admin can update products."""
        self.client.force_authenticate(user=self.admin_user)
        
        data = {
            'name': 'Updated Product',
            'description': 'Updated Description',
            'price': '199.99',
            'stock_quantity': 15,
            'category': 'Updated Category',
            'sku': 'API001'  # Keep same SKU
        }
        
        response = self.client.put(self.product_detail_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Product')
    
    def test_employee_can_update_product(self):
        """Test that employee can update products."""
        self.client.force_authenticate(user=self.employee_user)
        
        data = {
            'name': 'Employee Updated',
            'description': 'Employee Description',
            'price': '149.99',
            'stock_quantity': 12,
            'category': 'Employee Category',
            'sku': 'API001'
        }
        
        response = self.client.put(self.product_detail_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Employee Updated')
    
    def test_customer_cannot_update_product(self):
        """Test that customer cannot update products."""
        self.client.force_authenticate(user=self.customer_user)
        
        data = {
            'name': 'Customer Updated',
            'price': '999.99'
        }
        
        response = self.client.patch(self.product_detail_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_admin_can_delete_product(self):
        """Test that admin can delete products."""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.delete(self.product_detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Product.objects.filter(pk=self.product.pk).exists())
    
    def test_employee_can_delete_product(self):
        """Test that employee can delete products."""
        self.client.force_authenticate(user=self.employee_user)
        
        response = self.client.delete(self.product_detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    
    def test_customer_cannot_delete_product(self):
        """Test that customer cannot delete products."""
        self.client.force_authenticate(user=self.customer_user)
        
        response = self.client.delete(self.product_detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_unauthenticated_access_denied(self):
        """Test that unauthenticated users cannot access products."""
        response = self.client.get(self.product_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserRegistrationAPITest(APITestCase):
    """Test user registration API functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.register_url = reverse('register')
    
    def test_admin_registration_success(self):
        """Test successful admin registration."""
        data = {
            'username': 'new_admin',
            'password': 'newadmin123',
            'email': 'newadmin@test.com',
            'first_name': 'New',
            'last_name': 'Admin',
            'first_name_chinese': '新',
            'last_name_chinese': '管理员',
            'role': 'admin'
        }
        
        response = self.client.post(self.register_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        
        # Check user was created
        user = User.objects.get(username='new_admin')
        self.assertEqual(user.role, User.Roles.ADMIN)
        self.assertEqual(user.first_name_chinese, '新')
    
    def test_employee_registration_creates_unapproved_user(self):
        """Test that employee registration creates unapproved user."""
        data = {
            'username': 'new_employee',
            'password': 'newemployee123',
            'email': 'newemployee@test.com',
            'first_name': 'New',
            'last_name': 'Employee',
            'role': 'employee'
        }
        
        response = self.client.post(self.register_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check user was created but not approved
        user = User.objects.get(username='new_employee')
        self.assertEqual(user.role, User.Roles.EMPLOYEE)
        self.assertFalse(user.is_approved)
    
    def test_customer_registration_success(self):
        """Test successful customer registration."""
        data = {
            'username': 'new_customer',
            'password': 'newcustomer123',
            'email': 'newcustomer@test.com',
            'first_name': 'New',
            'last_name': 'Customer',
            'role': 'customer'
        }
        
        response = self.client.post(self.register_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check user was created
        user = User.objects.get(username='new_customer')
        self.assertEqual(user.role, User.Roles.CUSTOMER)
    
    def test_duplicate_username_fails(self):
        """Test that duplicate username registration fails."""
        # Create first user
        User.objects.create_user(
            username='duplicate_test',
            password='test123',
            email='first@test.com'
        )
        
        # Try to create user with same username
        data = {
            'username': 'duplicate_test',
            'password': 'test456',
            'email': 'second@test.com',
            'role': 'customer'
        }
        
        response = self.client.post(self.register_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)
    
    def test_missing_required_fields(self):
        """Test registration with missing required fields."""
        data = {
            'username': 'incomplete_user'
            # Missing password, email, role
        }
        
        response = self.client.post(self.register_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)
        self.assertIn('email', response.data)
