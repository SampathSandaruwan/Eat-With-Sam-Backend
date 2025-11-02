# Implementation Plan

This document outlines the step-by-step implementation roadmap for the EatWithSam backend assignment. The implementation is organized into modules that align with commit boundaries.

## Current Status

**Phase 1: Menu & Order Management** - **In Progress** (65% Complete)
- ✅ Restaurant Management APIs (CRUD + Pagination)
- ✅ Restaurant Rating Calculation (Automated job + Maintenance endpoints)
- ✅ Menu Category Management APIs (CRUD + Pagination)
- ✅ Menu Item Management APIs (CRUD + Pagination)
- ✅ Common validation utilities (pagination, ID params)
- ✅ Database seeding infrastructure
- ✅ Postman collection updated
- ⏳ Order Management APIs (Pending)
- ⏳ Complete seeding with 10,000+ orders (Pending Order model)

**Phase 2: Authentication & Authorization** - **Not Started**
**Phase 3: Reporting** - **Not Started**

## Implementation Order

1. **Phase 1: Menu & Order Management** (Foundation) - *In Progress*
2. **Phase 2: Authentication & Authorization** (Security) - *Pending*
3. **Phase 3: Reporting** (Analytics) - *Pending*

---

## Core Requirements Checklist

All phases must ensure:
- ✅ Clean, scalable REST APIs (Express + Sequelize + MySQL)
- ✅ Secure authentication (JWT with refresh token rotation)
- ✅ Robust data modeling, validation, error handling
- ✅ Strong documentation
- ✅ Comprehensive testing (Jest)
- ✅ CI/CD setup
- ✅ Database seeding with Faker.js
- ✅ Linting and code quality
- ✅ TypeScript type-safety

---

## Phase 1: Menu & Order Management

**Goal**: Implement core business logic for restaurants, menus, and orders with full CRUD operations.

### Module 1.1: Project Setup & Infrastructure

#### Tasks
1. **Setup TypeScript Configuration**
   - [x] Verify `tsconfig.json` configuration
   - [x] Ensure strict type checking enabled
   - [ ] Configure path aliases if needed

2. **Setup Express Application Structure**
   - [x] Review `app.ts` and `server.ts` structure
   - [x] Configure middleware (body parser, CORS)
   - [x] Setup basic error handling middleware (needs improvement)
   - [ ] Configure request logging (morgan or winston)
   - [ ] Add helmet for security headers

3. **Database Connection & Models**
   - [x] Verify Sequelize database configuration
   - [x] Test database connection
   - [x] Create Sequelize models for:
     - [x] Restaurant
     - [x] MenuCategory
     - [x] MenuItem
     - [ ] Order
     - [ ] OrderItem
     - [ ] User
     - [ ] RefreshToken
     - [ ] Rating
   - [x] Define model associations (for Restaurant, MenuCategory, MenuItem)
   - [x] Add model validations (for Restaurant, MenuCategory, MenuItem)
   - [ ] Create database migrations

4. **Validation Setup**
   - [x] Install and configure Zod
   - [x] Create validation schemas directory structure
   - [x] Create validation middleware wrapper
   - [x] Extract common validation fields (pagination, ID params)

5. **Error Handling Infrastructure**
   - [ ] Create custom error classes (AppError, ValidationError, NotFoundError, etc.)
   - [ ] Create error response formatter
   - [ ] Improve global error handler middleware (currently basic)

6. **Testing Infrastructure**
   - [ ] Install Jest and testing dependencies
   - [ ] Configure Jest with TypeScript
   - [ ] Setup test database configuration
   - [ ] Create test utilities and helpers
   - [ ] Setup test scripts in `package.json`

7. **Linting & Code Quality**
   - [x] Configure ESLint for TypeScript
   - [ ] Setup Prettier (optional)
   - [x] Add lint scripts to `package.json`
   - [ ] Configure pre-commit hooks (Husky + lint-staged)

