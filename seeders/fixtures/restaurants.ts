import { FOOD_IMAGE_URLS } from '../utils/constants';
import { createSeeder, faker } from '../utils/helpers';

import { DATABASE_MODELS } from '../../constants';
import { RestaurantModel } from '../../models';
import { Restaurant } from '../../types';

const cuisineTypes = [
  'Italian',
  'Indian',
  'Chinese',
  'Mexican',
  'Thai',
  'Japanese',
  'American',
  'Mediterranean',
  'French',
  'Greek',
  'Korean',
  'Vietnamese',
];

export const seedRestaurants = createSeeder<Restaurant>(
  RestaurantModel,
  DATABASE_MODELS.RESTAURANTS.MODEL_NAME,
  {
    name: () => faker.company.name(),
    description: () => faker.company.catchPhrase(),
    cuisineType: () => faker.helpers.arrayElement(cuisineTypes),
    address: () => faker.location.streetAddress(true),
    city: () => faker.location.city(),
    postalCode: () => faker.location.zipCode(),
    latitude: () => Number(faker.location.latitude()),
    longitude: () => Number(faker.location.longitude()),
    phoneNumber: () => faker.phone.number().slice(0, 20),
    email: () => faker.internet.email(),
    imageUri: () => faker.helpers.arrayElement(FOOD_IMAGE_URLS),
    deliveryTime: () => faker.number.int({ min: 15, max: 60 }),
    minimumOrder: () => Number(faker.number.float({ min: 0, max: 20, fractionDigits: 2 })),
    deliveryFee: () => Number(faker.number.float({ min: 0, max: 10, fractionDigits: 2 })),
    taxRate: () => Number(faker.number.float({ min: 0.05, max: 0.25, fractionDigits: 4 })),
    isActive: () => faker.datatype.boolean({ probability: 0.9 }),
    openingTime: () => {
      const hour = faker.number.int({ min: 8, max: 10 });
      return `${hour.toString().padStart(2, '0')}:00:00` as string;
    },
    closingTime: () => {
      const hour = faker.number.int({ min: 20, max: 23 });
      return `${hour.toString().padStart(2, '0')}:00:00` as string;
    },
    createdAt: () => faker.date.past({ years: 2 }),
    updatedAt: () => new Date(),
  },
);

