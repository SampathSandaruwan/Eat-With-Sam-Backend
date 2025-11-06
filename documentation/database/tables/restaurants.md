# Restaurants Table

## Purpose

Stores restaurant information including location, contact details, and operational data.

## Schema

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT (AUTO_INCREMENT) | PRIMARY KEY | Unique restaurant identifier |
| `name` | VARCHAR(255) | NOT NULL | Restaurant name |
| `description` | TEXT | | Restaurant description/bio |
| `cuisineType` | VARCHAR(100) | | Type of cuisine (e.g., "Italian", "Indian", "Fast Food") |
| `address` | TEXT | NOT NULL | Full delivery address |
| `city` | VARCHAR(100) | | City name |
| `postalCode` | VARCHAR(20) | | Postal/ZIP code |
| `latitude` | DECIMAL(10, 8) | | GPS latitude for distance calculation |
| `longitude` | DECIMAL(11, 8) | | GPS longitude for distance calculation |
| `phoneNumber` | VARCHAR(20) | | Contact phone number |
| `email` | VARCHAR(255) | | Restaurant contact email |
| `imageUri` | VARCHAR(500) | | URL/path to restaurant image |
| `deliveryTime` | INT | | Average delivery time in minutes |
| `minimumOrder` | DECIMAL(10, 2) | DEFAULT 0.00 | Minimum order amount required |
| `deliveryFee` | DECIMAL(10, 2) | DEFAULT 0.00 | Delivery fee amount |
| `taxRate` | DECIMAL(5, 4) | DEFAULT 0.0000 | Tax rate (e.g., 0.2000 = 20% tax) |
| `isActive` | BOOLEAN | DEFAULT true | Restaurant operational status |
| `openingTime` | TIME | | Daily opening time (HH:MM:SS) |
| `closingTime` | TIME | | Daily closing time (HH:MM:SS) |
| `createdAt` | DATETIME | NOT NULL | Restaurant creation timestamp |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp |

## Indexes

- **PRIMARY KEY** on `id`
- **INDEX** on `cuisineType` (for filtering by cuisine)
- **INDEX** on `city` (for location-based queries)
- **INDEX** on `isActive` (for filtering active restaurants)
- **SPATIAL INDEX** on `latitude`, `longitude` (for distance queries)

## Relationships

### One-to-Many

- **Restaurants → MenuCategories** (One-to-Many)
  - Foreign key: `MenuCategories.restaurantId`
  - Cascade: Delete categories when restaurant is deleted
  - Description: One restaurant has many menu categories

- **Restaurants → Orders** (One-to-Many)
  - Foreign key: `Orders.restaurantId`
  - Cascade: Restrict delete (cannot delete restaurant with orders)
  - Description: One restaurant receives many orders

## Example Data

```sql
id | name              | cuisineType | city      | deliveryTime | isActive
---|-------------------|-------------|-----------|--------------|----------
1  | Bella Italia      | Italian     | London    | 35           | true
2  | Spice Garden      | Indian      | London    | 30           | true
3  | Burger King       | Fast Food   | Manchester| 25           | true
```

## Location Data

- `latitude` and `longitude` are stored as DECIMAL for precision
- Used for calculating delivery distance and estimated time
- Can be used with MySQL spatial functions for proximity searches
- Consider using a spatial index (MySQL 5.7.6+) for efficient distance queries

## Usage Notes

- Restaurant name uniqueness policy: See [Business Decisions](../../business-decisions.md#restaurant-name-uniqueness) for business rules regarding duplicate restaurant names
- `deliveryTime` is an average and may vary by order
- `openingTime` and `closingTime` represent daily hours (consider adding day-specific hours later)
- `isActive` allows soft disabling restaurants without deleting data
- `taxRate` is stored as a decimal (e.g., 0.2000 = 20% tax). Used for calculating tax on orders. Each restaurant can have its own tax rate.