8. **CI/CD Setup**
   - [ ] Create GitHub Actions workflow
   - [ ] Configure tests to run on PR/push
   - [ ] Setup database for CI (test database)
   - [ ] Configure lint checks in CI

**Commit**: `chore: setup project infrastructure and tooling`

---

### Module 1.2: Restaurant Management APIs

#### Tasks
1. **Restaurant Model Implementation**
   - [x] Complete Restaurant Sequelize model
   - [x] Add all required fields with types
   - [x] Add model validations (name, email format, etc.)
   - [x] Add indexes for performance
   - [ ] Test model creation and queries

2. **Restaurant Validation Schemas**
   - [x] Create Zod schemas for:
     - [x] Create restaurant request
     - [x] Update restaurant request
     - [x] Query parameters (pagination, filters)
   - [x] Add meaningful error messages
   - [x] Extract common pagination fields

3. **Restaurant Controller**
   - [x] `createRestaurant()` - Create new restaurant
   - [x] `getRestaurantById()` - Get restaurant by ID
   - [x] `getAllRestaurants()` - List all with pagination
   - [x] `updateRestaurant()` - Update restaurant (PATCH)
   - [x] `deleteRestaurant()` - Delete restaurant
   - [x] Error handling in all methods

4. **Restaurant Routes**
   - [x] Define RESTful routes (`POST /api/restaurants`, `GET /api/restaurants`, etc.)
   - [x] Connect routes to controller methods
   - [x] Add validation middleware
   - [x] Test all endpoints manually

5. **Restaurant Service Layer (Optional but Recommended)**
   - [ ] Extract business logic from controllers
   - [ ] Create RestaurantService class
   - [ ] Move database operations to service
   - [ ] Keep controllers thin

6. **Restaurant Tests**
   - [ ] Unit tests for validation schemas
   - [ ] Unit tests for service/controller methods
   - [ ] Integration tests for API endpoints
   - [ ] Test error scenarios
   - [ ] Test pagination

**Commit**: `feat(restaurants): implement CRUD APIs with validation and tests`

---

### Module 1.2.1: Restaurant Rating Calculation

#### Tasks
1. **Restaurant Model Updates**
   - [x] Add `averageRating` field (DECIMAL(9, 8))
   - [x] Add `ratingCount` field (INTEGER)
   - [x] Add index on `averageRating` for sorting/filtering
   - [x] Add model validations (min: 0, max: 5 for rating)

2. **Rating Calculation Job**
   - [x] Create `calculateRestaurantRatings()` job function
   - [x] Implement weighted average calculation from menu items
   - [x] Handle restaurants with no rated items
   - [x] Process all restaurants with error handling
   - [x] Return calculation results (success, processed, errors)

3. **Cron Job Configuration**
   - [x] Install `node-cron` package
   - [x] Create cron configuration (`config/crons.ts`)
   - [x] Schedule rating calculation every 4 hours
   - [x] Integrate cron jobs into server startup

4. **Maintenance Endpoints**
   - [x] Create maintenance controller
   - [x] Add `POST /api/maintenance/calculate-ratings` endpoint
   - [x] Allow manual triggering of rating calculation
   - [x] Return job execution results

5. **Database Sync Script**
   - [x] Create database sync script (`scripts/sync-database.ts`)
   - [x] Add `sync-db` npm script
   - [x] Support schema synchronization (ALTER only, no drops)

6. **Rating Calculation Tests**
   - [ ] Unit tests for rating calculation logic
   - [ ] Test weighted average accuracy
   - [ ] Test edge cases (no ratings, zero ratings)
   - [ ] Integration tests for maintenance endpoint
   - [ ] Test cron job execution

**Commit**: `feat(restaurants): :zap: add automated restaurant rating calculation from menu items`

---

### Module 1.3: Menu Management APIs

#### Tasks
1. **MenuCategory Model Implementation**
   - [x] Complete MenuCategory Sequelize model
   - [x] Add restaurantId foreign key
   - [x] Add validations
   - [x] Test model associations

