import { DataTypes, Model, Optional } from 'sequelize';

import { sequelize } from '../config/database';
import { DATABASE_MODELS } from '../constants';
import type { Order, OrderStatus } from '../types';

type OrderCreationAttributes = Optional<
  Order,
  'id' | 'serviceCharge' | 'deliveryInstructions' | 'estimatedDeliveryTime' | 'actualDeliveryTime' | 'createdAt' | 'updatedAt'
>;

class OrderModel
  extends Model<Order, OrderCreationAttributes>
  implements Order
{
  public id!: number;
  public orderNumber!: string;
  public userId!: number;
  public restaurantId!: number;
  public status!: OrderStatus;
  public totalAmount!: number;
  public subtotal!: number;
  public deliveryFee!: number;
  public serviceCharge!: number;
  public taxAmount!: number;
  public deliveryAddress!: string;
  public deliveryInstructions?: string | null;
  public estimatedDeliveryTime?: Date | null;
  public actualDeliveryTime?: Date | null;
  public placedAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OrderModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 50],
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: DATABASE_MODELS.USERS.TABLE_NAME,
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: DATABASE_MODELS.RESTAURANTS.TABLE_NAME,
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'confirmed',
        'preparing',
        'ready',
        'out_for_delivery',
        'delivered',
        'cancelled',
      ),
      allowNull: false,
      defaultValue: 'pending',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
      get() {
        const value = this.getDataValue('totalAmount');
        return value !== null && value !== undefined ? parseFloat(value.toString()) : value;
      },
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
      get() {
        const value = this.getDataValue('subtotal');
        return value !== null && value !== undefined ? parseFloat(value.toString()) : value;
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
        return value !== null && value !== undefined ? parseFloat(value.toString()) : value;
      },
    },
    serviceCharge: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0,
      },
      get() {
        const value = this.getDataValue('serviceCharge');
        return value !== null && value !== undefined ? parseFloat(value.toString()) : value;
      },
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0,
      },
      get() {
        const value = this.getDataValue('taxAmount');
        return value !== null && value !== undefined ? parseFloat(value.toString()) : value;
      },
    },
    deliveryAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    deliveryInstructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    estimatedDeliveryTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    actualDeliveryTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    placedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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
    tableName: DATABASE_MODELS.ORDERS.TABLE_NAME,
    modelName: DATABASE_MODELS.ORDERS.MODEL_NAME,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['orderNumber'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['restaurantId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['placedAt'],
      },
      {
        fields: ['userId', 'placedAt'],
      },
    ],
  },
);

// Override toJSON to ensure DECIMAL fields are converted to numbers
OrderModel.prototype.toJSON = function () {
  const values = { ...this.get() };
  // Convert DECIMAL strings to numbers
  if (values.totalAmount !== undefined && values.totalAmount !== null) {
    values.totalAmount = Number(values.totalAmount);
  }
  if (values.subtotal !== undefined && values.subtotal !== null) {
    values.subtotal = Number(values.subtotal);
  }
  if (values.deliveryFee !== undefined && values.deliveryFee !== null) {
    values.deliveryFee = Number(values.deliveryFee);
  }
  if (values.serviceCharge !== undefined && values.serviceCharge !== null) {
    values.serviceCharge = Number(values.serviceCharge);
  }
  if (values.taxAmount !== undefined && values.taxAmount !== null) {
    values.taxAmount = Number(values.taxAmount);
  }
  return values;
};

export default OrderModel;

