import { z } from 'zod';

import { getPaginationFields, idPathParamField } from './common-fields';

export const orderIdPathParamSchema = z.object({
  params: z.object({ id: idPathParamField }),
});

const orderStatusEnum = z.enum([
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
  'cancelled',
]);

export const placeOrderSchema = z.object({
  body: z
    .object({
      restaurantId: z.number().int().positive(),
      items: z
        .array(
          z.object({
            dishId: z.number().int().positive(),
            quantity: z.number().int().min(1),
            specialInstructions: z.string().optional().nullable(),
          }),
        )
        .min(1, 'Order must contain at least one item'),
      deliveryAddress: z.string().min(1),
      deliveryInstructions: z.string().optional().nullable(),
    })
    .strict(),
});

export const updateOrderStatusSchema = z.object({
  body: z
    .object({
      status: orderStatusEnum,
      estimatedDeliveryTime: z
        .string()
        .datetime()
        .optional()
        .nullable()
        .transform((val) => (val ? new Date(val) : null)),
      actualDeliveryTime: z
        .string()
        .datetime()
        .optional()
        .nullable()
        .transform((val) => (val ? new Date(val) : null)),
    })
    .strict(),
});

export const filterOrdersSchema = z.object({
  query: z.object({
    ...getPaginationFields('placedAt', ['placedAt', 'totalAmount', 'status'] as const),
    status: orderStatusEnum.optional(),
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
  }),
});