2. **MenuItem Model Implementation**
   - [x] Complete MenuItem Sequelize model
   - [x] Add categoryId and restaurantId foreign keys
   - [x] Add validations (price > 0, rating 1-5, etc.)
   - [x] Handle JSON tags field
   - [x] Add averageRating and ratingCount fields
   - [x] Test model associations

3. **Menu Validation Schemas**
   - [x] Create Zod schemas for:
     - [x] Create/update category requests
     - [x] Create/update menu item requests
     - [x] Query parameters (pagination, filters, sorting)
   - [x] Extract common validation fields

4. **Menu Controllers**
   - [x] **Categories:**
     - [x] `getAllCategories()` - List all categories with pagination
     - [x] `getCategoryById()` - Get category by ID
     - [x] `getCategoriesByRestaurantId()` - List categories for a restaurant
     - [x] `createMenuCategory()` - Create category
     - [x] `updateMenuCategory()` - Update category
     - [x] `deleteMenuCategory()` - Delete category
   - [x] **Menu Items:**
     - [x] `createMenuItem()` - Create menu item
     - [x] `getMenuItemById()` - Get item by ID
     - [x] `getMenuItemsByCategoryId()` - List with pagination, filtering, sorting
     - [x] `updateMenuItem()` - Update menu item
     - [x] `deleteMenuItem()` - Delete menu item
   - [x] Refactored with helper functions for code reuse

5. **Menu Routes**
   - [x] Define RESTful routes:
     - [x] `POST /api/menu-categories`
     - [x] `GET /api/menu-categories` (with pagination)
     - [x] `GET /api/menu-categories/:categoryId`
     - [x] `PATCH /api/menu-categories/:categoryId`
     - [x] `DELETE /api/menu-categories/:categoryId`
     - [x] `GET /api/restaurants/:restaurantId/menu-categories` (with pagination)
     - [x] `POST /api/menu-items`
     - [x] `GET /api/menu-items/:menuItemId`
     - [x] `PUT /api/menu-items/:menuItemId`
     - [x] `DELETE /api/menu-items/:menuItemId`
     - [x] `GET /api/menu-categories/:categoryId/menu-items` (with pagination)
   - [x] Add validation middleware
   - [x] Test pagination, filtering, sorting

6. **Menu Tests**
   - [ ] Unit tests for models and validations
   - [ ] Integration tests for all endpoints
   - [ ] Test pagination functionality
   - [ ] Test filtering and sorting
   - [ ] Test error scenarios

**Commit**: `feat(menu): implement menu categories and items CRUD APIs with pagination`

---

### Module 1.4: Order Management APIs

#### Tasks
1. **Order & OrderItem Models Implementation**
   - [ ] Complete Order Sequelize model
   - [ ] Complete OrderItem Sequelize model
   - [ ] Add all foreign keys and associations
   - [ ] Add validations (status enum, quantity > 0, etc.)
   - [ ] Add order number generation logic
   - [ ] Test model associations

2. **Order Validation Schemas**
   - [ ] Create Zod schemas for:
     - [ ] Place order request (items, quantities, delivery address)
     - [ ] Update order request (status updates)
     - [ ] Query parameters (pagination, filters, date ranges)

3. **Order Business Logic**
   - [ ] Calculate order totals (subtotal, tax, delivery fee, total)
   - [ ] Validate menu item availability
   - [ ] Validate restaurant minimum order
   - [ ] Handle price snapshots (priceAtOrder)

4. **Order Controllers**
   - [ ] `placeOrder()` - Create new order with items
   - [ ] `getOrder()` - Get order by ID with items
   - [ ] `getUserOrders()` - Get user's order history (paginated)
   - [ ] `getRestaurantOrders()` - Get restaurant's orders (paginated)
   - [ ] `updateOrderStatus()` - Update order status
   - [ ] Error handling and validation

