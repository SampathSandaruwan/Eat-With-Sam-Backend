import MenuCategoryModel from './MenuCategory';
import MenuItemModel from './MenuItem';
import RestaurantModel from './Restaurant';

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

export { MenuCategoryModel, MenuItemModel, RestaurantModel };

