"""
Test configuration and utilities for the Swisys backend application.

This module provides common test utilities and configuration that can be
shared across all test modules.
"""

from django.test import TestCase, TransactionTestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from accounts.models import Product, LoginLog, ProductUpdateLog, EmailOTP
from django.utils import timezone
from datetime import timedelta
import json

User = get_user_model()


class BaseTestCase(TestCase):
    """Base test case with common setup and utilities."""
    
    def setUp(self):
        """Set up common test data."""
        self.admin_user = User.objects.create_user(
            username='test_admin',
            password='admin123',
            email='admin@test.com',
            first_name='Test',
            last_name='Admin',
            first_name_chinese='测试',
            last_name_chinese='管理员',
            role=User.Roles.ADMIN
        )
        
        self.employee_user = User.objects.create_user(
            username='test_employee',
            password='employee123',
            email='employee@test.com',
            first_name='Test',
            last_name='Employee',
            first_name_chinese='测试',
            last_name_chinese='员工',
            role=User.Roles.EMPLOYEE,
            is_approved=True
        )
        
        self.customer_user = User.objects.create_user(
            username='test_customer',
            password='customer123',
            email='customer@test.com',
            first_name='Test',
            last_name='Customer',
            first_name_chinese='测试',
            last_name_chinese='客户',
            role=User.Roles.CUSTOMER
        )
        
        self.unapproved_employee = User.objects.create_user(
            username='test_unapproved',
            password='test123',
            email='unapproved@test.com',
            role=User.Roles.EMPLOYEE,
            is_approved=False
        )
    
    def create_test_product(self, name="Test Product", sku="TEST001", created_by=None):
        """Helper method to create a test product."""
        if created_by is None:
            created_by = self.admin_user
        
        return Product.objects.create(
            name=name,
            description="Test Description",
            price="99.99",
            stock_quantity=10,
            category="Test Category",
            sku=sku,
            created_by=created_by
        )
    
    def create_test_otp(self, user=None, code="123456", valid=True):
        """Helper method to create a test OTP."""
        if user is None:
            user = self.customer_user
        
        if valid:
            expires_at = timezone.now() + timedelta(minutes=10)
        else:
            expires_at = timezone.now() - timedelta(minutes=10)
        
        return EmailOTP.objects.create(
            user=user,
            code=code,
            created_at=timezone.now(),
            expires_at=expires_at
        )


class BaseAPITestCase(APITestCase):
    """Base API test case with authentication utilities."""
    
    def setUp(self):
        """Set up common test data for API tests."""
        self.admin_user = User.objects.create_user(
            username='api_admin',
            password='admin123',
            email='admin@api.com',
            role=User.Roles.ADMIN
        )
        
        self.employee_user = User.objects.create_user(
            username='api_employee',
            password='employee123',
            email='employee@api.com',
            role=User.Roles.EMPLOYEE,
            is_approved=True
        )
        
        self.customer_user = User.objects.create_user(
            username='api_customer',
            password='customer123',
            email='customer@api.com',
            role=User.Roles.CUSTOMER
        )
    
    def authenticate_as_admin(self):
        """Authenticate client as admin user."""
        self.client.force_authenticate(user=self.admin_user)
    
    def authenticate_as_employee(self):
        """Authenticate client as employee user."""
        self.client.force_authenticate(user=self.employee_user)
    
    def authenticate_as_customer(self):
        """Authenticate client as customer user."""
        self.client.force_authenticate(user=self.customer_user)
    
    def logout(self):
        """Remove authentication from client."""
        self.client.force_authenticate(user=None)


class TestDataFactory:
    """Factory class for creating test data."""
    
    @staticmethod
    def create_user_data(role='customer', username_suffix=''):
        """Create user data for testing."""
        base_data = {
            'username': f'test_{role}{username_suffix}',
            'password': f'{role}123',
            'email': f'{role}{username_suffix}@test.com',
            'first_name': f'Test{username_suffix}',
            'last_name': role.title(),
            'role': role
        }
        
        if role in ['admin', 'employee']:
            base_data.update({
                'first_name_chinese': f'测试{username_suffix}',
                'last_name_chinese': '管理员' if role == 'admin' else '员工'
            })
        
        return base_data
    
    @staticmethod
    def create_product_data(name_suffix='', sku_suffix='001'):
        """Create product data for testing."""
        return {
            'name': f'Test Product{name_suffix}',
            'description': f'Test Description{name_suffix}',
            'price': '99.99',
            'stock_quantity': 10,
            'category': f'Test Category{name_suffix}',
            'sku': f'TEST{sku_suffix}'
        }
    
    @staticmethod
    def create_login_data(username, password):
        """Create login data for testing."""
        return {
            'username': username,
            'password': password
        }


class TestAssertions:
    """Custom assertions for testing."""
    
    @staticmethod
    def assert_user_has_role(test_case, user, expected_role):
        """Assert that user has expected role."""
        test_case.assertEqual(user.role, expected_role)
    
    @staticmethod
    def assert_user_can_login(test_case, user):
        """Assert that user can login."""
        test_case.assertTrue(user.can_login())
    
    @staticmethod
    def assert_user_cannot_login(test_case, user):
        """Assert that user cannot login."""
        test_case.assertFalse(user.can_login())
    
    @staticmethod
    def assert_product_has_creator(test_case, product, creator):
        """Assert that product has expected creator."""
        test_case.assertEqual(product.created_by, creator)
    
    @staticmethod
    def assert_api_response_success(test_case, response, expected_status=200):
        """Assert that API response is successful."""
        test_case.assertEqual(response.status_code, expected_status)
        if hasattr(response, 'data'):
            test_case.assertIsNotNone(response.data)
    
    @staticmethod
    def assert_api_response_error(test_case, response, expected_status=400):
        """Assert that API response is an error."""
        test_case.assertEqual(response.status_code, expected_status)
        if hasattr(response, 'data'):
            test_case.assertIsNotNone(response.data)


# Test configuration constants
TEST_SETTINGS = {
    'DEFAULT_PASSWORD': 'test123',
    'OTP_EXPIRY_MINUTES': 10,
    'DEFAULT_PRODUCT_PRICE': '99.99',
    'DEFAULT_PRODUCT_STOCK': 10,
}

# Common test data
COMMON_TEST_DATA = {
    'valid_emails': [
        'test@example.com',
        'user.name@domain.co.uk',
        'admin+test@company.org'
    ],
    'invalid_emails': [
        'invalid-email',
        '@domain.com',
        'user@',
        ''
    ],
    'valid_usernames': [
        'testuser',
        'user123',
        'test_user',
        'TestUser'
    ],
    'invalid_usernames': [
        '',
        'a',  # Too short
        'user with spaces',
        'user@invalid'
    ],
    'user_roles': ['admin', 'employee', 'customer'],
    'product_categories': [
        'Electronics',
        'Clothing',
        'Books',
        'Home & Garden',
        'Sports'
    ]
}