5. **Order Routes**
   - [ ] Define RESTful routes:
     - [ ] `POST /api/orders` - Place order
     - [ ] `GET /api/orders/:id` - Get order details
     - [ ] `GET /api/orders` - Get user orders (with auth middleware later)
     - [ ] `GET /api/restaurants/:restaurantId/orders` - Get restaurant orders
     - [ ] `PATCH /api/orders/:id/status` - Update status
   - [ ] Add validation middleware
   - [ ] Test all endpoints

6. **Order Tests**
   - [ ] Unit tests for order calculations
   - [ ] Integration tests for order placement
   - [ ] Test order status transitions
   - [ ] Test validation (minimum order, availability)
   - [ ] Test error scenarios

**Commit**: `feat(orders): implement order management APIs with calculations and validation`

---

### Module 1.5: Database Seeding

#### Tasks
1. **Restaurant Seeder**
   - [ ] Create seeder function using Faker.js
   - [ ] Generate realistic restaurant data
   - [ ] Seed multiple restaurants with varied data

2. **Menu Category Seeder**
   - [ ] Create seeder for categories per restaurant
   - [ ] Generate varied category names

3. **Menu Item Seeder**
   - [ ] Create seeder for menu items
   - [ ] Generate realistic prices, descriptions
   - [ ] Generate JSON tags
   - [ ] Assign to categories

4. **Order Seeder (10,000+ Orders)**
   - [ ] Create order seeder
   - [ ] Generate 10,000+ orders with varied statuses
   - [ ] Generate realistic order items (2-5 items per order)
   - [ ] Distribute orders across time periods (for reporting)
   - [ ] Optimize seeder for performance (batch inserts)

5. **Seeder Runner**
   - [x] Seeder infrastructure exists (`seeders/index.ts`)
   - [x] Seeder utilities created (`seeders/utils/helpers.ts` with `createSeeder`)
   - [x] Faker.js integrated
   - [x] Seeders for restaurants, menu categories, and menu items created
   - [x] Update `seeders/index.ts` to run all seeders in order
   - [x] Add options for count and clearExisting
   - [ ] Test seeder execution
   - [ ] Verify 10,000+ orders are created (pending Order model)

6. **Seeder Tests**
   - [ ] Test individual seeders
   - [ ] Test seeder runner
   - [ ] Verify data integrity after seeding

**Commit**: `feat(seeders): implement database seeders with Faker.js for 10,000+ orders`

---

### Phase 1 Documentation

#### Tasks
1. **API Documentation**
   - [x] Update Postman collection with restaurant, category, and menu item endpoints
   - [x] Add request/response examples
   - [ ] Document error responses (partially done)
   - [x] Add pagination examples

2. **Code Documentation**
   - [ ] Add JSDoc comments to controllers
   - [ ] Document validation schemas
   - [ ] Document business logic functions

**Commit**: `docs(api): update API documentation for menu and order endpoints`

---

## Phase 2: Authentication & Authorization

**Goal**: Implement secure JWT-based authentication with refresh token rotation and route protection.

### Module 2.1: User Model & Registration

#### Tasks
1. **User Model Implementation**
   - [ ] Complete User Sequelize model
   - [ ] Add password hashing (bcrypt) hooks
   - [ ] Add email uniqueness validation
   - [ ] Add password strength validation (if needed)
   - [ ] Test model creation

2. **Registration Validation**
   - [ ] Create Zod schema for registration
   - [ ] Validate email format
   - [ ] Validate password requirements
   - [ ] Add meaningful error messages

3. **Registration Controller**
   - [ ] `register()` - Create new user
   - [ ] Hash password before saving
   - [ ] Handle duplicate email errors
   - [ ] Return user data (exclude password)

4. **Registration Route**
   - [ ] `POST /api/auth/register`
   - [ ] Add validation middleware
   - [ ] Test endpoint

5. **Registration Tests**
   - [ ] Test successful registration
   - [ ] Test duplicate email handling
   - [ ] Test validation errors
   - [ ] Test password hashing

**Commit**: `feat(auth): implement user registration with validation`

---

### Module 2.2: JWT Authentication (Login)

