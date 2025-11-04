import MenuCategoryModel from './MenuCategory';
import MenuItemModel from './MenuItem';
import RefreshTokenModel from './RefreshToken';
import RestaurantModel from './Restaurant';
import UserModel from './User';

// Initialize associations
// Restaurant associations
RestaurantModel.hasMany(MenuCategoryModel, {
  foreignKey: 'restaurantId',
  as: 'menuCategories',
  onDelete: 'CASCADE',
});

RestaurantModel.hasMany(MenuItemModel, {
  foreignKey: 'restaurantId',
  as: 'menuItems',
  onDelete: 'RESTRICT',
});

// MenuCategory associations
MenuCategoryModel.belongsTo(RestaurantModel, {
  foreignKey: 'restaurantId',
  as: 'restaurant',
});

MenuCategoryModel.hasMany(MenuItemModel, {
  foreignKey: 'categoryId',
  as: 'menuItems',
  onDelete: 'RESTRICT',
});

// MenuItem associations
MenuItemModel.belongsTo(MenuCategoryModel, {
  foreignKey: 'categoryId',
  as: 'category',
});

MenuItemModel.belongsTo(RestaurantModel, {
  foreignKey: 'restaurantId',
  as: 'restaurant',
});

// User associations
UserModel.hasMany(RefreshTokenModel, {
  foreignKey: 'userId',
  as: 'refreshTokens',
  onDelete: 'CASCADE',
});

RefreshTokenModel.belongsTo(UserModel, {
  foreignKey: 'userId',
  as: 'user',
});

export { MenuCategoryModel, MenuItemModel, RefreshTokenModel, RestaurantModel, UserModel };

