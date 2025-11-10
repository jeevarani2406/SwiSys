# API Endpoints Documentation

## Base URL
- Development: `http://localhost:8000/api`
- Production: Configure via `NEXT_PUBLIC_API_URL` environment variable

## Authentication

All endpoints (except login, register, and health checks) require authentication via Token Authentication.
Include the token in the Authorization header: `Authorization: Token <token>`

---

## Authentication Endpoints

### 1. Unified Login
- **Endpoint**: `POST /api/accounts/login/`
- **Description**: Unified login for all user types (admin, employee, customer)
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "token": "string",
    "user": {
      "id": 1,
      "username": "string",
      "email": "string",
      "first_name": "string",
      "last_name": "string",
      "first_name_chinese": "string",
      "last_name_chinese": "string",
      "full_name_english": "string",
      "full_name_chinese": "string",
      "role": "admin|employee|customer",
      "is_approved": true,
      "is_active": true,
      "date_joined": "2024-01-01T00:00:00Z",
      "last_login": "2024-01-01T00:00:00Z"
    },
    "user_type": "admin|employee|customer",
    "message": "Login successful"
  }
  ```
- **Error Response** (400/401):
  ```json
  {
    "detail": "Invalid credentials" | "Employee account is pending approval" | "User account is inactive",
    "message": "Error message"
  }
  ```

### 2. Register Employee
- **Endpoint**: `POST /api/accounts/register/employee/`
- **Description**: Register a new employee (requires admin approval)
- **Request Body**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "first_name": "string",
    "last_name": "string",
    "first_name_chinese": "string",
    "last_name_chinese": "string"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "id": 1,
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "role": "employee",
    "is_approved": false,
    "is_active": true,
    "date_joined": "2024-01-01T00:00:00Z"
  }
  ```

### 3. Register Customer
- **Endpoint**: `POST /api/accounts/register/customer/`
- **Description**: Register a new customer (requires OTP verification)
- **Request Body**: Same as Register Employee
- **Response** (201 Created): Same as Register Employee
- **Note**: After registration, OTP is sent to customer's email

### 4. Verify Customer OTP
- **Endpoint**: `POST /api/accounts/verify/customer/otp/`
- **Description**: Verify OTP code for customer account activation
- **Request Body**:
  ```json
  {
    "username": "string",
    "code": "string"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "token": "string"
  }
  ```

### 5. Resend Customer OTP
- **Endpoint**: `POST /api/accounts/resend/customer/otp/`
- **Description**: Resend OTP code to customer's email
- **Request Body**:
  ```json
  {
    "username": "string"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "detail": "OTP sent"
  }
  ```

### 6. Get Current User
- **Endpoint**: `GET /api/accounts/me/`
- **Description**: Get current authenticated user information
- **Authentication**: Required
- **Response** (200 OK):
  ```json
  {
    "id": 1,
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "full_name_english": "string",
    "full_name_chinese": "string",
    "role": "admin|employee|customer",
    "is_approved": true,
    "is_active": true,
    "date_joined": "2024-01-01T00:00:00Z",
    "last_login": "2024-01-01T00:00:00Z"
  }
  ```

---

## Admin Endpoints

### 7. Get All Users
- **Endpoint**: `GET /api/accounts/admin/users/`
- **Description**: Get all users (admin only)
- **Authentication**: Required (Admin)
- **Query Parameters**:
  - `role`: Filter by role (admin, employee, customer)
  - `page`: Page number (pagination)
  - `page_size`: Items per page (default: 20)
- **Response** (200 OK):
  ```json
  {
    "count": 100,
    "next": "http://localhost:8000/api/accounts/admin/users/?page=2",
    "previous": null,
    "results": [
      {
        "id": 1,
        "username": "string",
        "email": "string",
        "first_name": "string",
        "last_name": "string",
        "full_name_english": "string",
        "full_name_chinese": "string",
        "role": "admin|employee|customer",
        "is_approved": true,
        "is_active": true,
        "date_joined": "2024-01-01T00:00:00Z",
        "last_login": "2024-01-01T00:00:00Z"
      }
    ]
  }
  ```

### 8. Get Employees
- **Endpoint**: `GET /api/accounts/admin/employees/`
- **Description**: Get all employees (admin only)
- **Authentication**: Required (Admin)
- **Response**: Same paginated format as Get All Users

### 9. Get Customers
- **Endpoint**: `GET /api/accounts/admin/customers/`
- **Description**: Get all customers (admin only)
- **Authentication**: Required (Admin)
- **Response**: Same paginated format as Get All Users

### 10. Approve Employee
- **Endpoint**: `POST /api/accounts/admin/approve-employee/<user_id>/`
- **Description**: Approve or revoke employee approval (admin only)
- **Authentication**: Required (Admin)
- **Request Body**:
  ```json
  {
    "approved": true
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "status": "updated",
    "user": {
      "id": 1,
      "username": "string",
      "email": "string",
      "role": "employee",
      "is_approved": true,
      "is_active": true
    }
  }
  ```

