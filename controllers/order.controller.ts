import { Request, Response } from 'express';
import { Op, WhereOptions } from 'sequelize';

import { sequelize } from '../config/database';
import { generateOrderNumber } from '../helpers';
import { DishModel, OrderItemModel, OrderModel, RestaurantModel, UserModel } from '../models';
import { Order, OrderStatus } from '../types';

/**
 * Place a new order with items
 */
export const placeOrder = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    // Get authenticated user
    const user = req.user;
    if (!user) {
      await transaction.rollback();
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { restaurantId, items, deliveryAddress, deliveryInstructions } = req.body;

    // Verify restaurant exists and is active
    const restaurant = await RestaurantModel.findByPk(Number(restaurantId), {
      transaction,
    });

    if (!restaurant) {
      await transaction.rollback();
      res.status(404).json({
        success: false,
        error: 'Restaurant not found',
      });
      return;
    }

    if (!restaurant.isActive) {
      await transaction.rollback();
      res.status(400).json({
        success: false,
        error: 'Restaurant is not active',
      });
      return;
    }

    // Validate all dishes exist, are available, and belong to the restaurant
    const dishIds = items.map((item: { dishId: number }) => item.dishId);
    const dishes = await DishModel.findAll({
      where: {
        id: { [Op.in]: dishIds },
        restaurantId: Number(restaurantId),
      },
      transaction,
    });

    if (dishes.length !== dishIds.length) {
      await transaction.rollback();
      res.status(400).json({
        success: false,
        error: 'One or more dishes not found or do not belong to this restaurant',
      });
      return;
    }

    // Check if all dishes are available
    const unavailableDishes = dishes.filter((dish) => !dish.isAvailable);
    if (unavailableDishes.length > 0) {
      await transaction.rollback();
      res.status(400).json({
        success: false,
        error: 'One or more dishes are not available',
        unavailableDishes: unavailableDishes.map((dish) => ({
          id: dish.id,
          name: dish.name,
        })),
      });
      return;
    }

    // Calculate order totals
    let subtotal = 0;
    const orderItemsData: Array<{
      dishId: number;
      quantity: number;
      priceAtOrder: number;
      subtotal: number;
      specialInstructions?: string | null;
    }> = [];

    for (const item of items) {
      const dish = dishes.find((d) => d.id === item.dishId);
      if (!dish) continue;

      const quantity = item.quantity;
      const priceAtOrder = dish.price;
      const itemSubtotal = quantity * priceAtOrder;

      subtotal += itemSubtotal;

      orderItemsData.push({
        dishId: dish.id,
        quantity,
        priceAtOrder,
        subtotal: itemSubtotal,
        specialInstructions: item.specialInstructions || null,
      });
    }

    // Validate minimum order amount
    if (subtotal < restaurant.minimumOrder) {
      await transaction.rollback();
      res.status(400).json({
        success: false,
        error: `Minimum order amount is ${restaurant.minimumOrder}. Current subtotal: ${subtotal}`,
      });
      return;
    }

    // Calculate delivery fee, service charge, and tax
    const deliveryFee = restaurant.deliveryFee;
    const serviceCharge = (subtotal + deliveryFee) * restaurant.serviceChargeRate;
    const taxAmount = (subtotal + deliveryFee + serviceCharge) * restaurant.taxRate;
    const totalAmount = subtotal + deliveryFee + serviceCharge + taxAmount;

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order
    const order = await OrderModel.create(
      {
        orderNumber,
        userId: user.id,
        restaurantId: Number(restaurantId),
        status: 'pending',
        totalAmount,
        subtotal,
        deliveryFee,
        serviceCharge,
        taxAmount,
        deliveryAddress,
        deliveryInstructions: deliveryInstructions || null,
        placedAt: new Date(),
      },
      { transaction },
    );

    // Create order items
    await OrderItemModel.bulkCreate(
      orderItemsData.map((item) => ({
        ...item,
        orderId: order.id,
      })),
      { transaction },
    );

    await transaction.commit();

    // Reload order with associations
    const orderWithItems = await OrderModel.findByPk(order.id, {
      include: [
        {
          model: OrderItemModel,
          as: 'orderItems',
          include: [
            {
              model: DishModel,
              as: 'dish',
              attributes: ['id', 'name', 'imageUri'],
            },
          ],
        },
        {
          model: RestaurantModel,
          as: 'restaurant',
          attributes: ['id', 'name', 'address'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: orderWithItems,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error placing order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to place order',
    });
  }
};

/**
 * Get order by ID with items
 */
export const getOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get authenticated user
    const user = req.user;
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { id } = req.params;

    const order = await OrderModel.findByPk(Number(id), {
      include: [
        {
          model: OrderItemModel,
          as: 'orderItems',
          include: [
            {
              model: DishModel,
              as: 'dish',
              attributes: ['id', 'name', 'imageUri', 'description'],
            },
          ],
        },
        {
          model: RestaurantModel,
          as: 'restaurant',
          attributes: ['id', 'name', 'address', 'phoneNumber'],
        },
      ],
    });

    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Order not found',
      });
      return;
    }

    // Verify user owns this order or is accessing restaurant orders
    // For now, allow users to view their own orders
    if (order.userId !== user.id) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You can only view your own orders.',
      });
      return;
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order',
    });
  }
};

/**
 * Get user's order history (paginated)
 */
