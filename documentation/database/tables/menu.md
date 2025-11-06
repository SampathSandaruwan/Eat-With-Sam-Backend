# Menu Tables

This document covers both **MenuCategories** and **Dishes** tables, which work together to organize and display restaurant menus.

## MenuCategories Table

### Purpose

Organizes dishes into logical categories specific to each restaurant (e.g., "Appetizers", "Main Course", "Desserts").

### Schema

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT (AUTO_INCREMENT) | PRIMARY KEY | Unique category identifier |
| `name` | VARCHAR(100) | NOT NULL | Category name (e.g., "Starters", "Mains", "🍕 Pizza") |
| `description` | TEXT | | Optional category description |
| `displayOrder` | INT | DEFAULT 0 | Sort order for menu display |
| `restaurantId` | INT | NOT NULL, FOREIGN KEY | Parent restaurant |
| `isActive` | BOOLEAN | DEFAULT true | Category visibility status |
| `createdAt` | DATETIME | NOT NULL | Category creation timestamp |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp |

### Indexes

- **PRIMARY KEY** on `id`
- **INDEX** on `restaurantId` (foreign key)
- **INDEX** on `displayOrder` (for sorting)
- **INDEX** on `isActive` (for filtering active categories)

### Relationships

- **MenuCategories → Restaurants** (Many-to-One)
  - Foreign key: `restaurantId` references `Restaurants.id`
  - Cascade: Delete categories when restaurant is deleted
  - Description: Many categories belong to one restaurant

- **MenuCategories → Dishes** (One-to-Many)
  - Foreign key: `Dishes.categoryId`
  - Cascade: Restrict delete (cannot delete category with dishes)
  - Description: One category contains many dishes

### Example Data

```sql
id | name        | restaurantId | displayOrder | isActive
---|-------------|--------------|--------------|----------
1  | Appetizers  | 1            | 1            | true
2  | Main Course | 1            | 2            | true
3  | Desserts    | 1            | 3            | true
4  | Drinks      | 1            | 4            | true
```

---

## Dishes Table

### Purpose

Stores individual dishes/products available in restaurant menus.

### Schema

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT (AUTO_INCREMENT) | PRIMARY KEY | Unique dish identifier |
| `name` | VARCHAR(255) | NOT NULL | Item name |
| `description` | TEXT | | Item description |
| `price` | DECIMAL(10, 2) | NOT NULL | Item price |
| `imageUri` | VARCHAR(500) | | URL/path to item image |
| `kcal` | INT | | Calories per serving |
| `tags` | JSON | | Dietary tags (e.g., ["Vegan", "Spicy", "Gluten-Free"]) |
| `discountPercent` | DECIMAL(5, 2) | | Discount percentage (0-100) |
| `isAvailable` | BOOLEAN | DEFAULT true | Item availability status |
| `categoryId` | INT | NOT NULL, FOREIGN KEY | Parent category |
| `restaurantId` | INT | NOT NULL, FOREIGN KEY | Parent restaurant |
| `averageRating` | DECIMAL(9, 8) | DEFAULT 0.00000000 | Average rating (stored with high precision, display 1-2 decimals in UI) |
| `ratingCount` | INT | DEFAULT 0 | Total number of ratings |
| `createdAt` | DATETIME | NOT NULL | Item creation timestamp |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp |

### Indexes

- **PRIMARY KEY** on `id`
- **INDEX** on `categoryId` (foreign key)
- **INDEX** on `restaurantId` (foreign key)
- **INDEX** on `isAvailable` (for filtering available items)
- **INDEX** on `price` (for price range queries)
- **INDEX** on `averageRating` (for sorting by rating)

### Relationships

- **Dishes → MenuCategories** (Many-to-One)
  - Foreign key: `categoryId` references `MenuCategories.id`
  - Cascade: Restrict delete (cannot delete category with dishes)
  - Description: Many dishes belong to one category

