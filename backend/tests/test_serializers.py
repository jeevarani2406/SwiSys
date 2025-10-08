from django.test import TestCase
from django.contrib.auth import get_user_model
from accounts.models import Product, EmailOTP
from accounts.serializers import (
    UserRegistrationSerializer,
    UnifiedLoginSerializer,
    ProductSerializer,
    EmailOTPSerializer
)
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class UserRegistrationSerializerTest(TestCase):
    """Test UserRegistrationSerializer functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.valid_admin_data = {
            'username': 'admin_serializer',
            'password': 'admin123',
            'email': 'admin@serializer.com',
            'first_name': 'Admin',
            'last_name': 'User',
            'first_name_chinese': '管理员',
            'last_name_chinese': '用户',
            'role': 'admin'
        }
        
        self.valid_employee_data = {
            'username': 'employee_serializer',
            'password': 'employee123',
            'email': 'employee@serializer.com',
            'first_name': 'John',
            'last_name': 'Employee',
            'role': 'employee'
        }
        
        self.valid_customer_data = {
            'username': 'customer_serializer',
            'password': 'customer123',
            'email': 'customer@serializer.com',
            'first_name': 'Jane',
            'last_name': 'Customer',
            'role': 'customer'
        }
    
    def test_create_admin_user_success(self):
        """Test creating admin user with serializer."""
        serializer = UserRegistrationSerializer(data=self.valid_admin_data)
        
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        
        self.assertEqual(user.username, 'admin_serializer')
        self.assertEqual(user.role, User.Roles.ADMIN)
        self.assertEqual(user.first_name_chinese, '管理员')
        self.assertTrue(user.check_password('admin123'))
    
    def test_create_employee_user_success(self):
        """Test creating employee user with serializer."""
        serializer = UserRegistrationSerializer(data=self.valid_employee_data)
        
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        
        self.assertEqual(user.username, 'employee_serializer')
        self.assertEqual(user.role, User.Roles.EMPLOYEE)
        self.assertFalse(user.is_approved)  # Employees start unapproved
    
    def test_create_customer_user_success(self):
        """Test creating customer user with serializer."""
        serializer = UserRegistrationSerializer(data=self.valid_customer_data)
        
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        
        self.assertEqual(user.username, 'customer_serializer')
        self.assertEqual(user.role, User.Roles.CUSTOMER)
    
    def test_invalid_role(self):
        """Test registration with invalid role."""
        invalid_data = self.valid_admin_data.copy()
        invalid_data['role'] = 'invalid_role'
        
        serializer = UserRegistrationSerializer(data=invalid_data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('role', serializer.errors)
    
    def test_duplicate_username(self):
        """Test registration with duplicate username."""
        # Create first user
        User.objects.create_user(
            username='duplicate_user',
            password='test123',
            email='first@test.com'
        )
        
        # Try to create second user with same username
        duplicate_data = self.valid_admin_data.copy()
        duplicate_data['username'] = 'duplicate_user'
        duplicate_data['email'] = 'second@test.com'
        
        serializer = UserRegistrationSerializer(data=duplicate_data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('username', serializer.errors)
    
    def test_missing_required_fields(self):
        """Test registration with missing required fields."""
        incomplete_data = {
            'username': 'incomplete'
            # Missing password, email, role
        }
        
        serializer = UserRegistrationSerializer(data=incomplete_data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)
        self.assertIn('email', serializer.errors)
        self.assertIn('role', serializer.errors)


class UnifiedLoginSerializerTest(TestCase):
    """Test UnifiedLoginSerializer functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.admin_user = User.objects.create_user(
            username='admin_login',
            password='admin123',
            email='admin@login.com',
            role=User.Roles.ADMIN
        )
        
        self.employee_user = User.objects.create_user(
            username='employee_login',
            password='employee123',
            email='employee@login.com',
            role=User.Roles.EMPLOYEE,
            is_approved=True
        )
        
        self.customer_user = User.objects.create_user(
            username='customer_login',
            password='customer123',
            email='customer@login.com',
            role=User.Roles.CUSTOMER
        )
        
        self.unapproved_employee = User.objects.create_user(
            username='unapproved_login',
            password='test123',
            email='unapproved@login.com',
            role=User.Roles.EMPLOYEE,
            is_approved=False
        )
    
    def test_admin_login_success(self):
        """Test successful admin login."""
        data = {
            'username': 'admin_login',
            'password': 'admin123'
        }
        
        serializer = UnifiedLoginSerializer(data=data)
        
        self.assertTrue(serializer.is_valid())
        validated_data = serializer.validated_data
        
        self.assertEqual(validated_data['user'], self.admin_user)
        self.assertEqual(validated_data['user_type'], 'admin')
    
    def test_employee_login_success(self):
        """Test successful employee login."""
        data = {
            'username': 'employee_login',
            'password': 'employee123'
        }
        
        serializer = UnifiedLoginSerializer(data=data)
        
        self.assertTrue(serializer.is_valid())
        validated_data = serializer.validated_data
        
        self.assertEqual(validated_data['user'], self.employee_user)
        self.assertEqual(validated_data['user_type'], 'employee')
    
    def test_customer_login_success(self):
        """Test successful customer login."""
        data = {
            'username': 'customer_login',
            'password': 'customer123'
        }
        
        serializer = UnifiedLoginSerializer(data=data)
        
        self.assertTrue(serializer.is_valid())
        validated_data = serializer.validated_data
        
        self.assertEqual(validated_data['user'], self.customer_user)
        self.assertEqual(validated_data['user_type'], 'customer')
    
    def test_invalid_credentials(self):
        """Test login with invalid credentials."""
        data = {
            'username': 'nonexistent',
            'password': 'wrongpassword'
        }
        
        serializer = UnifiedLoginSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)
    
    def test_unapproved_employee_login_fails(self):
        """Test that unapproved employee cannot login."""
        data = {
            'username': 'unapproved_login',
            'password': 'test123'
        }
        
        serializer = UnifiedLoginSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)
    
    def test_missing_username(self):
        """Test login with missing username."""
        data = {
            'password': 'test123'
        }
        
        serializer = UnifiedLoginSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('username', serializer.errors)
    
    def test_missing_password(self):
        """Test login with missing password."""
        data = {
            'username': 'admin_login'
        }
        
        serializer = UnifiedLoginSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)


