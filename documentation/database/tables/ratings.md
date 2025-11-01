# Ratings Table

## Purpose

Stores user ratings and reviews for menu items, enabling customers to share feedback and helping other users make informed decisions.

## Schema

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT (AUTO_INCREMENT) | PRIMARY KEY | Unique rating identifier |
| `userId` | INT | NOT NULL, FOREIGN KEY | User who submitted the rating |
| `menuItemId` | INT | NOT NULL, FOREIGN KEY | Menu item being rated |
| `rating` | TINYINT | NOT NULL | Rating value (1-5 stars) |
| `comment` | TEXT | | Optional review text |
| `createdAt` | DATETIME | NOT NULL | Rating submission timestamp |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp |

## Indexes

- **PRIMARY KEY** on `id`
- **INDEX** on `userId` (foreign key)
- **INDEX** on `menuItemId` (foreign key)
- **COMPOSITE INDEX** on `(menuItemId, rating)` (for average rating calculations)
- **COMPOSITE INDEX** on `(userId, menuItemId)` (for querying user's ratings of a specific item)

## Relationships

- **Ratings → Users** (Many-to-One)
  - Foreign key: `userId` references `Users.id`
  - Cascade: Delete ratings when user is deleted
  - Description: Many ratings belong to one user

- **Ratings → MenuItems** (Many-to-One)
  - Foreign key: `menuItemId` references `MenuItems.id`
  - Cascade: Delete ratings when menu item is deleted
  - Description: Many ratings belong to one menu item

## Rating Values

| Rating | Meaning |
|--------|---------|
| 1 | Very Poor |
| 2 | Poor |
| 3 | Average |
| 4 | Good |
| 5 | Excellent |

## Example Data

```sql
id | userId | menuItemId | rating | comment                          | createdAt
---|--------|------------|--------|----------------------------------|-------------------
1  | 1      | 101        | 5      | "Amazing burger! Highly recommend"| 2024-01-20 15:30:00
2  | 2      | 101        | 4      | "Good taste, a bit pricey"        | 2024-01-21 10:15:00
3  | 3      | 101        | 5      | "Perfect!"                        | 2024-01-22 18:45:00
4  | 1      | 205        | 3      | "Decent fries, nothing special"   | 2024-01-23 12:00:00
```

## Average Rating Calculation

The average rating for a menu item is calculated from all ratings:

```sql
SELECT AVG(rating) as averageRating, COUNT(*) as ratingCount
FROM Ratings
WHERE menuItemId = ?
```

This value can be:
- Computed on-demand for display
- Cached in `MenuItems.averageRating` and `MenuItems.ratingCount` fields
- Updated via database triggers or application logic when ratings are added/updated

**Important**: When storing the average in `MenuItems.averageRating`, use `DECIMAL(9, 8)` for high precision. Round to 1-2 decimal places only when displaying in the UI/API response. Never truncate precision in the database to maintain calculation accuracy. See [rating precision validation script](../examples/rating-precision-validation.ts) for a demonstration of why this precision is necessary.

## Usage Notes

### Rating Constraints
- Rating must be between 1 and 5
- Consider application-level validation to enforce range
- Comment is optional (rating-only reviews are allowed)

### Multiple Ratings Over Time
- **Users can rate the same menu item multiple times** (no uniqueness constraint enforced)
- Rationale: Users may order the same item again, and food quality/delivery experience can change over time
- Each rating experience can be independent
- All ratings contribute to the menu item's average rating
- Consider application-level validation to prevent spam or limit frequency of ratings from same user

### Rating Display
- Show average rating with total count: "4.5 stars (120 reviews)"
- Consider pagination for comments in high-volume items
- Filter ratings by value for user filtering (e.g., "Show only 5-star reviews")

### Performance
- Indexes optimized for:
  - Finding all ratings for a menu item (`menuItemId`)
  - Calculating average ratings (`menuItemId`, `rating`)
  - Querying a user's ratings for a specific item (`userId`, `menuItemId`)
- Consider caching average ratings to reduce computation

### Moderation
- Consider adding `isVisible` flag for comment moderation
- Consider adding `isApproved` workflow for review approval
- Add admin functionality to manage abusive/inappropriate reviews

