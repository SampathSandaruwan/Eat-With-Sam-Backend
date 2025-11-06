import { z } from 'zod';

import { getPaginationFields, idPathParamField } from './common-fields';

export const restaurantIdPathParamSchema = z.object({
  params: z.object({ restaurantId: idPathParamField }),
});

export const filterRestaurantsSchema = z.object({
  query: z.object({
    ...getPaginationFields('createdAt', ['createdAt', 'deliveryTime', 'minimumOrder', 'deliveryFee', 'taxRate'] as const),
    isActive: z
      .string()
      .optional()
      .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  }),
});

export const createRestaurantSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional().nullable(),
    cuisineType: z.string().max(100).optional().nullable(),
    address: z.string().min(1),
    city: z.string().max(100).optional().nullable(),
    postalCode: z.string().max(20).optional().nullable(),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    phoneNumber: z.string().max(20).optional().nullable(),
    email: z.string().email().optional().nullable(),
    imageUri: z.string().max(500).optional().nullable(),
    deliveryTime: z.number().int().min(0).optional().nullable(),
    minimumOrder: z.number().min(0).default(0),
    deliveryFee: z.number().min(0).default(0),
    serviceChargeRate: z.number().min(0).max(1).default(0),
    taxRate: z.number().min(0).max(1).default(0),
    isActive: z.boolean().default(true),
    openingTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional().nullable(),
    closingTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional().nullable(),
  }).strict(),
});

export const updateRestaurantSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional().nullable(),
    cuisineType: z.string().max(100).optional().nullable(),
    address: z.string().min(1).optional(),
    city: z.string().max(100).optional().nullable(),
    postalCode: z.string().max(20).optional().nullable(),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    phoneNumber: z.string().max(20).optional().nullable(),
    email: z.string().email().optional().nullable(),
    imageUri: z.string().max(500).optional().nullable(),
    deliveryTime: z.number().int().min(0).optional().nullable(),
    minimumOrder: z.number().min(0).optional(),
    deliveryFee: z.number().min(0).optional(),
    serviceChargeRate: z.number().min(0).max(1).optional(),
    taxRate: z.number().min(0).max(1).optional(),
    isActive: z.boolean().optional(),
    openingTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional().nullable(),
    closingTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional().nullable(),
  }).strict(),
});