#### Tasks
1. **JWT Utilities**
   - [ ] Install jsonwebtoken and types
   - [ ] Create JWT utility functions:
     - [ ] `generateAccessToken()` - Short-lived (15-60 min)
     - [ ] `generateRefreshToken()` - Long-lived (7-30 days)
     - [ ] `verifyToken()` - Verify JWT tokens
   - [ ] Store JWT secrets in environment variables
   - [ ] Configure token expiration times

2. **RefreshToken Model**
   - [ ] Verify RefreshToken Sequelize model
   - [ ] Add token hashing logic
   - [ ] Add expiration and revocation logic
   - [ ] Test model operations

3. **Login Controller**
   - [ ] `login()` - Authenticate user
   - [ ] Verify password (bcrypt.compare)
   - [ ] Generate access and refresh tokens
   - [ ] Save refresh token to database (hashed)
   - [ ] Return tokens and user data

4. **Login Route**
   - [ ] `POST /api/auth/login`
   - [ ] Add validation middleware
   - [ ] Test endpoint

5. **Login Tests**
   - [ ] Test successful login
   - [ ] Test invalid credentials
   - [ ] Test token generation
   - [ ] Test refresh token storage

**Commit**: `feat(auth): implement JWT login with access and refresh tokens`

---

### Module 2.3: Refresh Token Rotation

#### Tasks
1. **Refresh Token Controller**
   - [ ] `refreshToken()` - Exchange refresh token for new access token
   - [ ] Validate refresh token (exists, not expired, not revoked)
   - [ ] Generate new access token
   - [ ] Optionally rotate refresh token (security best practice)
   - [ ] Update lastUsedAt timestamp
   - [ ] Return new tokens

2. **Refresh Token Route**
   - [ ] `POST /api/auth/refresh`
   - [ ] Add validation middleware
   - [ ] Test endpoint

3. **Token Rotation Logic**
   - [ ] Revoke old refresh token when rotating
   - [ ] Issue new refresh token
   - [ ] Store device info (optional)
   - [ ] Handle concurrent refresh attempts

4. **Refresh Token Tests**
   - [ ] Test successful token refresh
   - [ ] Test expired token handling
   - [ ] Test revoked token handling
   - [ ] Test token rotation

**Commit**: `feat(auth): implement refresh token rotation`

---

### Module 2.4: Authentication Middleware

#### Tasks
1. **Auth Middleware Implementation**
   - [ ] Create `authenticate` middleware
   - [ ] Extract token from Authorization header
   - [ ] Verify access token (JWT)
   - [ ] Attach user to request object
   - [ ] Handle token errors (expired, invalid)

2. **Optional Auth Middleware**
   - [ ] Create `optionalAuth` middleware (for endpoints that work with or without auth)
   - [ ] Attach user if token valid, but don't require it

3. **Middleware Tests**
   - [ ] Test successful authentication
   - [ ] Test missing token
   - [ ] Test invalid token
   - [ ] Test expired token
   - [ ] Test user attachment to request

**Commit**: `feat(auth): implement authentication middleware for route protection`

---

### Module 2.5: Protected Routes & User Management

#### Tasks
1. **Update Existing Routes**
   - [ ] Protect order routes with auth middleware
   - [ ] Ensure users can only access their own orders
   - [ ] Update user orders endpoint to use authenticated user

2. **User Profile Endpoints**
   - [ ] `GET /api/auth/me` - Get current user profile
   - [ ] `PUT /api/auth/me` - Update user profile
   - [ ] `PUT /api/auth/password` - Change password
   - [ ] Protect all with auth middleware

3. **Logout Endpoint**
   - [ ] `POST /api/auth/logout` - Revoke refresh token
   - [ ] `POST /api/auth/logout-all` - Revoke all user's tokens
   - [ ] Protect with auth middleware

4. **User Seeder**
   - [ ] Create user seeder with Faker.js
   - [ ] Generate test users with hashed passwords
   - [ ] Add to seeder runner

