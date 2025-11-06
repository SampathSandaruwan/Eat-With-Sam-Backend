import { DataTypes, Model, Optional } from 'sequelize';

import { sequelize } from '../config/database';
import { DATABASE_MODELS } from '../constants';
import type { OrderItem } from '../types';

type OrderItemCreationAttributes = Optional<
  OrderItem,
  'id' | 'specialInstructions' | 'createdAt' | 'updatedAt'
>;

class OrderItemModel
  extends Model<OrderItem, OrderItemCreationAttributes>
  implements OrderItem
{
  public id!: number;
  public orderId!: number;
  public dishId!: number;
  public quantity!: number;
  public priceAtOrder!: number;
  public subtotal!: number;
  public specialInstructions?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OrderItemModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: DATABASE_MODELS.ORDERS.TABLE_NAME,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    dishId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: DATABASE_MODELS.DISHES.TABLE_NAME,
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    priceAtOrder: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
      get() {
        const value = this.getDataValue('priceAtOrder');
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
    specialInstructions: {
      type: DataTypes.TEXT,
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
    tableName: DATABASE_MODELS.ORDER_ITEMS.TABLE_NAME,
    modelName: DATABASE_MODELS.ORDER_ITEMS.MODEL_NAME,
    timestamps: true,
    indexes: [
      {
        fields: ['orderId'],
      },
      {
        fields: ['dishId'],
      },
      {
        fields: ['orderId', 'dishId'],
      },
    ],
  },
);

// Override toJSON to ensure DECIMAL fields are converted to numbers
OrderItemModel.prototype.toJSON = function () {
  const values = { ...this.get() };
  // Convert DECIMAL strings to numbers
  if (values.priceAtOrder !== undefined && values.priceAtOrder !== null) {
    values.priceAtOrder = Number(values.priceAtOrder);
  }
  if (values.subtotal !== undefined && values.subtotal !== null) {
    values.subtotal = Number(values.subtotal);
  }
  return values;
};

export default OrderItemModel;

