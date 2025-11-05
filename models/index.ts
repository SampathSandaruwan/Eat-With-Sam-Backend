import DishModel from './Dish';
import MenuCategoryModel from './MenuCategory';
import OrderModel from './Order';
import OrderItemModel from './OrderItem';
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

RestaurantModel.hasMany(OrderModel, {
  foreignKey: 'restaurantId',
  as: 'orders',
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

// Order associations
OrderModel.belongsTo(UserModel, {
  foreignKey: 'userId',
  as: 'user',
});

OrderModel.belongsTo(RestaurantModel, {
  foreignKey: 'restaurantId',
  as: 'restaurant',
});

OrderModel.hasMany(OrderItemModel, {
  foreignKey: 'orderId',
  as: 'orderItems',
  onDelete: 'CASCADE',
});

// User associations (orders)
UserModel.hasMany(OrderModel, {
  foreignKey: 'userId',
  as: 'orders',
  onDelete: 'RESTRICT',
});

// OrderItem associations
OrderItemModel.belongsTo(OrderModel, {
  foreignKey: 'orderId',
  as: 'order',
});

OrderItemModel.belongsTo(DishModel, {
  foreignKey: 'dishId',
  as: 'dish',
});

// Dish associations (orderItems)
DishModel.hasMany(OrderItemModel, {
  foreignKey: 'dishId',
  as: 'orderItems',
  onDelete: 'RESTRICT',
});

export {
  DishModel,
  MenuCategoryModel,
  OrderItemModel,
  OrderModel,
  RefreshTokenModel,
  RestaurantModel,
  UserModel,
};