class ProductSerializerTest(TestCase):
    """Test ProductSerializer functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.admin_user = User.objects.create_user(
            username='admin_product_ser',
            password='admin123',
            role=User.Roles.ADMIN
        )
        
        self.valid_product_data = {
            'name': 'Serializer Product',
            'description': 'Test Description',
            'price': '99.99',
            'stock_quantity': 10,
            'category': 'Test Category',
            'sku': 'SER001'
        }
        
        self.existing_product = Product.objects.create(
            name='Existing Product',
            description='Existing Description',
            price='149.99',
            stock_quantity=5,
            category='Existing Category',
            sku='EXIST001',
            created_by=self.admin_user
        )
    
    def test_create_product_success(self):
        """Test creating product with serializer."""
        serializer = ProductSerializer(data=self.valid_product_data)
        
        self.assertTrue(serializer.is_valid())
        product = serializer.save(created_by=self.admin_user)
        
        self.assertEqual(product.name, 'Serializer Product')
        self.assertEqual(product.price, 99.99)
        self.assertEqual(product.created_by, self.admin_user)
        self.assertTrue(product.is_active)
    
    def test_update_product_success(self):
        """Test updating product with serializer."""
        update_data = {
            'name': 'Updated Product',
            'price': '199.99',
            'stock_quantity': 15
        }
        
        serializer = ProductSerializer(
            instance=self.existing_product,
            data=update_data,
            partial=True
        )
        
        self.assertTrue(serializer.is_valid())
        updated_product = serializer.save()
        
        self.assertEqual(updated_product.name, 'Updated Product')
        self.assertEqual(updated_product.price, 199.99)
        self.assertEqual(updated_product.stock_quantity, 15)
    
    def test_duplicate_sku_validation(self):
        """Test that duplicate SKU is not allowed."""
        duplicate_data = self.valid_product_data.copy()
        duplicate_data['sku'] = 'EXIST001'  # Use existing SKU
        
        serializer = ProductSerializer(data=duplicate_data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('sku', serializer.errors)
    
    def test_negative_price_validation(self):
        """Test that negative price is not allowed."""
        invalid_data = self.valid_product_data.copy()
        invalid_data['price'] = '-10.00'
        
        serializer = ProductSerializer(data=invalid_data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('price', serializer.errors)
    
    def test_negative_stock_validation(self):
        """Test that negative stock is not allowed."""
        invalid_data = self.valid_product_data.copy()
        invalid_data['stock_quantity'] = -5
        
        serializer = ProductSerializer(data=invalid_data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('stock_quantity', serializer.errors)
    
    def test_missing_required_fields(self):
        """Test validation with missing required fields."""
        incomplete_data = {
            'name': 'Incomplete Product'
            # Missing description, price, stock_quantity, category, sku
        }
        
        serializer = ProductSerializer(data=incomplete_data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('price', serializer.errors)
        self.assertIn('stock_quantity', serializer.errors)
        self.assertIn('sku', serializer.errors)


class EmailOTPSerializerTest(TestCase):
    """Test EmailOTPSerializer functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='otp_user',
            password='test123',
            email='otp@test.com',
            role=User.Roles.CUSTOMER
        )
        
        self.valid_otp = EmailOTP.objects.create(
            user=self.user,
            code='123456',
            created_at=timezone.now(),
            expires_at=timezone.now() + timedelta(minutes=10)
        )
        
        self.expired_otp = EmailOTP.objects.create(
            user=self.user,
            code='654321',
            created_at=timezone.now() - timedelta(minutes=20),
            expires_at=timezone.now() - timedelta(minutes=10)
        )
    
    def test_serialize_valid_otp(self):
        """Test serializing a valid OTP."""
        serializer = EmailOTPSerializer(instance=self.valid_otp)
        data = serializer.data
        
        self.assertEqual(data['code'], '123456')
        self.assertEqual(data['user'], self.user.id)
        self.assertFalse(data['used'])
    
    def test_serialize_expired_otp(self):
        """Test serializing an expired OTP."""
        serializer = EmailOTPSerializer(instance=self.expired_otp)
        data = serializer.data
        
        self.assertEqual(data['code'], '654321')
        self.assertEqual(data['user'], self.user.id)
        self.assertFalse(data['used'])
    
    def test_create_otp_success(self):
        """Test creating OTP with serializer."""
        data = {
            'user': self.user.id,
            'code': '789012',
            'expires_at': timezone.now() + timedelta(minutes=15)
        }
        
        serializer = EmailOTPSerializer(data=data)
        
        self.assertTrue(serializer.is_valid())
        otp = serializer.save()
        
        self.assertEqual(otp.code, '789012')
        self.assertEqual(otp.user, self.user)
        self.assertFalse(otp.used)
        self.assertTrue(otp.is_valid())
    
    def test_invalid_user(self):
        """Test creating OTP with invalid user."""
        data = {
            'user': 99999,  # Non-existent user ID
            'code': '123456',
            'expires_at': timezone.now() + timedelta(minutes=10)
        }
        
        serializer = EmailOTPSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('user', serializer.errors)
    
    def test_missing_required_fields(self):
        """Test creating OTP with missing required fields."""
        incomplete_data = {
            'code': '123456'
            # Missing user and expires_at
        }
        
        serializer = EmailOTPSerializer(data=incomplete_data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('user', serializer.errors)
        self.assertIn('expires_at', serializer.errors)
