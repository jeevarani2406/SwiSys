from django.test import TestCase
from accounts.models import User, Product, LoginLog, ProductUpdateLog, EmailOTP
from django.utils import timezone
from datetime import timedelta


class UserModelTest(TestCase):
    """Test User model functionality including bilingual names and roles."""
    
    def setUp(self):
        """Set up test data."""
        self.admin_data = {
            'username': 'admin_model',
            'password': 'admin123',
            'email': 'admin@model.com',
            'first_name': 'Admin',
            'last_name': 'User',
            'first_name_chinese': '管理员',
            'last_name_chinese': '用户',
            'role': User.Roles.ADMIN
        }
        
        self.employee_data = {
            'username': 'employee_model',
            'password': 'employee123',
            'email': 'employee@model.com',
            'first_name': 'John',
            'last_name': 'Employee',
            'first_name_chinese': '约翰',
            'last_name_chinese': '员工',
            'role': User.Roles.EMPLOYEE,
            'is_approved': True
        }
        
        self.customer_data = {
            'username': 'customer_model',
            'password': 'customer123',
            'email': 'customer@model.com',
            'first_name': 'Jane',
            'last_name': 'Customer',
            'first_name_chinese': '简',
            'last_name_chinese': '客户',
            'role': User.Roles.CUSTOMER
        }
    
    def test_create_admin_user(self):
        """Test creating an admin user."""
        admin = User.objects.create_user(**self.admin_data)
        
        self.assertEqual(admin.username, 'admin_model')
        self.assertEqual(admin.role, User.Roles.ADMIN)
        self.assertEqual(admin.first_name_chinese, '管理员')
        self.assertTrue(admin.check_password('admin123'))
        self.assertTrue(admin.can_login())
    
    def test_create_employee_user(self):
        """Test creating an employee user."""
        employee = User.objects.create_user(**self.employee_data)
        
        self.assertEqual(employee.username, 'employee_model')
        self.assertEqual(employee.role, User.Roles.EMPLOYEE)
        self.assertEqual(employee.first_name_chinese, '约翰')
        self.assertTrue(employee.is_approved)
        self.assertTrue(employee.can_login())
    
    def test_create_customer_user(self):
        """Test creating a customer user."""
        customer = User.objects.create_user(**self.customer_data)
        
        self.assertEqual(customer.username, 'customer_model')
        self.assertEqual(customer.role, User.Roles.CUSTOMER)
        self.assertEqual(customer.first_name_chinese, '简')
        self.assertTrue(customer.can_login())
    
    def test_unapproved_employee_cannot_login(self):
        """Test that unapproved employees cannot login."""
        employee_data = self.employee_data.copy()
        employee_data['is_approved'] = False
        employee_data['username'] = 'unapproved_employee'
        
        employee = User.objects.create_user(**employee_data)
        self.assertFalse(employee.can_login())
    
    def test_bilingual_name_serialization(self):
        """Test bilingual name fields are properly saved and retrieved."""
        user = User.objects.create_user(**self.admin_data)
        
        # Test English names
        self.assertEqual(user.first_name, 'Admin')
        self.assertEqual(user.last_name, 'User')
        
        # Test Chinese names
        self.assertEqual(user.first_name_chinese, '管理员')
        self.assertEqual(user.last_name_chinese, '用户')
    
    def test_user_string_representation(self):
        """Test user string representation."""
        user = User.objects.create_user(**self.admin_data)
        self.assertEqual(str(user), 'admin_model')


