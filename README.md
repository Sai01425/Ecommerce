# Novamart — Full-Stack E-Commerce Web Application

A full-stack, responsive e-commerce web platform inspired by Amazon and Flipkart, engineered with **Java 21**, **Spring Boot 3**, **Spring Security (JWT)**, **Spring Data JPA**, **MySQL**, and a responsive **HTML5 / CSS3 / JavaScript / Bootstrap 5** storefront.

---

## Table of Contents
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Key Features](#key-features)
- [Project Directory Structure](#project-directory-structure)
- [Prerequisites](#prerequisites)
- [Database Setup (MySQL)](#database-setup-mysql)
- [Backend Configuration & Startup](#backend-configuration--startup)
- [Frontend Launch](#frontend-launch)
- [Default Demo Accounts](#default-demo-accounts)
- [REST API Endpoints & Postman](#rest-api-endpoints--postman)
- [Security & Business Logic](#security--business-logic)
- [Troubleshooting & FAQ](#troubleshooting--faq)

---

## Architecture & Tech Stack

### Frontend
- **HTML5 & CSS3** with a modern design system
- **Bootstrap 5.3.3** for responsive grid and UI components
- **Bootstrap Icons 1.11.3**
- **Vanilla JavaScript (ES6+)** with Fetch API (no heavyweight frameworks required)
- **Local Storage** for stateless JWT token and user profile caching

### Backend
- **Java 21 (LTS)**
- **Spring Boot 3.2.5**
  - **Spring Web** (RESTful endpoints, global exception handling, CORS)
  - **Spring Data JPA & Hibernate** (ORM, automated table generation, relationships)
  - **Spring Security 6** (Stateless authentication, role authorization, BCrypt password hashing)
  - **Spring Validation** (Hibernate Validator for DTO payload constraints)
  - **JJWT 0.12.5** (HMAC-SHA256 tokens)
- **Apache Maven 3.9+**

### Database
- **MySQL 8.0+ / MariaDB 10.4+ (XAMPP / standalone)**
- Database name: `ecommerce_db`
- `BigDecimal` precision for all financial calculations

---

## Key Features

1. **Home Page (`index.html`)**:
   - Interactive hero banner carousel with promotional calls-to-action
   - Category cards with live item counts
   - Dynamic sections for **Featured Products**, **Trending Now**, and **Best Sellers**
   - Trust highlights (Free Delivery on ₹500+, 7-day returns, Safe Demo Pay)
   - Real-time shopping cart badge indicator in navbar
   - Global product search bar

2. **Product Catalog & Filters (`products.html`)**:
   - Responsive grid displaying cards with discount badges, star ratings, and prices
   - Category sidebar filter
   - Price range filter (`min` and `max` prices)
   - Keyword search filter
   - Sorting by Price (Low to High / High to Low), Customer Rating, and Newest
   - Pagination controls

3. **Product Details Page (`product-details.html`)**:
   - Large product image preview with fallback placeholder handler
   - Dynamic breadcrumb navigation
   - Stock availability badge (In Stock, Low Stock warning, Out of Stock)
   - Quantity selector bounded by inventory limits
   - One-click **Add to Cart** and **Buy Now** buttons
   - Related products recommendation carousel

4. **Shopping Cart (`cart.html`)**:
   - Live item rows with real-time quantity increment/decrement/remove
   - Server-validated item subtotals and discounts
   - Free shipping tier calculator (free for orders ₹500+, else ₹40)
   - Stock threshold warnings

5. **Checkout & Mock Payment (`checkout.html`)**:
   - Shipping address collection form
   - Simulated **Safe Demo Payment System** supporting Demo Credit/Debit Card, Demo UPI QR, and Cash on Delivery
   - Strict server-side total verification (client totals are never trusted)
   - Atomic inventory deduction during order creation
   - Immediate order confirmation modal with generated Order ID

6. **Order History & Tracking (`orders.html`)**:
   - Customer order timeline
   - Order lifecycle states: `PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, and `CANCELLED`
   - Real-time order cancellation (restores inventory automatically)

7. **User Profile & Security (`profile.html`, `login.html`, `register.html`)**:
   - User registration and login
   - 1-click **Demo Customer** and **Demo Admin** auto-fill buttons
   - Profile updating and secure BCrypt password modification

8. **Admin Dashboard (`admin.html`)**:
   - Protected by `ROLE_ADMIN`
   - Real-time KPI statistics: Total Products, Customers, Orders, Revenue, Pending Orders, Low Stock Items
   - Product Catalog Management (Add new product, edit, delete, stock updates, image URLs)
   - Category Management (Create, edit, delete categories)
   - Order Fulfillment (View customer orders and transition lifecycle states)

---

## Project Directory Structure

```text
Ecommerce-4555/
├── backend/
│   ├── pom.xml
│   ├── target/
│   │   └── ecommerce-backend-1.0.0.jar
│   ├── src/main/
│   │   ├── java/com/example/ecommerce/
│   │   │   ├── EcommerceApplication.java
│   │   │   ├── config/             # SecurityConfig, CorsConfig, DataInitializer, WebMvcConfig
│   │   │   ├── controller/         # Auth, Product, Category, Cart, Order, User, Admin Controllers
│   │   │   ├── dto/                # Request & Response DTOs, ApiResponse wrapper
│   │   │   ├── entity/             # User, Role, Product, Category, Cart, CartItem, Order, OrderItem, Address
│   │   │   ├── exception/          # GlobalExceptionHandler, Custom Exceptions, ErrorResponse
│   │   │   ├── repository/         # Spring Data JPA Repositories
│   │   │   ├── security/           # JwtTokenProvider, JwtAuthenticationFilter, CustomUserDetailsService
│   │   │   └── service/            # Business logic and transactional services
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/             # Bundled frontend for single-port execution
├── frontend/
│   ├── index.html                  # Home storefront
│   ├── products.html               # Catalog, filters, search, pagination
│   ├── product-details.html        # Product details & related recommendations
│   ├── cart.html                   # Cart management
│   ├── checkout.html               # Checkout & safe demo payment
│   ├── login.html                  # Customer & Admin sign-in
│   ├── register.html               # New customer registration
│   ├── orders.html                 # Customer order tracking
│   ├── profile.html                # User profile & password update
│   ├── admin.html                  # Admin management dashboard
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── app.js                  # API client, cart badge, toasts, header state
│       ├── auth.js                 # Login, registration, demo autofill
│       ├── products.js             # Catalog filtering and sorting
│       ├── product-details.js      # Details view & quantities
│       ├── cart.js                 # Cart operations
│       ├── checkout.js             # Checkout flow
│       ├── orders.js               # Order history & cancellations
│       ├── profile.js              # Profile editor
│       └── admin.js                # Admin dashboard & CRUD modals
├── database/
│   ├── schema.sql                  # MySQL schema definition
│   └── sample-data.sql             # SQL seed script
├── postman/
│   └── ecommerce-api-collection.json # Importable Postman REST collection
└── README.md
```

---

## Prerequisites

1. **Java Development Kit (JDK 21 or higher)**
   - Check with: `java -version`
2. **Apache Maven (3.9+)**
   - Check with: `mvn -version`
3. **MySQL Server (8.0+ or MariaDB 10.4+)**
   - Recommended: XAMPP, MySQL Workbench, or Docker MySQL container.

---

## Database Setup (MySQL)

1. Ensure MySQL is running on port `3306`.
2. Connect to MySQL and create the database:
   ```sql
   CREATE DATABASE IF NOT EXISTS ecommerce_db;
   ```
3. *(Optional)* If you wish to execute the SQL files manually:
   ```bash
   mysql -u root -p ecommerce_db < database/schema.sql
   mysql -u root -p ecommerce_db < database/sample-data.sql
   ```
   > **Note:** Manual SQL execution is optional because Hibernate will automatically create all tables, and Spring Boot's built-in `DataInitializer` will automatically seed the default accounts, categories, and 18 products on first boot!

---

## Backend Configuration & Startup

### 1. Database Credentials Configuration
In `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:}
```
You can either edit `application.properties` directly or set environment variables:
```powershell
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "your_mysql_password"
```

### 2. Compile and Package
Open a terminal in `backend/`:
```bash
mvn clean package -DskipTests
```

### 3. Run the Application
You can run using Maven:
```bash
mvn spring-boot:run
```
Or run the generated executable JAR directly:
```bash
java -jar target/ecommerce-backend-1.0.0.jar
```
The server will start on:
```text
http://localhost:8080
```

---

## Frontend Launch

You have two convenient ways to run the frontend:

### Option A: Unified Single-Port (Recommended)
Since the frontend is bundled in `backend/src/main/resources/static/`, simply start the Spring Boot backend and navigate to:
```text
http://localhost:8080/
```
The entire application (HTML pages, CSS, JS, and `/api` REST endpoints) runs seamlessly on a single port without any CORS configuration needed.

### Option B: Standalone / Live Server
You can open `frontend/index.html` in VS Code using **Live Server** (e.g. `http://127.0.0.1:5500`).
The frontend is already configured with CORS enabled to communicate with `http://localhost:8080/api`.

---

## Default Demo Accounts

The application automatically seeds two test accounts upon startup:

| Role | Email | Password | Quick Login |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@ecommerce.com` | `Admin@12345` | Click **"Demo Admin"** on the login page |
| **Customer** | `john@example.com` | `Password@123` | Click **"Demo Customer"** on the login page |

> You can also register any new customer account using the **Register** page!

---

## REST API Endpoints & Postman

The base API URL is:
```text
http://localhost:8080/api
```

### Postman Collection
An importable collection is located at:
```text
postman/ecommerce-api-collection.json
```
To use:
1. Open Postman.
2. Click **Import** -> Select `postman/ecommerce-api-collection.json`.
3. Set collection variable `baseUrl` to `http://localhost:8080/api`.
4. Run **Login Customer** or **Login Admin**; the tests automatically save the JWT token into collection variables `token` and `adminToken`.

### API Endpoints Summary

#### Authentication
- `POST /api/auth/register` — Register a new customer
- `POST /api/auth/login` — Log in and receive JWT token
- `GET /api/auth/me` — Get authenticated user details
- `POST /api/auth/logout` — Invalidate user session

#### Categories
- `GET /api/categories` — List all active categories
- `GET /api/categories/{id}` — Get single category details
- `POST /api/categories` — Create new category *(Admin only)*
- `PUT /api/categories/{id}` — Update category *(Admin only)*
- `DELETE /api/categories/{id}` — Delete category *(Admin only)*

#### Products
- `GET /api/products` — List products with filters (`categoryId`, `minPrice`, `maxPrice`, `keyword`, `page`, `size`, `sortBy`, `sortDir`)
- `GET /api/products/{id}` — Product details by ID
- `GET /api/products/search?keyword=phone` — Search products
- `GET /api/products/category/{categoryId}` — Products by category
- `GET /api/products/featured` — Featured products list
- `GET /api/products/trending` — Trending products list
- `GET /api/products/best-sellers` — Best sellers list
- `GET /api/products/{id}/related` — Related items for a product
- `POST /api/products` — Add product *(Admin only)*
- `PUT /api/products/{id}` — Update product *(Admin only)*
- `DELETE /api/products/{id}` — Delete product *(Admin only)*

#### Shopping Cart
- `GET /api/cart` — Get user's cart and item totals
- `POST /api/cart/items` — Add product to cart (`productId`, `quantity`)
- `PUT /api/cart/items/{itemId}` — Update quantity
- `DELETE /api/cart/items/{itemId}` — Remove item
- `DELETE /api/cart` — Clear cart

#### Orders
- `POST /api/orders` — Place order with shipping address & demo payment
- `GET /api/orders/my` — Get authenticated user's orders
- `GET /api/orders/{orderId}` — Get specific order
- `PATCH /api/orders/{orderId}/cancel` — Cancel pending/confirmed order (restores stock)
- `GET /api/admin/orders` — View all orders *(Admin only)*
- `PATCH /api/admin/orders/{orderId}/status` — Update order status *(Admin only)*

#### User Profile
- `GET /api/users/me` — View current profile
- `PUT /api/users/me` — Update name, phone, or password

#### Admin Dashboard
- `GET /api/admin/stats` — Metrics for total products, customers, orders, revenue, and low stock

---

## Security & Business Logic

- **Password Hashing**: BCrypt with salt rounds.
- **Stateless Authentication**: JJWT token passed via `Authorization: Bearer <token>`.
- **Role Isolation**: Admin APIs (`/api/admin/**`, product/category mutations) are guarded by `@PreAuthorize("hasAuthority('ROLE_ADMIN')")`.
- **Customer Privacy**: Customers can only view and cancel their own orders.
- **Inventory Safety**: Stock availability is checked before order placement. Deductions occur in atomic `@Transactional` blocks.
- **Order Cancellation**: Restores deducted inventory back to stock automatically.
- **Price Integrity**: All item prices, discounts, delivery fees, and order totals are computed strictly on the backend via `BigDecimal`.

---

## Troubleshooting & FAQ

1. **MySQL Connection Error (`Communications link failure` or `10061`)**:
   - Ensure your MySQL server is running (e.g., in XAMPP control panel, click "Start" next to MySQL).
   - Check `spring.datasource.username` and `spring.datasource.password` in `application.properties`.

2. **Port 8080 Already in Use**:
   - If port 8080 is occupied by another service, change `server.port=8081` in `application.properties` and update `API_BASE` in `frontend/js/app.js`.

3. **CORS Issues when running on separate ports**:
   - `CorsConfig.java` is already configured with `allowedOriginPatterns("*")` and supports all HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
