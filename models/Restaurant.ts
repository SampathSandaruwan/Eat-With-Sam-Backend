import { DataTypes, Model } from 'sequelize';

import { sequelize } from '../config/database';
import { DATABASE_MODELS } from '../constants';
import { Restaurant } from '../types';

class RestaurantModel
  extends Model<Restaurant>
  implements Restaurant
{
  public id!: number;
  public name!: string;
  public description?: string | null;
  public cuisineType?: string | null;
  public address!: string;
  public city?: string | null;
  public postalCode?: string | null;
  public latitude?: number | null;
  public longitude?: number | null;
  public phoneNumber?: string | null;
  public email?: string | null;
  public imageUri?: string | null;
  public deliveryTime?: number | null;
  public minimumOrder!: number;
  public deliveryFee!: number;
  public serviceChargeRate!: number;
  public taxRate!: number;
  public isActive!: boolean;
  public openingTime?: string | null;
  public closingTime?: string | null;
  public averageRating!: number;
  public ratingCount!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RestaurantModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cuisineType: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    postalCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      get() {
        const value = this.getDataValue('latitude');
        return value !== null && value !== undefined ? parseFloat(value.toString()) : value;
      },
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      get() {
        const value = this.getDataValue('longitude');
        return value !== null && value !== undefined ? parseFloat(value.toString()) : value;
      },
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    imageUri: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    deliveryTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    minimumOrder: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0,
      },
      get() {
        const value = this.getDataValue('minimumOrder');
        return value !== null && value !== undefined ? Number(value) : value;
      },
    },
    deliveryFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0,
      },
      get() {
        const value = this.getDataValue('deliveryFee');
        return value !== null && value !== undefined ? Number(value) : value;
      },
    },
    serviceChargeRate: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0,
        max: 1,
      },
      get() {
        const value = this.getDataValue('serviceChargeRate');
        return value !== null && value !== undefined ? Number(value) : value;
      },
    },
    taxRate: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0,
        max: 1,
      },
      get() {
        const value = this.getDataValue('taxRate');
        return value !== null && value !== undefined ? Number(value) : value;
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    openingTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    closingTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    averageRating: {
      type: DataTypes.DECIMAL(9, 8),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0,
        max: 5,
      },
      get() {
        const value = this.getDataValue('averageRating');
        return value !== null && value !== undefined ? Number(value) : value;
      },
    },
    ratingCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
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
    tableName: DATABASE_MODELS.RESTAURANTS.TABLE_NAME,
    modelName: DATABASE_MODELS.RESTAURANTS.MODEL_NAME,
    timestamps: true,
    indexes: [
      {
        fields: ['cuisineType'],
      },
      {
        fields: ['city'],
      },
      {
        fields: ['isActive'],
      },
      {
        fields: ['averageRating'],
      },
    ],
  },
);

// Override toJSON to ensure DECIMAL fields are converted to numbers
RestaurantModel.prototype.toJSON = function () {
  const values = { ...this.get() };
  // Convert DECIMAL strings to numbers
  if (values.minimumOrder !== undefined && values.minimumOrder !== null) {
    values.minimumOrder = Number(values.minimumOrder);
  }
  if (values.deliveryFee !== undefined && values.deliveryFee !== null) {
    values.deliveryFee = Number(values.deliveryFee);
  }
  if (values.serviceChargeRate !== undefined && values.serviceChargeRate !== null) {
    values.serviceChargeRate = Number(values.serviceChargeRate);
  }
  if (values.taxRate !== undefined && values.taxRate !== null) {
    values.taxRate = Number(values.taxRate);
  }
  if (values.latitude !== undefined && values.latitude !== null) {
    values.latitude = Number(values.latitude);
  }
  if (values.longitude !== undefined && values.longitude !== null) {
    values.longitude = Number(values.longitude);
  }
  if (values.averageRating !== undefined && values.averageRating !== null) {
    values.averageRating = Number(values.averageRating);
  }
  return values;
};

export default RestaurantModel;

