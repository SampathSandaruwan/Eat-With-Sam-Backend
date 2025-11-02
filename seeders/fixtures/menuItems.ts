import { FOOD_IMAGE_URLS } from '../utils/constants';
import { faker, SeederOptions } from '../utils/helpers';

import {
  MenuCategoryModel,
  MenuItemModel,
  RestaurantModel,
} from '../../models';
import { MenuCategory, MenuItem, Restaurant } from '../../types';

const foodItems = [
  'Burger',
  'Pizza',
  'Pasta',
  'Salad',
  'Soup',
  'Steak',
  'Chicken',
  'Fish',
  'Rice Bowl',
  'Noodles',
  'Sandwich',
  'Wrap',
  'Taco',
  'Burrito',
  'Curry',
  'Stir Fry',
  'Sushi',
  'Ramen',
  'Dumplings',
  'Fries',
];

const dietaryTags = [
  'Vegan',
  'Vegetarian',
  'Gluten-Free',
  'Dairy-Free',
  'Spicy',
  'Healthy',
  'Low-Carb',
  'Keto',
  'Halal',
  'Organic',
];

type RestaurantWithCategories = Restaurant & { menuCategories: MenuCategory[] };

export const seedMenuItems = async (
  options: SeederOptions = {},
): Promise<void> => {
  const count = options.count || 50;

  // Get all restaurants with their categories
  const restaurants = (await RestaurantModel.findAll({
    include: [
      {
        model: MenuCategoryModel,
        as: 'menuCategories',
        attributes: ['id', 'name'],
        required: false,
      },
    ],
  })) as Restaurant[] as RestaurantWithCategories[];

  if (restaurants.length === 0) {
    console.log('No restaurants found. Please seed restaurants first.');
    return;
  }

  // Filter restaurants that have categories
  const restaurantsWithCategories = restaurants.filter(
    (r) => r.menuCategories?.length > 0,
  );

  if (restaurantsWithCategories.length === 0) {
    console.log('No restaurants with categories found. Please seed menu categories first.');
    return;
  }

  console.log(
    `Creating ${count} menu items across ${restaurantsWithCategories.length} restaurants...`,
  );

  const menuItems: Omit<MenuItem, 'id'>[] = [];
  const itemsPerRestaurant = Math.ceil(count / restaurantsWithCategories.length);

  for (const restaurant of restaurantsWithCategories) {
    const restaurantCategories = restaurant.menuCategories;
    const itemsForRestaurant = faker.number.int({
      min: Math.floor(itemsPerRestaurant * 0.5),
      max: Math.max(itemsPerRestaurant + 5, 15),
    });

    for (let i = 0; i < itemsForRestaurant && menuItems.length < count; i++) {
      const category = faker.helpers.arrayElement(restaurantCategories);
      const foodItem = faker.helpers.arrayElement(foodItems);
      const itemName = `${faker.helpers.arrayElement(['Premium', 'Classic', 'Spicy', 'Deluxe', 'Special', 'Signature', ''])} ${foodItem}`.trim();

      // Generate tags (30% chance of having tags)
      const tags: string[] | null = faker.datatype.boolean({ probability: 0.3 })
        ? faker.helpers
          .arrayElements(dietaryTags, { min: 1, max: 3 })
          .sort()
        : null;

      // Generate discount (10% chance)
      const discountPercent =
        faker.datatype.boolean({ probability: 0.1 }) && faker.number.int({ min: 10, max: 50 })
          ? faker.number.int({ min: 10, max: 50 })
          : null;

      menuItems.push({
        name: itemName,
        description: faker.lorem.paragraph(),
        price: Number(faker.number.float({ min: 5, max: 50, fractionDigits: 2 })),
        imageUri: faker.helpers.arrayElement(FOOD_IMAGE_URLS),
        kcal: faker.number.int({ min: 200, max: 1200 }),
        tags,
        discountPercent,
        isAvailable: faker.datatype.boolean({ probability: 0.9 }),
        categoryId: category.id,
        restaurantId: restaurant.id,
        averageRating: parseFloat(
          (faker.number.float({ min: 3.5, max: 5, fractionDigits: 2 }) * 100000000).toFixed(8),
        ) / 100000000,
        ratingCount: faker.number.int({ min: 0, max: 200 }),
        createdAt: faker.date.past({ years: 1 }),
        updatedAt: new Date(),
      });
    }
  }

  await MenuItemModel.bulkCreate(menuItems);
  console.log(`Seeded ${menuItems.length} MenuItem records`);
};

