export const DATABASE_MODELS: {
    [key: string]: {
        TABLE_NAME: string;
        MODEL_NAME: string;
    };
} = {
  RESTAURANTS: {
    TABLE_NAME: 'Restaurants',
    MODEL_NAME: 'Restaurant',
  },
  MENU_CATEGORIES: {
    TABLE_NAME: 'MenuCategories',
    MODEL_NAME: 'MenuCategory',
  },
  DISHES: {
    TABLE_NAME: 'Dishes',
    MODEL_NAME: 'Dish',
  },
  USERS: {
    TABLE_NAME: 'Users',
    MODEL_NAME: 'User',
  },
  REFRESH_TOKENS: {
    TABLE_NAME: 'RefreshTokens',
    MODEL_NAME: 'RefreshToken',
  },
  ORDERS: {
    TABLE_NAME: 'Orders',
    MODEL_NAME: 'Order',
  },
  ORDER_ITEMS: {
    TABLE_NAME: 'OrderItems',
    MODEL_NAME: 'OrderItem',
  },
};
