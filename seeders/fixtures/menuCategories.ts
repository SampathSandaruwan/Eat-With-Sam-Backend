import { faker, SeederOptions } from '../utils/helpers';

import {
  MenuCategoryModel,
  RestaurantModel,
} from '../../models';
import { MenuCategory } from '../../types';

const categoryNames = [
  'Appetizers',
  'Starters',
  'Main Course',
  'Entrees',
  'Desserts',
  'Beverages',
  'Drinks',
  'Sides',
  'Salads',
  'Soups',
  'Burgers',
  'Pizza',
  'Pasta',
  'Rice Dishes',
  'Noodles',
  'Sandwiches',
];

export const seedMenuCategories = async (
  options: SeederOptions = {},
): Promise<void> => {
  const count = options.count || 20;

  // Get all restaurants
  const restaurants = await RestaurantModel.findAll({
    attributes: ['id'],
  });

  if (restaurants.length === 0) {
    console.log('No restaurants found. Please seed restaurants first.');
    return;
  }

  console.log(`Creating ${count} menu categories across ${restaurants.length} restaurants...`);

  const categories: Omit<MenuCategory, 'id'>[] = [];
  const categoriesPerRestaurant = Math.ceil(count / restaurants.length);

  for (const restaurant of restaurants) {
    const categoriesForRestaurant = faker.number.int({
      min: 3,
      max: Math.min(categoriesPerRestaurant + 2, 8),
    });

    const usedNames = new Set<string>();
    let displayOrder = 1;

    for (let i = 0; i < categoriesForRestaurant && categories.length < count; i++) {
      let categoryName = faker.helpers.arrayElement(categoryNames);
      while (usedNames.has(categoryName)) {
        categoryName = faker.helpers.arrayElement(categoryNames);
      }
      usedNames.add(categoryName);

      categories.push({
        name: categoryName,
        description: faker.lorem.sentence(),
        displayOrder: displayOrder++,
        restaurantId: restaurant.id,
        isActive: faker.datatype.boolean({ probability: 0.95 }),
        createdAt: faker.date.past({ years: 1 }),
        updatedAt: new Date(),
      });
    }
  }

  await MenuCategoryModel.bulkCreate(categories);
  console.log(`Seeded ${categories.length} MenuCategory records`);
};

