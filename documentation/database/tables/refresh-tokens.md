# RefreshTokens Table

## Purpose

Stores JWT refresh tokens for user authentication, enabling secure token rotation and multi-device login support.

## Schema

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT (AUTO_INCREMENT) | PRIMARY KEY | Unique token identifier |
| `token` | VARCHAR(500) | NOT NULL, UNIQUE | Refresh token string (hashed or encrypted) |
| `userId` | INT | NOT NULL, FOREIGN KEY | User who owns the token |
| `expiresAt` | DATETIME | NOT NULL | Token expiration timestamp |
| `deviceInfo` | VARCHAR(255) | | Optional device/user agent information |
| `isRevoked` | BOOLEAN | DEFAULT false | Token revocation status |
| `revokedAt` | DATETIME | | Timestamp when token was revoked |
| `lastUsedAt` | DATETIME | | Timestamp when token was last used (for usage tracking) |
| `createdAt` | DATETIME | NOT NULL | Token creation timestamp |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp |

## Indexes

- **PRIMARY KEY** on `id`
- **UNIQUE INDEX** on `token` (for token lookup)
- **INDEX** on `userId` (foreign key)
- **INDEX** on `expiresAt` (for cleanup of expired tokens)
- **INDEX** on `isRevoked` (for filtering active tokens)

## Relationships

- **RefreshTokens → Users** (Many-to-One)
  - Foreign key: `userId` references `Users.id`
  - Cascade: Delete tokens when user is deleted
  - Description: Many refresh tokens belong to one user

## Token Lifecycle

1. **Creation**: Token created when user logs in or refreshes access token
2. **Usage**: Token used to obtain new access token when current one expires
3. **Revocation**: Token marked as revoked when user logs out or security breach detected
4. **Expiration**: Token automatically invalid after `expiresAt` timestamp
5. **Cleanup**: Expired tokens can be periodically deleted

## Security Considerations

### Token Storage
- Tokens should be hashed (like passwords) or encrypted before storage
- Never store plaintext refresh tokens
- Use secure hashing algorithm (bcrypt, argon2, etc.)

### Token Rotation
- Issue new refresh token when old one is used
- Revoke old token to prevent reuse
- Enables detection of token theft (if old token used after rotation)

### Expiration
- Token expiration time should be read from environment variables (`.env`)
- Typical expiration: 7-30 days (configurable via `REFRESH_TOKEN_EXPIRY` or similar)
- Longer than access tokens (typically 15-60 minutes, configurable via `ACCESS_TOKEN_EXPIRY`)
- Balance between security and user convenience
- Allows different expiry times per environment (dev, staging, production)

## Example Data

```sql
id | token (hashed)              | userId | expiresAt            | isRevoked | lastUsedAt           | createdAt
---|-----------------------------|--------|----------------------|-----------|----------------------|-------------------
1  | $2b$10$...hashed_token...  | 1      | 2024-02-15 10:30:00  | false     | 2024-01-25 08:20:00  | 2024-01-20 10:30:00
2  | $2b$10$...hashed_token...  | 1      | 2024-02-16 14:20:00  | false     | 2024-01-26 15:45:00  | 2024-01-21 14:20:00
3  | $2b$10$...hashed_token...  | 2      | 2024-01-25 09:15:00  | true      | 2024-01-24 12:00:00  | 2024-01-18 09:15:00
```

## Usage Notes

### Multi-Device Support
- Users can have multiple active refresh tokens (one per device)
- `deviceInfo` field helps identify which device a token belongs to
- Enables "Log out all devices" functionality

### Token Cleanup
- Implement periodic job to delete expired tokens
- Reduces database size and improves query performance
- **For stolen token detection**: Keep expired tokens for a configurable retention period before deletion to detect attempts to use stolen tokens
- Retention period should be read from environment variable `REFRESH_TOKEN_CLEANUP_RETENTION_DAYS` (default: 7 days)
- Example: Delete tokens where `expiresAt < DATE_SUB(NOW(), INTERVAL ? DAY)` where `?` is the retention period from env
- This provides a detection window for suspicious activity using expired tokens
- Configurable per environment (dev might use shorter retention, production longer for security monitoring)

### Revocation
- Set `isRevoked = true` and `revokedAt = NOW()` when revoking
- Check both `expiresAt` and `isRevoked` when validating tokens
- Revoke on:
  - **Logout**: Revoke the specific token for that session/device
  - **Logout from all devices**: **Revoke ALL tokens for that user** (user-initiated, logs out from all sessions)
  - **Password change**: **Revoke ALL tokens for that user** (security best practice - invalidates potentially compromised tokens)
  - **Security breach**: Revoke all tokens for affected user(s)

### Validation Logic
```sql
SELECT * FROM RefreshTokens
WHERE token = ? 
  AND userId = ?
  AND expiresAt > NOW()
  AND isRevoked = false
```

## Implementation Notes

- Update `lastUsedAt` timestamp whenever the token is used to refresh an access token
- Useful for identifying inactive tokens and monitoring suspicious activity
- Consider rate limiting refresh token requests per user
- Implement token rotation strategy (one-time use vs. reusable)
- Store tokens securely (consider encryption at rest)

