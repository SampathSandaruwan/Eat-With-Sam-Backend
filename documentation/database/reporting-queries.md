# Reporting Query Patterns

This document outlines common query patterns for generating reports based on the database schema. These patterns support the reporting API requirements for sales analysis, top-selling items, and average order value calculations.

## Table of Contents

- [Total Sales by Time Period](#total-sales-by-time-period)
- [Top-Selling Items](#top-selling-items)
- [Average Order Value](#average-order-value)
- [Filtering and Sorting](#filtering-and-sorting)
- [Performance Considerations](#performance-considerations)

---

## Total Sales by Time Period

### Sales by Day

```sql
SELECT 
    DATE(placedAt) as date,
    COUNT(*) as orderCount,
    SUM(totalAmount) as totalSales,
    SUM(subtotal) as totalSubtotal,
    SUM(deliveryFee) as totalDeliveryFees,
    SUM(taxAmount) as totalTax
FROM Orders
WHERE placedAt BETWEEN ? AND ?
GROUP BY DATE(placedAt)
ORDER BY date DESC;
```

### Sales by Week

```sql
SELECT 
    YEAR(placedAt) as year,
    WEEK(placedAt) as week,
    COUNT(*) as orderCount,
    SUM(totalAmount) as totalSales
FROM Orders
WHERE placedAt BETWEEN ? AND ?
GROUP BY YEAR(placedAt), WEEK(placedAt)
ORDER BY year DESC, week DESC;
```

### Sales by Month

```sql
SELECT 
    YEAR(placedAt) as year,
    MONTH(placedAt) as month,
    COUNT(*) as orderCount,
    SUM(totalAmount) as totalSales,
    AVG(totalAmount) as averageOrderValue
FROM Orders
WHERE placedAt BETWEEN ? AND ?
GROUP BY YEAR(placedAt), MONTH(placedAt)
ORDER BY year DESC, month DESC;
```

---

## Top-Selling Items

### By Quantity

```sql
SELECT 
    d.id,
    d.name,
    d.restaurantId,
    r.name as restaurantName,
    SUM(oi.quantity) as totalQuantitySold,
    COUNT(DISTINCT oi.orderId) as orderCount
FROM OrderItems oi
INNER JOIN Dishes d ON oi.dishId = d.id
INNER JOIN Restaurants r ON d.restaurantId = r.id
INNER JOIN Orders o ON oi.orderId = o.id
WHERE o.placedAt BETWEEN ? AND ?
    AND o.status != 'cancelled'
GROUP BY d.id, d.name, d.restaurantId, r.name
ORDER BY totalQuantitySold DESC
LIMIT ? OFFSET ?;
```

### By Revenue

```sql
SELECT 
    d.id,
    d.name,
    d.restaurantId,
    r.name as restaurantName,
    SUM(oi.subtotal) as totalRevenue,
    SUM(oi.quantity) as totalQuantitySold,
    COUNT(DISTINCT oi.orderId) as orderCount
FROM OrderItems oi
INNER JOIN Dishes d ON oi.dishId = d.id
INNER JOIN Restaurants r ON d.restaurantId = r.id
INNER JOIN Orders o ON oi.orderId = o.id
WHERE o.placedAt BETWEEN ? AND ?
    AND o.status != 'cancelled'
GROUP BY d.id, d.name, d.restaurantId, r.name
ORDER BY totalRevenue DESC
LIMIT ? OFFSET ?;
```

### Top-Selling Items by Restaurant

```sql
SELECT 
    d.id,
    d.name,
    d.restaurantId,
    r.name as restaurantName,
    SUM(oi.subtotal) as totalRevenue,
    SUM(oi.quantity) as totalQuantitySold
FROM OrderItems oi
INNER JOIN Dishes d ON oi.dishId = d.id
INNER JOIN Restaurants r ON d.restaurantId = r.id
INNER JOIN Orders o ON oi.orderId = o.id
WHERE o.restaurantId = ?
    AND o.placedAt BETWEEN ? AND ?
    AND o.status != 'cancelled'
GROUP BY d.id, d.name, d.restaurantId, r.name
ORDER BY totalRevenue DESC
LIMIT ? OFFSET ?;
```

---

## Average Order Value

### AOV by Time Period (Day/Week/Month)

```sql
SELECT 
    DATE(placedAt) as date,
    COUNT(*) as orderCount,
    AVG(totalAmount) as averageOrderValue,
    MIN(totalAmount) as minOrderValue,
    MAX(totalAmount) as maxOrderValue,
    SUM(totalAmount) as totalSales
FROM Orders
WHERE placedAt BETWEEN ? AND ?
    AND status != 'cancelled'
GROUP BY DATE(placedAt)
ORDER BY date DESC;
```

### AOV by Restaurant

```sql
SELECT 
    r.id as restaurantId,
    r.name as restaurantName,
    COUNT(o.id) as orderCount,
    AVG(o.totalAmount) as averageOrderValue,
    SUM(o.totalAmount) as totalSales
FROM Orders o
INNER JOIN Restaurants r ON o.restaurantId = r.id
WHERE o.placedAt BETWEEN ? AND ?
    AND o.status != 'cancelled'
GROUP BY r.id, r.name
ORDER BY averageOrderValue DESC;
```

### AOV Overall (with date range)

```sql
SELECT 
    COUNT(*) as orderCount,
    AVG(totalAmount) as averageOrderValue,
    SUM(totalAmount) as totalSales,
    MIN(totalAmount) as minOrderValue,
    MAX(totalAmount) as maxOrderValue
FROM Orders
WHERE placedAt BETWEEN ? AND ?
    AND status != 'cancelled';
```

---

## Filtering and Sorting

### Filter by Order Status

Add `AND o.status = ?` to any query filtering orders:

```sql
SELECT 
    DATE(placedAt) as date,
    SUM(totalAmount) as totalSales
FROM Orders
WHERE placedAt BETWEEN ? AND ?
    AND status = ?  -- e.g., 'delivered', 'cancelled', etc.
GROUP BY DATE(placedAt);
```

### Sort by Priority

Sorting options depend on the report type:

**For Sales Reports:**
- `ORDER BY totalSales DESC` - Highest revenue first
- `ORDER BY orderCount DESC` - Most orders first
- `ORDER BY date DESC` - Most recent first

**For Top-Selling Items:**
- `ORDER BY totalQuantitySold DESC` - By quantity
- `ORDER BY totalRevenue DESC` - By revenue
- `ORDER BY orderCount DESC` - By number of orders

**For AOV Reports:**
- `ORDER BY averageOrderValue DESC` - Highest AOV first
- `ORDER BY totalSales DESC` - Highest total sales first

### Date Range Filtering

All queries use `placedAt BETWEEN ? AND ?` for date range filtering:

```sql
WHERE placedAt BETWEEN ? AND ?
    AND status != 'cancelled'
```

**Best Practice**: Always exclude cancelled orders from revenue calculations unless specifically requested.

### Pagination

Add `LIMIT ? OFFSET ?` for pagination:

```sql
ORDER BY totalRevenue DESC
LIMIT 20 OFFSET 0;  -- First page, 20 items per page
```

**Note**: For large datasets, consider cursor-based pagination for better performance.

---

## Performance Considerations

### Indexes Used

The following indexes optimize reporting queries:

1. **Orders Table:**
   - `placedAt` - For date range filtering
   - `status` - For status filtering
   - `(userId, placedAt)` - Composite index for user-specific queries
   - `restaurantId` - For restaurant-specific queries

2. **OrderItems Table:**
   - `orderId` - For joining with Orders
   - `dishId` - For joining with Dishes
   - `(orderId, dishId)` - Composite index for order detail queries

3. **Dishes Table:**
   - `restaurantId` - For restaurant-specific dish queries

### Query Optimization Tips

1. **Always filter by date range** - Use indexes on `placedAt`
2. **Exclude cancelled orders** - Reduces dataset size (`status != 'cancelled'`)
3. **Use aggregate functions** - Let the database do calculations
4. **Limit result sets** - Use `LIMIT` for top-N queries
5. **Select only needed columns** - Avoid `SELECT *` in production

### Handling Large Datasets (10,000+ Orders)

For datasets with 10,000+ orders:

1. **Batch Processing**: Process reports in time-based chunks
2. **Caching**: Cache frequently accessed reports (e.g., daily sales)
3. **Materialized Views**: Consider materialized views for complex aggregations (MySQL doesn't support directly, but can use scheduled table updates)
4. **Background Jobs**: Generate reports asynchronously for large date ranges

### Example: Efficient Top Items Query

```sql
-- Use subquery to filter orders first, then join
SELECT 
    d.id,
    d.name,
    SUM(oi.subtotal) as totalRevenue
FROM OrderItems oi
INNER JOIN (
    SELECT id FROM Orders 
    WHERE placedAt BETWEEN ? AND ? 
        AND status != 'cancelled'
) o ON oi.orderId = o.id
INNER JOIN Dishes d ON oi.dishId = d.id
GROUP BY d.id, d.name
ORDER BY totalRevenue DESC
LIMIT 20;
```

This approach first filters orders (uses index on `placedAt` and `status`), then joins with order items, reducing the join operation size.

---

## API Integration Notes

When implementing reporting endpoints:

1. **Date Range Validation**: Ensure start date <= end date
2. **Default Date Range**: If not provided, use last 30 days
3. **Status Filter**: Accept comma-separated status values (e.g., "delivered,out_for_delivery")
4. **Pagination**: Always implement pagination for list endpoints
5. **Response Format**: Include metadata (total count, page info) in responses
6. **Error Handling**: Validate date formats and status values

### Example Response Structure

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  },
  "filters": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "status": "delivered"
  }
}
```