### 11. Dashboard Statistics
- **Endpoint**: `GET /api/accounts/admin/dashboard-stats/`
- **Description**: Get dashboard statistics (admin only)
- **Authentication**: Required (Admin)
- **Response** (200 OK):
  ```json
  {
    "stats": {
      "total_users": 100,
      "total_employees": 20,
      "total_customers": 80,
      "pending_employees": 5,
      "total_products": 50,
      "active_products": 45,
      "recent_logins": 30,
      "recent_registrations": 10,
      "recent_product_updates": 15
    }
  }
  ```

### 12. Login Logs
- **Endpoint**: `GET /api/accounts/admin/login-logs/`
- **Description**: Get all login logs (admin only)
- **Authentication**: Required (Admin)
- **Query Parameters**:
  - `user_id`: Filter by user ID
  - `page`: Page number
  - `page_size`: Items per page
- **Response** (200 OK):
  ```json
  {
    "count": 500,
    "next": "http://localhost:8000/api/accounts/admin/login-logs/?page=2",
    "previous": null,
    "results": [
      {
        "id": 1,
        "user": 1,
        "user_name": "John Doe",
        "user_role": "admin",
        "login_time": "2024-01-01T00:00:00Z",
        "ip_address": "127.0.0.1",
        "success": true
      }
    ]
  }
  ```

### 13. Product Update Logs
- **Endpoint**: `GET /api/accounts/admin/product-logs/`
- **Description**: Get all product update logs (admin only)
- **Authentication**: Required (Admin)
- **Query Parameters**:
  - `employee_id`: Filter by employee ID
  - `product_id`: Filter by product ID
  - `page`: Page number
  - `page_size`: Items per page
- **Response** (200 OK):
  ```json
  {
    "count": 200,
    "next": null,
    "previous": null,
    "results": [
      {
        "id": 1,
        "product": 1,
        "product_name": "Product Name",
        "employee": 2,
        "employee_name": "Employee Name",
        "action": "create|update|delete",
        "changes": {
          "name": {
            "old": "Old Name",
            "new": "New Name"
          }
        },
        "timestamp": "2024-01-01T00:00:00Z"
      }
    ]
  }
  ```

---

## Product Endpoints

### 14. Get All Products
- **Endpoint**: `GET /api/accounts/products/`
- **Description**: Get all products (all authenticated users)
- **Authentication**: Required
- **Query Parameters**:
  - `page`: Page number
  - `page_size`: Items per page
  - `search`: Search term
  - `category`: Filter by category
  - `is_active`: Filter by active status
- **Response** (200 OK):
  ```json
  {
    "count": 50,
    "next": null,
    "previous": null,
    "results": [
      {
        "id": 1,
        "name": "string",
        "description": "string",
        "price": "99.99",
        "stock_quantity": 100,
        "category": "string",
        "sku": "string",
        "is_active": true,
        "created_by": 1,
        "created_by_name": "John Doe",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
  ```

### 15. Get Product by ID
- **Endpoint**: `GET /api/accounts/products/<id>/`
- **Description**: Get product details (all authenticated users)
- **Authentication**: Required
- **Response** (200 OK): Single product object (same structure as in Get All Products)

### 16. Create Product
- **Endpoint**: `POST /api/accounts/products/`
- **Description**: Create a new product (admin and employee only)
- **Authentication**: Required (Admin or Employee)
- **Request Body**:
  ```json
  {
    "name": "string",
    "description": "string",
    "price": "99.99",
    "stock_quantity": 100,
    "category": "string",
    "sku": "string",
    "is_active": true
  }
  ```
- **Response** (201 Created): Product object

### 17. Update Product
- **Endpoint**: `PUT /api/accounts/products/<id>/`
- **Description**: Update a product (admin and employee only)
- **Authentication**: Required (Admin or Employee)
- **Request Body**: Same as Create Product
- **Response** (200 OK): Updated product object

### 18. Delete Product
- **Endpoint**: `DELETE /api/accounts/products/<id>/`
- **Description**: Delete a product (admin and employee only)
- **Authentication**: Required (Admin or Employee)
- **Response** (204 No Content)

---

## Error Responses

All endpoints return standard error responses:

### 400 Bad Request
```json
{
  "detail": "Error message",
  "message": "Error message",
  "field_name": ["Error for this field"]
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "detail": "A server error occurred."
}
```

---

## Frontend Service Usage

The frontend uses service classes for API calls:

- `authService`: Authentication operations
- `userService`: User management operations
- `productService`: Product management operations
- `adminService`: Admin dashboard operations

All services handle pagination automatically and return either:
- Array of items (if paginated: `response.data.results`)
- Single object (if not paginated: `response.data`)

---

## Notes

1. **Pagination**: All list endpoints use pagination. Frontend handles `results` array automatically.
2. **Token Authentication**: Tokens are stored in localStorage and automatically included in requests via axios interceptor.
3. **Error Handling**: Frontend components handle errors consistently using the error response structure.
4. **Role-Based Access**: Endpoints enforce role-based permissions on the backend.

