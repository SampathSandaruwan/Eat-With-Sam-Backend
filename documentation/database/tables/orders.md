# Orders Tables

This document covers both **Orders** and **OrderItems** tables, which work together to manage order processing and order details.

## Orders Table

### Purpose

Stores order headers with customer information, restaurant details, order status, and totals.

### Schema

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT (AUTO_INCREMENT) | PRIMARY KEY | Unique order identifier |
| `orderNumber` | VARCHAR(50) | UNIQUE, NOT NULL | Human-readable order number (e.g., "ORD-2024-001234") |
| `userId` | INT | NOT NULL, FOREIGN KEY | Customer who placed the order |
| `restaurantId` | INT | NOT NULL, FOREIGN KEY | Restaurant fulfilling the order |
| `status` | ENUM | NOT NULL, DEFAULT 'pending' | Order status (see Status Values) |
| `totalAmount` | DECIMAL(10, 2) | NOT NULL | Total order amount including items, delivery fee, tax |
| `subtotal` | DECIMAL(10, 2) | NOT NULL | Subtotal of all items (before fees) |
| `deliveryFee` | DECIMAL(10, 2) | DEFAULT 0.00 | Delivery fee charged |
| `taxAmount` | DECIMAL(10, 2) | DEFAULT 0.00 | Tax amount |
| `deliveryAddress` | TEXT | NOT NULL | Delivery address (snapshot at order time) |
| `deliveryInstructions` | TEXT | | Special delivery instructions |
| `estimatedDeliveryTime` | DATETIME | | Estimated delivery timestamp |
| `actualDeliveryTime` | DATETIME | | Actual delivery timestamp |
| `placedAt` | DATETIME | NOT NULL | Order placement timestamp |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp |

### Status Values

| Status | Description |
|--------|-------------|
| `pending` | Order placed, awaiting confirmation |
| `confirmed` | Restaurant confirmed the order |
| `preparing` | Restaurant is preparing the order |
| `ready` | Order is ready for pickup/delivery |
| `out_for_delivery` | Order is being delivered |
| `delivered` | Order successfully delivered |
| `cancelled` | Order was cancelled |

### Indexes

- **PRIMARY KEY** on `id`
- **UNIQUE INDEX** on `orderNumber` (for order lookup)
- **INDEX** on `userId` (foreign key, for user order history)
- **INDEX** on `restaurantId` (foreign key, for restaurant orders)
- **INDEX** on `status` (for filtering by status)
- **INDEX** on `placedAt` (for date range queries)
- **COMPOSITE INDEX** on `(userId, placedAt)` (for user order history with sorting)

### Relationships

- **Orders → Users** (Many-to-One)
  - Foreign key: `userId` references `Users.id`
  - Cascade: Restrict delete (cannot delete user with orders)

- **Orders → Restaurants** (Many-to-One)
  - Foreign key: `restaurantId` references `Restaurants.id`
  - Cascade: Restrict delete (cannot delete restaurant with orders)

- **Orders → OrderItems** (One-to-Many)
  - Foreign key: `OrderItems.orderId`
  - Cascade: Delete order items when order is deleted

### Example Data

```sql
id | orderNumber    | userId | restaurantId | status           | totalAmount | placedAt
---|----------------|--------|--------------|------------------|-------------|-------------------
1  | ORD-2024-001234| 1      | 1            | delivered        | 45.97       | 2024-01-20 12:30:00
2  | ORD-2024-001235| 2      | 2            | out_for_delivery | 32.50       | 2024-01-20 13:15:00
3  | ORD-2024-001236| 1      | 3            | preparing        | 18.99       | 2024-01-20 14:00:00
```

---

## OrderItems Table

### Purpose

Stores individual line items within an order, including quantity, price snapshot, and subtotal.

### Schema

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT (AUTO_INCREMENT) | PRIMARY KEY | Unique order item identifier |
| `orderId` | INT | NOT NULL, FOREIGN KEY | Parent order |
| `dishId` | INT | NOT NULL, FOREIGN KEY | Dish being ordered |
| `quantity` | INT | NOT NULL, DEFAULT 1 | Quantity ordered |
| `priceAtOrder` | DECIMAL(10, 2) | NOT NULL | Dish price at time of order |
| `subtotal` | DECIMAL(10, 2) | NOT NULL | Line total (quantity × priceAtOrder) |
| `specialInstructions` | TEXT | | Item-specific instructions |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp |

### Indexes

- **PRIMARY KEY** on `id`
- **INDEX** on `orderId` (foreign key)
- **INDEX** on `dishId` (foreign key)
- **COMPOSITE INDEX** on `(orderId, dishId)` (for order detail queries)

### Relationships

- **OrderItems → Orders** (Many-to-One)
  - Foreign key: `orderId` references `Orders.id`
  - Cascade: Delete order items when order is deleted
  - Description: Many order items belong to one order

- **OrderItems → Dishes** (Many-to-One)
  - Foreign key: `dishId` references `Dishes.id`
  - Cascade: Restrict delete (cannot delete dish with order history)
  - Description: Many order items can reference the same dish

**Why OrderItems → Dishes Many-to-One**: The same dish (e.g., "Chicken Burger") can appear in many different orders. This design:
- **Normalizes data**: Dish details stored once
- **Enables analytics**: Track popular dishes across all orders
- **Maintains integrity**: Order items reference valid dishes
- **Historical pricing**: `priceAtOrder` stores price at order time (even if menu price changes later)

**Example**:
```
Dish #101: "Chicken Burger" (£12.99)

OrderItem #1: orderId=1, dishId=101, quantity=2, priceAtOrder=12.99, subtotal=25.98
OrderItem #2: orderId=2, dishId=101, quantity=1, priceAtOrder=12.99, subtotal=12.99
OrderItem #3: orderId=3, dishId=101, quantity=3, priceAtOrder=12.99, subtotal=38.97
```

All three order items reference the same dish, allowing queries like "How many Chicken Burgers were ordered?" or "What's the most popular dish?"

### Example Data

```sql
id | orderId | dishId | quantity | priceAtOrder | subtotal
---|--------|--------|----------|--------------|----------
1  | 1      | 101    | 2        | 12.99        | 25.98
2  | 1      | 205    | 1        | 4.99         | 4.99
3  | 1      | 310    | 3        | 2.50         | 7.50
4  | 2      | 101    | 1        | 12.99        | 12.99
```

## Order Calculation

Order totals are calculated as follows:

```
subtotal = SUM(orderItems.subtotal)
deliveryFee = restaurant.deliveryFee (or order-specific)
taxAmount = (subtotal + deliveryFee) * restaurant.taxRate
totalAmount = subtotal + deliveryFee + taxAmount
```

## Usage Notes

### Order Numbers
- `orderNumber` should be unique and human-readable
- Format: `ORD-YYYY-NNNNNN` or similar
- Generated at application level (not auto-increment)

### Historical Data
- `priceAtOrder` is a snapshot of dish price at order time
- Important for order accuracy even if menu prices change
- `deliveryAddress` is also a snapshot (user address may change)

#### Redundant `subtotal` Field

**Design Decision**: The `subtotal` field on Orders is technically redundant since it can be calculated by summing all `OrderItems.subtotal` values (`SELECT SUM(subtotal) FROM OrderItems WHERE orderId = ?`). However, it is kept for the following reasons:

**Reasons to Keep:**
1. **Performance**: Enables direct queries on order totals without joining and aggregating OrderItems table
2. **Reporting & Analytics**: Facilitates revenue reports, dashboard queries, and business intelligence without complex joins
3. **Data Snapshot**: Preserves order state even if OrderItems relationships are modified or need historical accuracy
4. **Query Simplicity**: Quick access to order breakdown (subtotal, fees, tax, total) in a single query

**Trade-offs:**
- **Current**: Slight redundancy but better performance for common queries and reporting
- **Alternative**: Remove and calculate on-demand from OrderItems, but requires joins/aggregations for every order query

**Future Consideration**: If order query patterns change or if storage becomes a critical concern, consider removing `subtotal` and calculating it on-demand from OrderItems. Monitor query performance and reporting needs before making this change.

### Status Management
- Order status should follow a logical flow
- Consider adding status change timestamps for audit trail
- Cancelled orders should be retained for records

### Performance
- Indexes optimized for:
  - User order history queries (`userId`, `placedAt`)
  - Restaurant order queries (`restaurantId`, `status`)
  - Order detail queries (`orderId`)
- Composite indexes support common query patterns
- Designed to handle 10,000+ orders efficiently

