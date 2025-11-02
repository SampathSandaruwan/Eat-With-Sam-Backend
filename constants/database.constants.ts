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
  MENU_ITEMS: {
    TABLE_NAME: 'MenuItems',
    MODEL_NAME: 'MenuItem',
  },
};
