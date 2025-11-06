# Users Table

## Purpose

Stores customer account information for user authentication and profile management.

## Schema

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT (AUTO_INCREMENT) | PRIMARY KEY | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email address (used for login) |
| `passwordHash` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `firstName` | VARCHAR(100) | | User's first name |
| `lastName` | VARCHAR(100) | | User's last name |
| `phoneNumber` | VARCHAR(20) | | Contact phone number |
| `address` | TEXT | | Delivery address |
| `isActive` | BOOLEAN | DEFAULT true | Account active status |
| `createdAt` | DATETIME | NOT NULL | Account creation timestamp |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp |

## Indexes

- **PRIMARY KEY** on `id`
- **UNIQUE INDEX** on `email` (for login queries)

## Relationships

### One-to-Many

- **Users → Orders** (One-to-Many)
  - Foreign key: `Orders.userId`
  - Cascade: Restrict delete (cannot delete user with orders)
  - Description: One user can place many orders

- **Users → Ratings** (One-to-Many)
  - Foreign key: `Ratings.userId`
  - Cascade: Delete ratings when user is deleted
  - Description: One user can give many ratings

- **Users → RefreshTokens** (One-to-Many)
  - Foreign key: `RefreshTokens.userId`
  - Cascade: Delete tokens when user is deleted
  - Description: One user can have many refresh tokens

## Example Data

```sql
id | email                  | firstName | lastName | phoneNumber    | isActive | createdAt
---|------------------------|-----------|----------|----------------|----------|-------------------
1  | john.doe@example.com   | John      | Doe      | +44 7700 900123| true     | 2024-01-15 10:30:00
2  | jane.smith@example.com | Jane      | Smith    | +44 7700 900456| true     | 2024-01-16 14:20:00
```

## Security Considerations

- Passwords are stored as bcrypt hashes, never in plaintext
- Email is used as the unique identifier for authentication
- `isActive` flag allows soft disabling of accounts without deletion
- Password reset and email verification fields can be added later

## Usage Notes

- Email must be unique across all users
- Email format validation should be done at the application level
- Password hashing should use bcrypt with appropriate salt rounds (minimum 10)
- Consider adding email verification and password reset tokens if needed

