import { z } from 'zod';

export const getDataByRestaurantIdSchema = z.object({
  params: z.object({
    restaurantId: z.string().regex(/^\d+$/).transform(Number),
  }),
});

export const filterRestaurantsSchema = z.object({
  query: z.object({
    isActive: z
      .string()
      .optional()
      .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  }),
});

