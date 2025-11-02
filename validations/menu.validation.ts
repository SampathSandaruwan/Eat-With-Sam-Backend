import { z } from 'zod';

export const getDataByMenuCategoryIdSchema = z.object({
  params: z.object({
    categoryId: z.string().regex(/^\d+$/).transform(Number),
  }),
});

export const filterMenuCategoriesSchema = z.object({
  query: z.object({
    isActive: z.string().optional().transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  }),
});

export const getDataByMenuItemIdSchema = z.object({
  params: z.object({
    menuItemId: z.string().regex(/^\d+$/).transform(Number),
  }),
});

export const filterMenuItemsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/)
      .optional()
      .default('1')
      .transform(Number),
    limit: z
      .string()
      .regex(/^\d+$/)
      .optional()
      .default('20')
      .transform(Number),
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
    sortBy: z.enum(['name', 'price', 'averageRating']).optional().default('name'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
});

