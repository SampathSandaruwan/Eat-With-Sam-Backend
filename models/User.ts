import bcrypt from 'bcrypt';
import { DataTypes, Model, Optional } from 'sequelize';

import { sequelize } from '../config/database';
import { DATABASE_MODELS } from '../constants';
import { User } from '../types';

type UserCreationAttributes = Optional<User, 'id' | 'createdAt' | 'updatedAt'>;

class UserModel
  extends Model<User, UserCreationAttributes>
  implements User
{
  public id!: number;
  public email!: string;
  public passwordHash?: string | null;
  public googleId?: string | null;
  public name!: string;
  public phoneNumber?: string | null;
  public address?: string | null;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Method to verify password (only for email/password users)
  public async verifyPassword(password: string): Promise<boolean> {
    if (!this.passwordHash) {
      return false;
    }
    return bcrypt.compare(password, this.passwordHash);
  }

  // Check if user is a Google OAuth user
  public isGoogleUser(): boolean {
    return !!this.googleId;
  }
}

UserModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        notEmpty: {
          msg: 'Password hash cannot be empty string',
        },
      },
    },
    googleId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'Google ID cannot be empty string',
        },
      },
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: DATABASE_MODELS.USERS.TABLE_NAME,
    modelName: DATABASE_MODELS.USERS.MODEL_NAME,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
      {
        unique: true,
        fields: ['googleId'],
        name: 'users_googleId_unique',
      },
    ],
    hooks: {
      beforeValidate: (user: UserModel) => {
        // Validate that either password or googleId is provided
        if (!user.passwordHash && !user.googleId) {
          throw new Error('Either password or googleId must be provided');
        }
      },
      beforeCreate: async (user: UserModel) => {
        // Only hash password if it's provided and not already hashed
        if (user.passwordHash && !user.passwordHash.startsWith('$2b$')) {
          const saltRounds = 10;
          user.passwordHash = await bcrypt.hash(user.passwordHash, saltRounds);
        }
      },
      beforeUpdate: async (user: UserModel) => {
        // Only hash password if it's being changed and provided, and not already hashed
        if (
          user.changed('passwordHash') &&
          user.passwordHash &&
          !user.passwordHash.startsWith('$2b$')
        ) {
          const saltRounds = 10;
          user.passwordHash = await bcrypt.hash(user.passwordHash, saltRounds);
        }
      },
    },
  },
);

// Override toJSON to exclude passwordHash
UserModel.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.passwordHash;
  return values;
};

export default UserModel;

