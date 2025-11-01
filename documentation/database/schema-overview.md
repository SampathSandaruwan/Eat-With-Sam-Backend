# Database Schema Overview

This document provides a comprehensive overview of the database schema, entity relationships, and design decisions for the EatWithSam food delivery system.

## Entity Relationship Summary

The database consists of 8 core entities with the following relationships:

### One-to-Many Relationships

1. **Users → Orders**: A user can place multiple orders
2. **Users → Ratings**: A user can rate multiple menu items
3. **Users → RefreshTokens**: A user can have multiple refresh tokens (for device management)
4. **Restaurants → MenuCategories**: Each restaurant has multiple menu categories
5. **Restaurants → Orders**: A restaurant receives multiple orders
6. **MenuCategories → MenuItems**: Each category contains multiple menu items
7. **Orders → OrderItems**: Each order contains multiple order items
8. **MenuItems → OrderItems**: The same menu item can appear in multiple orders
9. **MenuItems → Ratings**: A menu item can receive multiple ratings

### Many-to-One Relationships

All one-to-many relationships have corresponding many-to-one relationships:
- **OrderItems → MenuItems**: Many order items reference the same menu item
- **OrderItems → Orders**: Many order items belong to the same order
- And all reverse relationships of the one-to-many relationships listed above

## Detailed Relationship Explanations

### Users → Orders (One-to-Many)

**Purpose**: Track which user placed each order.

**Implementation**: 
- `Orders` table has `userId` foreign key
- Allows querying all orders by a user
- Enables order history for customers

**Example**:
- User #1 places Order #100, Order #150, Order #200
- All three orders have `userId = 1`

---

### Restaurants → MenuCategories (One-to-Many)

**Purpose**: Each restaurant organizes its own menu using categories.

**Why Restaurant-Specific**: Categories are specific to each restaurant. Restaurant A might have "Starters", "Mains", "Desserts", while Restaurant B might have "Appetizers", "Entrees", "Beverages". This allows flexibility and restaurant-specific menu organization.

**Implementation**:
- `MenuCategories` table has `restaurantId` foreign key
- Each category belongs to exactly one restaurant
- Enables restaurant-specific menu browsing

**Example**:
- Restaurant #5 has categories: "Appetizers", "Main Course", "Desserts", "Drinks"
- All categories have `restaurantId = 5`

---

### MenuCategories → MenuItems (One-to-Many)

**Purpose**: Organize menu items into logical categories.

**Implementation**:
- `MenuItems` table has `categoryId` foreign key
- Menu items are grouped by category for display
- Supports menu navigation by category

**Example**:
- Category "Main Course" contains: "Chicken Burger", "Beef Steak", "Fish & Chips"
- All items have `categoryId = "main-course-id"`

---

### Orders → OrderItems (One-to-Many)

**Purpose**: An order contains multiple items with quantities and pricing.

**Implementation**:
- `OrderItems` table has `orderId` foreign key
- Each order item stores quantity, price snapshot, and subtotal
- Allows detailed order breakdown

**Example**:
- Order #1 contains:
  - 2x Chicken Burger (£12.99 each)
  - 1x Large Fries (£4.99)
  - 3x Cola (£2.50 each)

---

### OrderItems → MenuItems (Many-to-One)

**Purpose**: Link order items to the menu items they represent.

**Why Many-to-One**: The same menu item (e.g., "Chicken Burger") can appear in many different orders. This normalizes data and allows:
- Tracking popular items across all orders
- Maintaining referential integrity
- Price consistency (with snapshot for historical accuracy)

**Implementation**:
- `OrderItems` table has `menuItemId` foreign key
- Many order items can reference the same menu item
- Price snapshot stored in OrderItem for historical accuracy (prices may change)

**Example**:
- MenuItem #101: "Chicken Burger" (£12.99)
- Order #1, OrderItem #1: `menuItemId = 101`, quantity = 2
- Order #2, OrderItem #1: `menuItemId = 101`, quantity = 1
- Order #3, OrderItem #1: `menuItemId = 101`, quantity = 3

All reference the same menu item, enabling analytics like "most ordered item".

---

### MenuItems → Ratings (One-to-Many)

**Purpose**: Allow users to rate and review menu items.

**Implementation**:
- `Ratings` table has `menuItemId` foreign key
- Multiple users can rate the same menu item
- Supports average rating calculations

**Example**:
- MenuItem "Chicken Burger" receives ratings: 5, 4, 5, 3, 5
- Average rating: 4.4 stars

---

### Users → RefreshTokens (One-to-Many)

**Purpose**: Support JWT refresh token rotation and multi-device login.

**Implementation**:
- `RefreshTokens` table has `userId` foreign key
- Stores refresh tokens for token rotation
- Allows multiple active sessions per user

**Example**:
- User #1 logged in on phone, tablet, and browser
- Three refresh tokens exist for `userId = 1`

## Database Design Principles

### 1. Normalization
- Data is normalized to reduce redundancy
- Menu item details stored once, referenced by orders
- Category organization per restaurant, not global

### 2. Historical Data Integrity
- OrderItems store `priceAtOrder` to maintain historical pricing
- Menu item prices can change, but past orders retain original price

### 3. Referential Integrity
- Foreign key constraints ensure data consistency
- Cannot create order for non-existent user or restaurant
- Cannot create order item for non-existent menu item

### 4. Performance Optimization
- Indexes on foreign keys for fast joins
- Indexes on frequently queried fields (status, dates)
- Optimized for queries with 10,000+ orders

## Table Summary

| Table | Primary Purpose | Key Fields |
|-------|----------------|------------|
| **Users** | Customer accounts | id, email, passwordHash |
| **RefreshTokens** | JWT token storage | id, token, userId, expiresAt |
| **Restaurants** | Restaurant information | id, name, address, cuisineType |
| **MenuCategories** | Menu organization | id, name, restaurantId |
| **MenuItems** | Food items/products | id, name, price, categoryId, restaurantId |
| **Orders** | Order headers | id, userId, restaurantId, status, totalAmount |
| **OrderItems** | Order line items | id, orderId, menuItemId, quantity, priceAtOrder |
| **Ratings** | Reviews/ratings | id, userId, menuItemId, rating, comment |

For detailed table schemas, see the individual table documentation files in the [tables](./tables/) directory.

