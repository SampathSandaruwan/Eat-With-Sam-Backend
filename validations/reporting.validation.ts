import { z } from 'zod';

import { getPaginationFields } from './common-fields';

const orderStatusEnum = z.enum([
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
  'cancelled',
]);

const timePeriodEnum = z.enum(['day', 'week', 'month']);

export const salesReportSchema = z.object({
  query: z
    .object({
      period: timePeriodEnum,
      ...getPaginationFields('date', [
        'date',
        'totalSales',
        'orderCount',
        'averageOrderValue',
      ] as const),
      status: z
        .union([orderStatusEnum, z.array(orderStatusEnum)])
        .optional()
        .transform((val) => {
          if (typeof val === 'string') return val;
          if (Array.isArray(val)) {
            return val.length === 1 ? val[0] : val;
          }
          return undefined;
        }),
      startDate: z
        .string()
        .datetime()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),
      endDate: z
        .string()
        .datetime()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),
    })
    .refine(
      (data) => {
        if (data.startDate && data.endDate) {
          return data.startDate <= data.endDate;
        }
        return true;
      },
      {
        message: 'startDate must be less than or equal to endDate',
        path: ['startDate'],
      },
    ),
});

const getPaginatedReportFields = getPaginationFields('', [''] as const);
export const topSellingItemsSchema = z.object({
  query: z
    .object({
      ...getPaginatedReportFields,
      sortBy: z.enum(['quantity', 'revenue']),
      status: z
        .union([orderStatusEnum, z.array(orderStatusEnum)])
        .optional()
        .transform((val) => {
          if (typeof val === 'string') return val;
          if (Array.isArray(val)) {
            return val.length === 1 ? val[0] : val;
          }
          return undefined;
        }),
      restaurantId: z
        .string()
        .regex(/^\d+$/)
        .optional()
        .transform((val) => (val ? Number(val) : undefined)),
      startDate: z
        .string()
        .datetime()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),
      endDate: z
        .string()
        .datetime()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),
    })
    .refine(
      (data) => {
        if (data.startDate && data.endDate) {
          return data.startDate <= data.endDate;
        }
        return true;
      },
      {
        message: 'startDate must be less than or equal to endDate',
        path: ['startDate'],
      },
    ),
});

export const averageOrderValueSchema = z.object({
  query: z
    .object({
      period: timePeriodEnum,
      ...getPaginationFields('averageOrderValue', [
        'averageOrderValue',
        'totalSales',
        'orderCount',
        'date',
      ] as const),
      status: z
        .union([orderStatusEnum, z.array(orderStatusEnum)])
        .optional()
        .transform((val) => {
          if (typeof val === 'string') return val;
          if (Array.isArray(val)) {
            return val.length === 1 ? val[0] : val;
          }
          return undefined;
        }),
      restaurantId: z
        .string()
        .regex(/^\d+$/)
        .optional()
        .transform((val) => (val ? Number(val) : undefined)),
      startDate: z
        .string()
        .datetime()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),
      endDate: z
        .string()
        .datetime()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),
    })
    .refine(
      (data) => {
        if (data.startDate && data.endDate) {
          return data.startDate <= data.endDate;
        }
        return true;
      },
      {
        message: 'startDate must be less than or equal to endDate',
        path: ['startDate'],
      },
    ),
});

