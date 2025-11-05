import { z } from 'zod';

import { getPaginationFields, idPathParamField } from './common-fields';

export const menuCategoryIdPathParamSchema = z.object({
  params: z.object({ categoryId: idPathParamField }),
});

export const filterMenuCategoriesSchema = z.object({
  query: z.object({
    ...getPaginationFields('displayOrder', ['displayOrder'] as const),
    isActive: z.string().optional().transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  }),
});

export const menuItemIdPathParamSchema = z.object({
  params: z.object({ menuItemId: idPathParamField }),
});

export const filterMenuItemsSchema = z.object({
  query: z.object({
    ...getPaginationFields('createdAt', ['createdAt', 'averageRating', 'price', 'discountPercent'] as const),
    categoryId: z
      .string()
      .regex(/^\d+$/)
      .optional()
      .transform((val) => (val ? Number(val) : undefined)),
    isAvailable: z
      .string()
      .optional()
      .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
    minPrice: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/)
      .optional()
      .transform((val) => (val ? Number(val) : undefined)),
    maxPrice: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/)
      .optional()
      .transform((val) => (val ? Number(val) : undefined)),
  }),
});

export const createMenuCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional().nullable(),
    displayOrder: z.number().int().min(0).default(0),
    restaurantId: z.number().int().positive(),
    isActive: z.boolean().default(true),
  }).strict(),
});

export const updateMenuCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional().nullable(),
    displayOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  }).strict(),
});

export const createMenuItemSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional().nullable(),
    price: z.number().min(0),
    imageUri: z.string().max(500).optional().nullable(),
    kcal: z.number().int().min(0).optional().nullable(),
    tags: z.array(z.string()).optional().nullable(),
    allergens: z.array(z.string()).optional().nullable(),
    discountPercent: z.number().min(0).max(100).optional().nullable(),
    isAvailable: z.boolean().default(true),
    categoryId: z.number().int().positive(),
    restaurantId: z.number().int().positive(),
  }).strict(),
});

export const updateMenuItemSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional().nullable(),
    price: z.number().min(0).optional(),
    imageUri: z.string().max(500).optional().nullable(),
    kcal: z.number().int().min(0).optional().nullable(),
    tags: z.array(z.string()).optional().nullable(),
    allergens: z.array(z.string()).optional().nullable(),
    discountPercent: z.number().min(0).max(100).optional().nullable(),
    isAvailable: z.boolean().optional(),
  }).strict(),
});

