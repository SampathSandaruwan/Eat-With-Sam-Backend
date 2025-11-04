import bcrypt from 'bcrypt';
import { DataTypes, Model, Optional } from 'sequelize';

import { sequelize } from '../config/database';
import { DATABASE_MODELS } from '../constants';
import { RefreshToken } from '../types';

type RefreshTokenCreationAttributes = Optional<
  RefreshToken,
  'id' | 'createdAt' | 'updatedAt' | 'revokedAt' | 'lastUsedAt'
>;

class RefreshTokenModel
  extends Model<RefreshToken, RefreshTokenCreationAttributes>
  implements RefreshToken
{
  public id!: number;
  public token!: string; // Hashed token
  public userId!: number;
  public expiresAt!: Date;
  public deviceInfo?: string | null;
  public isRevoked!: boolean;
  public revokedAt?: Date | null;
  public lastUsedAt?: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /**
   * Verify if a plaintext token matches the stored hashed token
   */
  public async verifyToken(plainToken: string): Promise<boolean> {
    return bcrypt.compare(plainToken, this.token);
  }

  /**
   * Check if token is expired
   */
  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Check if token is valid (not revoked and not expired)
   */
  public isValid(): boolean {
    return !this.isRevoked && !this.isExpired();
  }
}

RefreshTokenModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: DATABASE_MODELS.USERS.TABLE_NAME,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deviceInfo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isRevoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastUsedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: DATABASE_MODELS.REFRESH_TOKENS.TABLE_NAME,
    modelName: DATABASE_MODELS.REFRESH_TOKENS.MODEL_NAME,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['token'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['expiresAt'],
      },
      {
        fields: ['isRevoked'],
      },
    ],
    hooks: {
      beforeCreate: async (refreshToken: RefreshTokenModel) => {
        // Hash the token before storing it
        if (refreshToken.token && !refreshToken.token.startsWith('$2b$')) {
          const saltRounds = 10;
          refreshToken.token = await bcrypt.hash(refreshToken.token, saltRounds);
        }
      },
    },
  },
);

export default RefreshTokenModel;

