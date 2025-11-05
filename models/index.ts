import DishModel from './Dish';
import MenuCategoryModel from './MenuCategory';
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

RestaurantModel.hasMany(DishModel, {
  foreignKey: 'restaurantId',
  as: 'dishes',
  onDelete: 'RESTRICT',
});

// MenuCategory associations
MenuCategoryModel.belongsTo(RestaurantModel, {
  foreignKey: 'restaurantId',
  as: 'restaurant',
});

MenuCategoryModel.hasMany(DishModel, {
  foreignKey: 'categoryId',
  as: 'dishes',
  onDelete: 'RESTRICT',
});

// Dish associations
DishModel.belongsTo(MenuCategoryModel, {
  foreignKey: 'categoryId',
  as: 'category',
});

DishModel.belongsTo(RestaurantModel, {
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

export { DishModel, MenuCategoryModel, RefreshTokenModel, RestaurantModel, UserModel };