- **Dishes → Restaurants** (Many-to-One)
  - Foreign key: `restaurantId` references `Restaurants.id`
  - Cascade: Restrict delete (cannot delete restaurant with dishes)
  - Description: Many dishes belong to one restaurant

- **Dishes → OrderItems** (One-to-Many)
  - Foreign key: `OrderItems.dishId`
  - Cascade: Restrict delete (cannot delete dish with order history)
  - Description: One dish can be referenced by many order items

- **Dishes → Ratings** (One-to-Many)
  - Foreign key: `Ratings.dishId`
  - Cascade: Delete ratings when dish is deleted
  - Description: One dish can receive many ratings

### Example Data

```sql
id | name            | price  | categoryId | restaurantId | averageRating | isAvailable
---|-----------------|--------|------------|--------------|---------------|------------
1  | Chicken Burger  | 12.99  | 2          | 1            | 4.50          | true
2  | Beef Steak      | 24.99  | 2          | 1            | 4.75          | true
3  | Caesar Salad    | 8.99   | 1          | 1            | 4.20          | true
```

### Special Fields

#### Tags (JSON)
- Stores dietary and attribute tags as JSON array
- Example: `["Vegan", "Spicy", "Gluten-Free"]`
- Allows flexible filtering by dietary requirements
- Consider using MySQL JSON functions for queries

#### Discount Percent
- When set, displays discount badge in UI
- Calculated discount: `finalPrice = price * (1 - discountPercent/100)`
- Can be used for promotional items

#### Average Rating & Rating Count
- Computed from `Ratings` table or maintained via triggers
- Used for sorting by popularity/rating
- Consider updating via application logic or database triggers
- **Precision**: Stored as `DECIMAL(9, 8)` for high precision (e.g., 4.45678901). Round to 1-2 decimals only when displaying in UI to preserve calculation accuracy
- **Validation**: See [rating precision validation script](../examples/rating-precision-validation.ts) for demonstration of precision requirements

## Usage Notes

### Category Organization
- Categories are restaurant-specific (not global)
- `displayOrder` controls menu display sequence
- Categories can be hidden via `isActive` without deleting items

### Dishes
- `price` is stored in the currency format (no currency field, assumed single currency)
- `isAvailable` allows temporarily disabling dishes (out of stock, etc.)
- `tags` JSON field allows flexible dietary filtering
- Consider caching `averageRating` to avoid frequent calculations
- **Rating Precision**: `averageRating` is stored with high precision (`DECIMAL(9, 8)`). Always round to 1-2 decimal places only in the UI/API response, never truncate in the database to maintain calculation accuracy. See [rating precision validation script](../examples/rating-precision-validation.ts) for a demonstration of why this precision is necessary.

#### Redundant `restaurantId` Field

**Design Decision**: The `restaurantId` field on Dishes is technically redundant since we can derive the restaurant through the category relationship (`Dish → MenuCategory → Restaurant`). However, it is kept for the following reasons:

**Reasons to Keep:**
1. **Performance**: Enables direct queries like "get all items from Restaurant X" without joining through categories
2. **Data Integrity**: Provides direct foreign key constraint ensuring dish belongs to restaurant
3. **Query Simplicity**: Common query pattern ("all items by restaurant") is faster with direct relationship
4. **Index Optimization**: Index on `restaurantId` enables efficient restaurant-scoped queries

**Trade-offs:**
- **Current**: Slight redundancy but better performance for common queries
- **Alternative**: Remove for full normalization, but requires joins for restaurant queries

**Future Consideration**: If query patterns change or performance requirements shift, consider removing `restaurantId` and deriving restaurant through `categoryId` for full normalization. Monitor query performance before making this change.

### Performance
- Indexes on `restaurantId` and `categoryId` enable fast menu browsing
- JSON tags may require full-text search or application-level filtering
- Consider denormalizing `averageRating` if ratings table grows large