class ProductModelTest(TestCase):
    """Test Product model functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.admin_user = User.objects.create_user(
            username='admin_product',
            password='admin123',
            role=User.Roles.ADMIN
        )
        
        self.product_data = {
            'name': 'Test Product',
            'description': 'Test Description',
            'price': '99.99',
            'stock_quantity': 10,
            'category': 'Test Category',
            'sku': 'TEST001',
            'created_by': self.admin_user
        }
    
    def test_create_product(self):
        """Test creating a product."""
        product = Product.objects.create(**self.product_data)
        
        self.assertEqual(product.name, 'Test Product')
        self.assertEqual(str(product.price), '99.99')
        self.assertEqual(product.stock_quantity, 10)
        self.assertEqual(product.created_by, self.admin_user)
        self.assertTrue(product.is_active)
    
    def test_product_string_representation(self):
        """Test product string representation."""
        product = Product.objects.create(**self.product_data)
        self.assertEqual(str(product), 'Test Product')
    
    def test_unique_sku_constraint(self):
        """Test that SKU must be unique."""
        Product.objects.create(**self.product_data)
        
        # Try to create another product with same SKU
        duplicate_data = self.product_data.copy()
        duplicate_data['name'] = 'Duplicate Product'
        
        with self.assertRaises(Exception):  # Should raise IntegrityError
            Product.objects.create(**duplicate_data)


class LoginLogModelTest(TestCase):
    """Test LoginLog model functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='log_user',
            password='test123',
            role=User.Roles.CUSTOMER
        )
    
    def test_create_login_log(self):
        """Test creating a login log entry."""
        log = LoginLog.objects.create(
            user=self.user,
            ip_address='127.0.0.1',
            user_agent='Test Agent',
            success=True
        )
        
        self.assertEqual(log.user, self.user)
        self.assertEqual(log.ip_address, '127.0.0.1')
        self.assertTrue(log.success)
        self.assertIsNotNone(log.login_time)
    
    def test_login_log_string_representation(self):
        """Test login log string representation."""
        log = LoginLog.objects.create(user=self.user, success=True)
        expected = f"{self.user.username} - {log.login_time}"
        self.assertEqual(str(log), expected)


class ProductUpdateLogModelTest(TestCase):
    """Test ProductUpdateLog model functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.admin_user = User.objects.create_user(
            username='admin_log',
            password='admin123',
            role=User.Roles.ADMIN
        )
        
        self.product = Product.objects.create(
            name='Log Test Product',
            price='149.99',
            stock_quantity=5,
            category='Log Category',
            sku='LOG001',
            created_by=self.admin_user
        )
    
    def test_create_product_update_log(self):
        """Test creating a product update log entry."""
        changes = {
            'price': {'old': '99.99', 'new': '149.99'},
            'stock_quantity': {'old': 10, 'new': 5}
        }
        
        log = ProductUpdateLog.objects.create(
            product=self.product,
            employee=self.admin_user,
            action=ProductUpdateLog.Actions.UPDATE,
            changes=changes
        )
        
        self.assertEqual(log.product, self.product)
        self.assertEqual(log.employee, self.admin_user)
        self.assertEqual(log.action, ProductUpdateLog.Actions.UPDATE)
        self.assertEqual(log.changes, changes)
        self.assertIsNotNone(log.timestamp)
    
    def test_product_update_log_string_representation(self):
        """Test product update log string representation."""
        log = ProductUpdateLog.objects.create(
            product=self.product,
            employee=self.admin_user,
            action=ProductUpdateLog.Actions.CREATE,
            changes={'created': True}
        )
        
        expected = f"{self.admin_user.username} create {self.product.name}"
        self.assertEqual(str(log), expected)


class EmailOTPModelTest(TestCase):
    """Test EmailOTP model functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='otp_user',
            password='test123',
            email='otp@test.com',
            role=User.Roles.CUSTOMER
        )
    
    def test_create_otp(self):
        """Test creating an OTP."""
        otp = EmailOTP.objects.create(
            user=self.user,
            code='123456',
            created_at=timezone.now(),
            expires_at=timezone.now() + timedelta(minutes=10)
        )
        
        self.assertEqual(otp.user, self.user)
        self.assertEqual(otp.code, '123456')
        self.assertFalse(otp.used)
        self.assertTrue(otp.is_valid())
    
    def test_expired_otp_is_invalid(self):
        """Test that expired OTP is invalid."""
        otp = EmailOTP.objects.create(
            user=self.user,
            code='123456',
            created_at=timezone.now() - timedelta(minutes=20),
            expires_at=timezone.now() - timedelta(minutes=10)
        )
        
        self.assertFalse(otp.is_valid())
    
    def test_used_otp_is_invalid(self):
        """Test that used OTP is invalid."""
        otp = EmailOTP.objects.create(
            user=self.user,
            code='123456',
            created_at=timezone.now(),
            expires_at=timezone.now() + timedelta(minutes=10),
            used=True
        )
        
        self.assertFalse(otp.is_valid())
