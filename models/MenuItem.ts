import { DataTypes, Model, Optional } from 'sequelize';

import { sequelize } from '../config/database';
import { DATABASE_MODELS } from '../constants';
import type { MenuItem } from '../types';

type MenuItemCreationAttributes = Optional<
  MenuItem,
  'id' | 'description' | 'imageUri' | 'kcal' | 'tags' | 'allergens' | 'discountPercent' | 'createdAt' | 'updatedAt'
>;

class MenuItemModel
  extends Model<MenuItem, MenuItemCreationAttributes>
  implements MenuItem
{
  public id!: number;
  public name!: string;
  public description?: string | null;
  public price!: number;
  public imageUri?: string | null;
  public kcal?: number | null;
  public tags?: string[] | null;
  public allergens?: string[] | null;
  public discountPercent?: number | null;
  public isAvailable!: boolean;
  public categoryId!: number;
  public restaurantId!: number;
  public averageRating!: number;
  public ratingCount!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MenuItemModel.init(
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
        len: [1, 255],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
      get() {
        const value = this.getDataValue('price');
        return value !== null && value !== undefined ? parseFloat(value.toString()) : value;
      },
    },
    imageUri: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    kcal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    allergens: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    discountPercent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
      get() {
        const value = this.getDataValue('discountPercent');
        return value !== null && value !== undefined ? Number(value) : value;
      },
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: DATABASE_MODELS.MENU_CATEGORIES.TABLE_NAME,
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
    tableName: DATABASE_MODELS.MENU_ITEMS.TABLE_NAME,
    modelName: DATABASE_MODELS.MENU_ITEMS.MODEL_NAME,
    timestamps: true,
    indexes: [
      {
        fields: ['categoryId'],
      },
      {
        fields: ['restaurantId'],
      },
      {
        fields: ['isAvailable'],
      },
      {
        fields: ['price'],
      },
      {
        fields: ['averageRating'],
      },
    ],
  },
);

// Override toJSON to ensure DECIMAL fields are converted to numbers
MenuItemModel.prototype.toJSON = function () {
  const values = { ...this.get() };
  // Convert DECIMAL strings to numbers
  if (values.price !== undefined && values.price !== null) {
    values.price = Number(values.price);
  }
  if (values.discountPercent !== undefined && values.discountPercent !== null) {
    values.discountPercent = Number(values.discountPercent);
  }
  if (values.averageRating !== undefined && values.averageRating !== null) {
    values.averageRating = Number(values.averageRating);
  }
  return values;
};

export default MenuItemModel;