5. **Protected Routes Tests**
   - [ ] Test protected endpoints with valid token
   - [ ] Test protected endpoints without token
   - [ ] Test user isolation (can't access other users' data)
   - [ ] Test logout functionality

**Commit**: `feat(auth): protect routes and add user management endpoints`

---

### Phase 2 Documentation

#### Tasks
1. **Auth API Documentation**
   - [ ] Update Postman collection with auth endpoints
   - [ ] Document token usage in requests
   - [ ] Add authentication examples
   - [ ] Document error responses

2. **Security Documentation**
   - [ ] Document JWT implementation details
   - [ ] Document token rotation strategy
   - [ ] Document security best practices

**Commit**: `docs(auth): update API documentation for authentication endpoints`

---

## Phase 3: Reporting

**Goal**: Implement reporting APIs for sales analytics and top-selling items.

### Module 3.1: Sales Reports

#### Tasks
1. **Sales Validation Schemas**
   - [ ] Create Zod schemas for:
     - [ ] Date range validation
     - [ ] Time period selection (day/week/month)
     - [ ] Status filtering
     - [ ] Pagination parameters

2. **Sales Service Layer**
   - [ ] Create ReportingService or SalesService
   - [ ] `getSalesByDay()` - Aggregate sales by day
   - [ ] `getSalesByWeek()` - Aggregate sales by week
   - [ ] `getSalesByMonth()` - Aggregate sales by month
   - [ ] Optimize queries with proper indexes
   - [ ] Handle date range filtering
   - [ ] Handle status filtering

3. **Sales Controller**
   - [ ] `getSalesReport()` - Get sales report by time period
   - [ ] Accept query parameters (period, startDate, endDate, status)
   - [ ] Return formatted sales data
   - [ ] Handle errors

4. **Sales Routes**
   - [ ] `GET /api/reports/sales` - Get sales report
   - [ ] Query params: `period` (day/week/month), `startDate`, `endDate`, `status`, `page`, `limit`
   - [ ] Add validation middleware
   - [ ] Test with various date ranges

5. **Sales Tests**
   - [ ] Test sales aggregation by day/week/month
   - [ ] Test date range filtering
   - [ ] Test status filtering
   - [ ] Test pagination
   - [ ] Test with 10,000+ orders dataset

**Commit**: `feat(reports): implement sales reporting APIs with time period aggregation`

---

### Module 3.2: Top-Selling Items Reports

#### Tasks
1. **Top Items Validation Schemas**
   - [ ] Create Zod schemas for:
     - [ ] Sort by (quantity or revenue)
     - [ ] Date range
     - [ ] Restaurant filtering (optional)
     - [ ] Pagination

2. **Top Items Service Layer**
   - [ ] `getTopSellingItemsByQuantity()` - Sort by quantity sold
   - [ ] `getTopSellingItemsByRevenue()` - Sort by revenue
   - [ ] Join OrderItems → MenuItems → Restaurants
   - [ ] Filter by date range
   - [ ] Filter by order status (exclude cancelled)
   - [ ] Optimize with proper indexes
   - [ ] Support restaurant filtering

3. **Top Items Controller**
   - [ ] `getTopSellingItems()` - Get top items report
   - [ ] Accept query parameters (sortBy, startDate, endDate, restaurantId, page, limit)
   - [ ] Return formatted items data
   - [ ] Handle errors

4. **Top Items Routes**
   - [ ] `GET /api/reports/top-items` - Get top-selling items
   - [ ] Query params: `sortBy` (quantity|revenue), `startDate`, `endDate`, `restaurantId`, `page`, `limit`
   - [ ] Add validation middleware
   - [ ] Test with various filters

5. **Top Items Tests**
   - [ ] Test sorting by quantity
   - [ ] Test sorting by revenue
   - [ ] Test date range filtering
   - [ ] Test restaurant filtering
   - [ ] Test pagination
   - [ ] Test with 10,000+ orders dataset

