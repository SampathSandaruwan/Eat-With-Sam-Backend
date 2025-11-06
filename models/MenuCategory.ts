import { DataTypes, Model, Optional } from 'sequelize';

import { sequelize } from '../config/database';
import { DATABASE_MODELS } from '../constants';
import type { MenuCategory } from '../types';

type MenuCategoryCreationAttributes = Optional<
    MenuCategory,
    'id' | 'description' | 'displayOrder' | 'isActive' | 'createdAt' | 'updatedAt'
  >

class MenuCategoryModel
  extends Model<MenuCategory, MenuCategoryCreationAttributes>
  implements MenuCategory
{
  public id!: number;
  public name!: string;
  public description?: string | null;
  public displayOrder!: number;
  public restaurantId!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MenuCategoryModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: DATABASE_MODELS.RESTAURANTS.TABLE_NAME,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
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
    tableName: DATABASE_MODELS.MENU_CATEGORIES.TABLE_NAME,
    modelName: DATABASE_MODELS.MENU_CATEGORIES.MODEL_NAME,
    timestamps: true,
    indexes: [
      {
        fields: ['restaurantId'],
      },
      {
        fields: ['displayOrder'],
      },
      {
        fields: ['isActive'],
      },
    ],
  },
);

export default MenuCategoryModel;

