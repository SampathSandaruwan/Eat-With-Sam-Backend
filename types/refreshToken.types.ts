export interface RefreshToken {
  id: number;
  token: string; // Hashed token
  userId: number;
  expiresAt: Date;
  deviceInfo?: string | null;
  isRevoked: boolean;
  revokedAt?: Date | null;
  lastUsedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