**Commit**: `feat(reports): implement top-selling items reporting APIs`

---

### Module 3.3: Average Order Value Reports

#### Tasks
1. **AOV Validation Schemas**
   - [ ] Create Zod schemas for:
     - [ ] Time period (day/week/month)
     - [ ] Date range
     - [ ] Restaurant filtering (optional)
     - [ ] Status filtering

2. **AOV Service Layer**
   - [ ] `getAverageOrderValue()` - Calculate AOV
   - [ ] Aggregate by time period
   - [ ] Filter by date range
   - [ ] Filter by status (exclude cancelled)
   - [ ] Support restaurant filtering
   - [ ] Include min/max order values
   - [ ] Optimize queries

3. **AOV Controller**
   - [ ] `getAverageOrderValue()` - Get AOV report
   - [ ] Accept query parameters (period, startDate, endDate, restaurantId, status)
   - [ ] Return AOV data with statistics
   - [ ] Handle errors

4. **AOV Routes**
   - [ ] `GET /api/reports/average-order-value` - Get AOV report
   - [ ] Query params: `period`, `startDate`, `endDate`, `restaurantId`, `status`, `page`, `limit`
   - [ ] Add validation middleware
   - [ ] Test with various parameters

5. **AOV Tests**
   - [ ] Test AOV calculation by time period
   - [ ] Test date range filtering
   - [ ] Test restaurant filtering
   - [ ] Test with 10,000+ orders dataset

**Commit**: `feat(reports): implement average order value reporting APIs`

---

### Module 3.4: Reporting Advanced Features

#### Tasks
1. **Advanced Querying Support**
   - [ ] Implement sorting by priority (multiple sort fields)
   - [ ] Enhance date range filtering
   - [ ] Add more filtering options (restaurant, status combinations)
   - [ ] Optimize complex queries

2. **Reporting Performance Optimization**
   - [ ] Review query performance with 10,000+ orders
   - [ ] Add database indexes if needed
   - [ ] Consider query caching for common reports (optional)
   - [ ] Optimize JOIN operations

3. **Reporting Tests**
   - [ ] Test advanced filtering combinations
   - [ ] Test sorting options
   - [ ] Performance tests with large datasets
   - [ ] Test edge cases (no data, empty results)

**Commit**: `feat(reports): add advanced querying and optimize performance`

---

### Phase 3 Documentation

#### Tasks
1. **Reporting API Documentation**
   - [ ] Update Postman collection with reporting endpoints
   - [ ] Document all query parameters
   - [ ] Add example requests/responses
   - [ ] Document date range formats
   - [ ] Document sorting and filtering options

2. **Reporting Query Documentation**
   - [ ] Reference reporting-queries.md in API docs
   - [ ] Document performance considerations

**Commit**: `docs(reports): update API documentation for reporting endpoints`

---

## Final Phase: Testing, CI/CD, and Code Quality

### Module 4.1: Comprehensive Testing

#### Tasks
1. **Test Coverage**
   - [ ] Ensure >80% test coverage
   - [ ] Add missing unit tests
   - [ ] Add missing integration tests
   - [ ] Test error scenarios
   - [ ] Test edge cases

2. **End-to-End Tests**
   - [ ] Test complete user flows
   - [ ] Test order placement flow
   - [ ] Test authentication flow
   - [ ] Test reporting flow

3. **Performance Tests**
   - [ ] Test with 10,000+ orders
   - [ ] Measure query performance
   - [ ] Test pagination performance
   - [ ] Test report generation speed

**Commit**: `test: add comprehensive test coverage`

---

### Module 4.2: CI/CD Finalization

#### Tasks
1. **GitHub Actions Workflow**
   - [ ] Complete CI workflow:
     - [ ] Run tests on PR/push
     - [ ] Run linting
     - [ ] Run type checking
     - [ ] Setup test database
     - [ ] Report test coverage
   - [ ] Add CI badges to README

2. **Deployment Preparation** (if needed)
   - [ ] Setup deployment workflow (optional)
   - [ ] Environment variable documentation