export const getUserOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get authenticated user
    const user = req.user;
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const {
      page = 1,
      limit = 20,
      status,
      startDate,
      endDate,
      sortBy = 'placedAt',
      sortOrder = 'desc',
    } = req.query;

    const whereClause: WhereOptions<Order> = {
      userId: user.id,
    };

    if (status) {
      whereClause.status = status as OrderStatus;
    }

    if (startDate || endDate) {
      const dateCondition: any = {};
      if (startDate) {
        dateCondition[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        dateCondition[Op.lte] = new Date(endDate as string);
      }
      whereClause.placedAt = dateCondition;
    }

    const offset = (Number(page) - 1) * Number(limit);
    const orderBy = sortOrder === 'desc' ? 'DESC' : 'ASC';

    const { count, rows } = await OrderModel.findAndCountAll({
      where: whereClause,
      limit: Number(limit),
      offset,
      order: [[sortBy as string, orderBy]],
      include: [
        {
          model: RestaurantModel,
          as: 'restaurant',
          attributes: ['id', 'name', 'address'],
        },
      ],
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user orders',
    });
  }
};

/**
 * Get restaurant's orders (paginated)
 */
export const getRestaurantOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get authenticated user
    const user = req.user;
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const {
      page = 1,
      limit = 20,
      status,
      startDate,
      endDate,
      sortBy = 'placedAt',
      sortOrder = 'desc',
    } = req.query;

    const { restaurantId } = req.params;

    // Verify restaurant exists
    const restaurant = await RestaurantModel.findByPk(Number(restaurantId));
    if (!restaurant) {
      res.status(404).json({
        success: false,
        error: 'Restaurant not found',
      });
      return;
    }

    // TODO: Add authorization check - verify user owns/manages this restaurant
    // For now, any authenticated user can view restaurant orders

    const whereClause: WhereOptions<Order> = {
      restaurantId: Number(restaurantId),
    };

    if (status) {
      whereClause.status = status as OrderStatus;
    }

    if (startDate || endDate) {
      const dateCondition: any = {};
      if (startDate) {
        dateCondition[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        dateCondition[Op.lte] = new Date(endDate as string);
      }
      whereClause.placedAt = dateCondition;
    }

    const offset = (Number(page) - 1) * Number(limit);
    const orderBy = sortOrder === 'desc' ? 'DESC' : 'ASC';

    const { count, rows } = await OrderModel.findAndCountAll({
      where: whereClause,
      limit: Number(limit),
      offset,
      order: [[sortBy as string, orderBy]],
      include: [
        {
          model: OrderItemModel,
          as: 'orderItems',
          include: [
            {
              model: DishModel,
              as: 'dish',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching restaurant orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch restaurant orders',
    });
  }
};

/**
 * Get user's orders by user ID (paginated)
 */
export const getUserOrdersById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get authenticated user
    const authenticatedUser = req.user;
    if (!authenticatedUser) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const {
      page = 1,
      limit = 20,
      status,
      startDate,
      endDate,
      sortBy = 'placedAt',
      sortOrder = 'desc',
    } = req.query;

    const { id } = req.params;
    const userId = Number(id);

    // Verify user exists
    const user = await UserModel.findByPk(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    // Authorization check: users can only view their own orders
    // TODO: Add admin role check to allow admins to view any user's orders
    if (authenticatedUser.id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You can only view your own orders.',
      });
      return;
    }

    const whereClause: WhereOptions<Order> = {
      userId,
    };

    if (status) {
      whereClause.status = status as OrderStatus;
    }

    if (startDate || endDate) {
      const dateCondition: any = {};
      if (startDate) {
        dateCondition[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        dateCondition[Op.lte] = new Date(endDate as string);
      }
      whereClause.placedAt = dateCondition;
    }

    const offset = (Number(page) - 1) * Number(limit);
    const orderBy = sortOrder === 'desc' ? 'DESC' : 'ASC';

    const { count, rows } = await OrderModel.findAndCountAll({
      where: whereClause,
      limit: Number(limit),
      offset,
      order: [[sortBy as string, orderBy]],
      include: [
        {
          model: RestaurantModel,
          as: 'restaurant',
          attributes: ['id', 'name', 'address'],
        },
      ],
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user orders',
    });
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get authenticated user
    const user = req.user;
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { id } = req.params;
    const { status, estimatedDeliveryTime, actualDeliveryTime } = req.body;

    const order = await OrderModel.findByPk(Number(id));

    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Order not found',
      });
      return;
    }

    // Verify user owns the restaurant for this order
    // TODO: Add proper authorization check - verify user owns/manages the restaurant
    // For now, any authenticated user can update order status
    // In production, this should check if user.role === 'restaurant_owner' && user.restaurantId === order.restaurantId

    // Validate status transitions (basic validation)
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['out_for_delivery', 'cancelled'],
      out_for_delivery: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: [],
    };

    const allowedStatuses = validTransitions[order.status];
    if (!allowedStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: `Cannot transition from ${order.status} to ${status}. Valid transitions: ${allowedStatuses.join(', ')}`,
      });
      return;
    }

    // Update order
    await order.update({
      status,
      estimatedDeliveryTime: estimatedDeliveryTime || null,
      actualDeliveryTime: actualDeliveryTime || null,
    });

    // Reload with associations
    const updatedOrder = await OrderModel.findByPk(order.id, {
      include: [
        {
          model: OrderItemModel,
          as: 'orderItems',
          include: [
            {
              model: DishModel,
              as: 'dish',
              attributes: ['id', 'name', 'imageUri'],
            },
          ],
        },
        {
          model: RestaurantModel,
          as: 'restaurant',
          attributes: ['id', 'name', 'address'],
        },
      ],
    });

    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status',
    });
  }
};

