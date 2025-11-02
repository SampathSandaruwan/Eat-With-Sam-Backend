import { z } from 'zod';

export const idPathParamField = z.string().regex(/^\d+$/).transform(Number);

export const getPaginationFields = (
  defaultSortBy: string,
  sortByEnum: readonly [string, ...string[]] = ['createdAt'] as const,
) => ({
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
  sortBy: z.enum(sortByEnum).optional().default(defaultSortBy),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});