**Commit**: `ci: finalize CI/CD pipeline with full test and lint checks`

---

### Module 4.3: Code Quality & Documentation

#### Tasks
1. **Code Quality**
   - [ ] Run final linting pass
   - [ ] Fix any linting errors
   - [ ] Ensure consistent code style
   - [ ] Review error handling across all modules

2. **Documentation Review**
   - [ ] Review all API documentation
   - [ ] Update README with setup instructions
   - [ ] Document environment variables
   - [ ] Add API usage examples
   - [ ] Review database documentation

3. **Type Safety**
   - [ ] Ensure no `any` types (unless necessary)
   - [ ] Add missing type definitions
   - [ ] Verify TypeScript strict mode compliance

**Commit**: `chore: final code quality improvements and documentation review`

---

## Implementation Guidelines

### For Each Module:

1. **Before Starting**
   - Review the task list
   - Understand dependencies
   - Check existing code structure

2. **During Implementation**
   - Write code following project conventions
   - Add tests as you go
   - Keep commits atomic and focused
   - Document as you code (JSDoc comments)

3. **Before Committing**
   - Run tests (`npm test`)
   - Run linter (`npm run lint`)
   - Check TypeScript compilation (`npm run build`)
   - Review your changes
   - Update documentation if needed

4. **Commit Message Format**
   - Follow Conventional Commits with Gitmoji
   - Format: `type(scope): :gitmoji: description`
   - Be descriptive but concise

### Testing Strategy

- **Unit Tests**: Test individual functions, models, validations
- **Integration Tests**: Test API endpoints end-to-end
- **Performance Tests**: Test with large datasets (10,000+ orders)
- **Error Tests**: Test error handling and edge cases

### Code Quality Checklist

- ✅ TypeScript strict mode enabled
- ✅ No `any` types (unless justified)
- ✅ All functions have proper error handling
- ✅ All endpoints have validation
- ✅ All endpoints have tests
- ✅ Meaningful error messages
- ✅ Proper HTTP status codes
- ✅ Consistent code style

---

## Quick Reference: Module Commit Order

### Completed ✅
1. ✅ `chore: initialize Express TypeScript backend with Sequelize`
2. ✅ `docs(database): add comprehensive database schema documentation`
3. ✅ `feat(seeders): add database seeding infrastructure with Faker.js`
4. ✅ `docs: add implementation plan, QA checklist, and documentation structure`
5. ✅ `feat(menu): implement restaurant, menu category and menu item CRUD APIs with validation`
6. ✅ `feat(api): implement complete CRUD operations and pagination`
7. ✅ `feat(restaurants): :zap: add automated restaurant rating calculation from menu items`

### In Progress / Next Steps
8. `feat(orders): implement order management APIs with calculations and validation`
9. `feat(seeders): complete database seeders with Faker.js for 10,000+ orders` (pending Order model)
10. `docs(api): update API documentation for menu and order endpoints`
11. `feat(auth): implement user registration with validation`
12. `feat(auth): implement JWT login with access and refresh tokens`
13. `feat(auth): implement refresh token rotation`
14. `feat(auth): implement authentication middleware for route protection`
15. `feat(auth): protect routes and add user management endpoints`
16. `docs(auth): update API documentation for authentication endpoints`
17. `feat(reports): implement sales reporting APIs with time period aggregation`
18. `feat(reports): implement top-selling items reporting APIs`
19. `feat(reports): implement average order value reporting APIs`
20. `feat(reports): add advanced querying and optimize performance`
21. `docs(reports): update API documentation for reporting endpoints`
22. `test: add comprehensive test coverage`
23. `ci: finalize CI/CD pipeline with full test and lint checks`
24. `chore: final code quality improvements and documentation review`

---

## Notes

- Each module can be implemented independently within its phase
- Test thoroughly before moving to the next module
- Keep commits focused on single features/modules
- Update documentation incrementally
- Follow the existing code patterns and conventions

