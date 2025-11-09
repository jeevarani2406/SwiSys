# Swisys Backend Test Suite

This directory contains comprehensive tests for the Swisys backend application using Django's testing framework.

## Test Structure

```
tests/
├── __init__.py                 # Test package initialization
├── README.md                   # This file
├── run_tests.py               # Test runner script
├── test_utils.py              # Test utilities and base classes
├── test_models.py             # Model tests
├── test_api.py                # API endpoint tests
├── test_permissions.py        # Permission system tests
├── test_serializers.py        # Serializer tests
└── test_comprehensive.py      # Comprehensive integration tests
```

## Test Categories

### 1. Model Tests (`test_models.py`)
Tests for all Django models including:
- **User Model**: Bilingual names, roles, permissions
- **Product Model**: CRUD operations, validation
- **LoginLog Model**: Login tracking and logging
- **ProductUpdateLog Model**: Product change tracking
- **EmailOTP Model**: OTP generation and validation

### 2. API Tests (`test_api.py`)
Tests for REST API endpoints including:
- **Unified Login API**: Authentication for all user types
- **Product API**: CRUD operations with role-based access
- **User Registration API**: User creation and validation

### 3. Permission Tests (`test_permissions.py`)
Tests for custom permission classes:
- **IsAdmin**: Admin-only access
- **EmployeeProductAccess**: Employee product management
- **IsCustomerReadOnly**: Customer read-only access
- **Permission Integration**: Combined permission scenarios

### 4. Serializer Tests (`test_serializers.py`)
Tests for API serializers:
- **UserRegistrationSerializer**: User creation and validation
- **UnifiedLoginSerializer**: Unified authentication
- **ProductSerializer**: Product data serialization
- **EmailOTPSerializer**: OTP data handling

### 5. Comprehensive Tests (`test_comprehensive.py`)
End-to-end integration tests covering:
- Complete user workflows
- Role-based system behavior
- Cross-component integration

## Running Tests

### Quick Start
```bash
# Navigate to backend directory
cd backend

# Run all tests
python manage.py test tests

# Run specific test module
python manage.py test tests.test_models
python manage.py test tests.test_api
python manage.py test tests.test_permissions
python manage.py test tests.test_serializers
```

### Using the Test Runner Script
```bash
# From the tests directory
python run_tests.py                 # Run all tests
python run_tests.py models          # Run only model tests
python run_tests.py api             # Run only API tests
python run_tests.py permissions     # Run only permission tests
python run_tests.py serializers     # Run only serializer tests
python run_tests.py --verbose       # Run with verbose output
```

### Advanced Test Options
```bash
# Run with verbose output
python manage.py test tests --verbosity=2

# Run specific test class
python manage.py test tests.test_models.UserModelTest

# Run specific test method
python manage.py test tests.test_models.UserModelTest.test_create_admin_user

# Keep test database
python manage.py test tests --keepdb

# Run tests in parallel
python manage.py test tests --parallel
```

## Test Data and Fixtures

### Test Users
Each test module creates standardized test users:
- **Admin User**: Full system access
- **Employee User**: Product management access (approved)
- **Customer User**: Read-only access
- **Unapproved Employee**: No login access

### Test Products
Standard test products with:
- Predictable names and SKUs
- Various categories and prices
- Known stock quantities

### Test Utilities
The `test_utils.py` module provides:
- **BaseTestCase**: Common setup for unit tests
- **BaseAPITestCase**: Common setup for API tests
- **TestDataFactory**: Helper methods for creating test data
- **TestAssertions**: Custom assertion methods

## Test Coverage

### Current Coverage Areas
- ✅ User model with bilingual names
- ✅ Role-based authentication system
- ✅ Product management CRUD operations
- ✅ Permission system validation
- ✅ API endpoint functionality
- ✅ Serializer validation
- ✅ OTP generation and verification
- ✅ Login logging and tracking
- ✅ Product update logging

### Key Test Scenarios
1. **Authentication Flow**
   - Unified login for all user types
   - Role detection and redirection
   - Unapproved employee restrictions

2. **Role-Based Access Control**
   - Admin: Full system access
   - Employee: Product management only
   - Customer: Read-only access

3. **Product Management**
   - CRUD operations by role
   - Data validation
   - Change logging

4. **Data Validation**
   - Required field validation
   - Unique constraint enforcement
   - Data type validation

## Best Practices

### Test Naming Convention
- Test files: `test_<component>.py`
- Test classes: `<Component><Type>Test`
- Test methods: `test_<specific_behavior>`

### Test Organization
- One test class per model/view/serializer
- Group related tests in the same class
- Use descriptive test method names

### Test Data
- Use the TestDataFactory for consistent test data
- Create minimal data needed for each test
- Clean up in tearDown if necessary

### Assertions
- Use specific assertions (assertEqual, assertTrue, etc.)
- Use custom assertions from TestAssertions when appropriate
- Include meaningful assertion messages

## Common Test Patterns

### Testing Model Creation
```python
def test_create_user_with_bilingual_names(self):
    user = User.objects.create_user(
        username='test_user',
        first_name='John',
        first_name_chinese='约翰',
        role=User.Roles.CUSTOMER
    )
    self.assertEqual(user.first_name_chinese, '约翰')
```

### Testing API Endpoints
```python
def test_admin_can_create_product(self):
    self.client.force_authenticate(user=self.admin_user)
    response = self.client.post(self.product_url, self.product_data)
    self.assertEqual(response.status_code, status.HTTP_201_CREATED)
```

### Testing Permissions
```python
def test_customer_cannot_delete_product(self):
    self.client.force_authenticate(user=self.customer_user)
    response = self.client.delete(self.product_detail_url)
    self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
```

### Testing Serializers
```python
def test_serializer_validation_error(self):
    serializer = ProductSerializer(data=self.invalid_data)
    self.assertFalse(serializer.is_valid())
    self.assertIn('price', serializer.errors)
```

## Troubleshooting

### Common Issues
1. **Import Errors**: Ensure DJANGO_SETTINGS_MODULE is set
2. **Database Errors**: Use `--keepdb` for faster test runs
3. **Permission Errors**: Check test user roles and permissions
4. **Data Conflicts**: Ensure unique test data in each test

### Debug Tips
- Use `print()` statements for debugging
- Run individual tests to isolate issues
- Use `--verbosity=2` for detailed output
- Check test database state with Django shell

## Contributing to Tests

### Adding New Tests
1. Identify the component to test
2. Choose appropriate test module or create new one
3. Follow existing patterns and naming conventions
4. Include both positive and negative test cases
5. Update this README if adding new test categories

### Test Requirements
- All new features must include tests
- Tests should cover happy path and error cases
- Maintain test isolation (no dependencies between tests)
- Use descriptive test names and docstrings

## Integration with CI/CD

This test suite is designed to integrate with continuous integration systems:
- Tests run in isolated database
- No external dependencies required
- Consistent test data and results
- Comprehensive coverage reporting

For production deployment, ensure all tests pass before merging code changes.
