/* eslint-disable no-console */
import { faker, SeederOptions } from '../utils/helpers';

import {
  DishModel,
  OrderItemModel,
  OrderModel,
  RestaurantModel,
  UserModel,
} from '../../models';
import { Order, OrderItem, OrderStatus } from '../../types';

// Weighted status distribution (more delivered orders)
const statusWeights = {
  delivered: 0.5,
  out_for_delivery: 0.1,
  ready: 0.1,
  preparing: 0.1,
  confirmed: 0.05,
  pending: 0.05,
  cancelled: 0.1,
};

const getStatus = (): OrderStatus => {
  const random = Math.random();
  let cumulative = 0;

  for (const [status, weight] of Object.entries(statusWeights)) {
    cumulative += weight;
    if (random <= cumulative) {
      return status as OrderStatus;
    }
  }

  return 'delivered';
};

/**
 * Generate order number for seeding (without database query)
 */
const generateOrderNumberForSeeding = (year: number, sequence: number): string => {
  const prefix = `ORD-${year}-`;
  const formattedSequence = sequence.toString().padStart(6, '0');
  return `${prefix}${formattedSequence}`;
};

export const seedOrders = async (options: SeederOptions = {}): Promise<void> => {
  const count = options.count || 10000;

  // Get all users
  const users = await UserModel.findAll({ attributes: ['id'] });
  if (users.length === 0) {
    console.log('No users found. Please seed users first.');
    return;
  }

  // Get all restaurants with their dishes
  const restaurants = await RestaurantModel.findAll({
    attributes: ['id', 'deliveryFee', 'serviceChargeRate', 'taxRate'],
  });

  if (restaurants.length === 0) {
    console.log('No restaurants found. Please seed restaurants first.');
    return;
  }

  // Get all dishes grouped by restaurant
  const dishes = await DishModel.findAll({
    attributes: ['id', 'restaurantId', 'price', 'isAvailable'],
    where: { isAvailable: true },
  });

  const dishesByRestaurant = new Map<number, typeof dishes>();
  for (const dish of dishes) {
    if (!dishesByRestaurant.has(dish.restaurantId)) {
      dishesByRestaurant.set(dish.restaurantId, []);
    }
    dishesByRestaurant.get(dish.restaurantId)!.push(dish);
  }

  // Filter restaurants that have dishes
  const restaurantsWithDishes = restaurants.filter(
    (r) => dishesByRestaurant.has(r.id) && dishesByRestaurant.get(r.id)!.length > 0,
  );

  if (restaurantsWithDishes.length === 0) {
    console.log('No restaurants with available dishes found. Please seed dishes first.');
    return;
  }

  console.log(
    `Creating ${count} orders across ${restaurantsWithDishes.length} restaurants and ${users.length} users...`,
  );

  const BATCH_SIZE = 500;
  const orders: Omit<Order, 'id'>[] = [];
  const orderItemsMap = new Map<number, Omit<OrderItem, 'id' | 'orderId'>[]>();

  // Track order numbers per year to avoid duplicates
  const orderSequences = new Map<number, number>();

  for (let i = 0; i < count; i++) {
    // Select random user and restaurant
    const user = faker.helpers.arrayElement(users);
    const restaurant = faker.helpers.arrayElement(restaurantsWithDishes);
    const restaurantDishes = dishesByRestaurant.get(restaurant.id)!;

    // Generate order items (2-5 items per order)
    const itemCount = faker.number.int({ min: 2, max: 5 });
    const selectedDishes = faker.helpers.arrayElements(restaurantDishes, {
      min: Math.min(itemCount, restaurantDishes.length),
      max: Math.min(itemCount, restaurantDishes.length),
    });

    // Calculate subtotal
    let subtotal = 0;
    const items: Omit<OrderItem, 'id' | 'orderId'>[] = [];

    for (const dish of selectedDishes) {
      const quantity = faker.number.int({ min: 1, max: 3 });
      const priceAtOrder = Number(dish.price);
      const itemSubtotal = quantity * priceAtOrder;
      subtotal += itemSubtotal;

      items.push({
        dishId: dish.id,
        quantity,
        priceAtOrder: Number(priceAtOrder.toFixed(2)),
        subtotal: Number(itemSubtotal.toFixed(2)),
        specialInstructions: faker.datatype.boolean({ probability: 0.2 }) ? faker.lorem.sentence() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Calculate fees and totals
    const deliveryFee = Number(restaurant.deliveryFee);
    const serviceCharge = (subtotal + deliveryFee) * Number(restaurant.serviceChargeRate);
    const taxAmount = (subtotal + deliveryFee + serviceCharge) * Number(restaurant.taxRate);
    const totalAmount = subtotal + deliveryFee + serviceCharge + taxAmount;

    // Generate order number
    const placedDate = faker.date.between({
      from: '2023-01-01',
      to: new Date().toISOString(),
    });
    const year = placedDate.getFullYear();
    const currentSequence = orderSequences.get(year) || 0;
    const nextSequence = currentSequence + 1;
    orderSequences.set(year, nextSequence);
    const orderNumber = generateOrderNumberForSeeding(year, nextSequence);

    // Generate status and dates
    const status = getStatus();
    const placedAt = placedDate;

    let estimatedDeliveryTime: Date | null = null;
    let actualDeliveryTime: Date | null = null;

    if (status === 'delivered' || status === 'out_for_delivery') {
      estimatedDeliveryTime = new Date(placedAt.getTime() + faker.number.int({ min: 20, max: 60 }) * 60000);
    }

    if (status === 'delivered') {
      actualDeliveryTime = new Date(
        estimatedDeliveryTime!.getTime() + faker.number.int({ min: -5, max: 15 }) * 60000,
      );
    }

    // Store order index for later mapping
    const orderIndex = orders.length;

    // Create order
    orders.push({
      orderNumber,
      userId: user.id,
      restaurantId: restaurant.id,
      status,
      totalAmount: Number(totalAmount.toFixed(2)),
      subtotal: Number(subtotal.toFixed(2)),
      deliveryFee: Number(deliveryFee.toFixed(2)),
      serviceCharge: Number(serviceCharge.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      deliveryAddress: faker.location.streetAddress(true),
      deliveryInstructions: faker.datatype.boolean({ probability: 0.3 }) ? faker.lorem.sentence() : null,
      estimatedDeliveryTime,
      actualDeliveryTime,
      placedAt,
      createdAt: placedAt,
      updatedAt: new Date(),
    });

    // Store order items with order index
    orderItemsMap.set(orderIndex, items);

    // Batch insert orders
    if (orders.length >= BATCH_SIZE) {
      const createdOrders = await OrderModel.bulkCreate(orders, { returning: true });

      // Create order items with correct order IDs
      const allOrderItems: Omit<OrderItem, 'id'>[] = [];
      for (let j = 0; j < createdOrders.length; j++) {
        const order = createdOrders[j];
        const items = orderItemsMap.get(j) || [];
        for (const item of items) {
          allOrderItems.push({
            ...item,
            orderId: order.id,
          });
        }
      }

      await OrderItemModel.bulkCreate(allOrderItems);
      console.log(`Seeded ${createdOrders.length} orders (${allOrderItems.length} items)...`);

      // Clear batches
      orders.length = 0;
      orderItemsMap.clear();
    }
  }

  // Insert remaining orders
  if (orders.length > 0) {
    const createdOrders = await OrderModel.bulkCreate(orders, { returning: true });

    // Create order items with correct order IDs
    const allOrderItems: Omit<OrderItem, 'id'>[] = [];
    for (let j = 0; j < createdOrders.length; j++) {
      const order = createdOrders[j];
      const items = orderItemsMap.get(j) || [];
      for (const item of items) {
        allOrderItems.push({
          ...item,
          orderId: order.id,
        });
      }
    }

    await OrderItemModel.bulkCreate(allOrderItems);
    console.log(`Seeded ${createdOrders.length} orders (${allOrderItems.length} items)...`);
  }

  console.log(`Seeded ${count} Order records with OrderItems`);
};

