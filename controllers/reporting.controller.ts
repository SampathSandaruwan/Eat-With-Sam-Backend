import { Request, Response } from 'express';
import { col, fn, literal, Op, WhereOptions } from 'sequelize';

import { DishModel, OrderItemModel, OrderModel, RestaurantModel } from '../models';
import type {
  AverageOrderValueQuery,
  AverageOrderValueReport,
  Order,
  ReportingResponse,
  SalesReportItem,
  SalesReportQuery,
  TopSellingItem,
  TopSellingItemsQuery,
} from '../types';

/**
 * Get total sales by time period (day/week/month)
 */
export const getSalesReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      period,
      startDate,
      endDate,
      status,
      page = 1,
      limit = 20,
      sortBy = 'date',
      sortOrder = 'desc',
    } = req.query as unknown as SalesReportQuery;

    // Set default date range to last 30 days if not provided
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const queryStartDate = startDate || defaultStartDate;
    const queryEndDate = endDate || defaultEndDate;

    // Build where clause
    const whereClause: WhereOptions<Order> = {
      placedAt: {
        [Op.between]: [queryStartDate, queryEndDate],
      },
    };

    // Filter by status if provided
    if (status) {
      if (Array.isArray(status)) {
        whereClause.status = { [Op.in]: status };
      } else {
        whereClause.status = status;
      }
    }

    // Build grouping and selection based on period
    let groupBy: (ReturnType<typeof fn>)[] = [];

    type RawAttributes = {
      orderCount: number;
      totalSales: number;
      totalSubtotal: number;
      totalDeliveryFees: number;
      totalTax: number;
      averageOrderValue: number;
      date: string;
      year: number;
      week: number;
      month: number;
    };
    const attributes: Array<[ReturnType<typeof fn>, string]> = [
      [fn('COUNT', col('id')), 'orderCount'],
      [fn('SUM', col('totalAmount')), 'totalSales'],
      [fn('SUM', col('subtotal')), 'totalSubtotal'],
      [fn('SUM', col('deliveryFee')), 'totalDeliveryFees'],
      [fn('SUM', col('taxAmount')), 'totalTax'],
      [fn('AVG', col('totalAmount')), 'averageOrderValue'],
    ];

    switch (period) {
      case 'day':
        attributes.unshift(
          [fn('DATE', col('placedAt')), 'date'],
        );
        groupBy = [fn('DATE', col('placedAt'))];
        break;

      case 'week':
        attributes.unshift(
          [fn('YEAR', col('placedAt')), 'year'],
          [fn('WEEK', col('placedAt')), 'week'],
        );
        groupBy = [
          fn('YEAR', col('placedAt')),
          fn('WEEK', col('placedAt')),
        ];
        break;

      case 'month':
        attributes.unshift(
          [fn('YEAR', col('placedAt')), 'year'],
          [fn('MONTH', col('placedAt')), 'month'],
        );
        groupBy = [
          fn('YEAR', col('placedAt')),
          fn('MONTH', col('placedAt')),
        ];
        break;

      default:
        res.status(400).json({
          success: false,
          error: 'Invalid period. Must be "day", "week", or "month"',
        });
        return;
    }

    // Build order clause
    let orderBy: Array<[ReturnType<typeof fn> | string, string]>;
    switch (sortBy) {
      case 'totalSales':
        orderBy = [[fn('SUM', col('totalAmount')), sortOrder.toUpperCase()]];
        break;
      case 'orderCount':
        orderBy = [[fn('COUNT', col('id')), sortOrder.toUpperCase()]];
        break;
      case 'averageOrderValue':
        orderBy = [[fn('AVG', col('totalAmount')), sortOrder.toUpperCase()]];
        break;
      case 'date':
      default:
        if (period === 'day') {
          orderBy = [[fn('DATE', col('placedAt')), sortOrder.toUpperCase()]];
        } else {
          orderBy = [
            [fn('YEAR', col('placedAt')), sortOrder.toUpperCase()],
            [fn(period === 'week' ? 'WEEK' : 'MONTH', col('placedAt')), sortOrder.toUpperCase()],
          ];
        }
        break;
    }

    // Get total count for pagination
    // For grouped queries, count distinct groups
    const countQuery = await OrderModel.findAll({
      where: whereClause,
      attributes: [[fn('COUNT', col('id')), 'orderCount']],
      group: groupBy,
      raw: true,
    });

    const total = countQuery.length;

    // Apply pagination
    const offset = (Number(page) - 1) * Number(limit);

    // Get paginated results
    const results: RawAttributes[] = (await OrderModel.findAll({
      where: whereClause,
      attributes: attributes,
      group: groupBy,
      order: orderBy,
      limit: Number(limit),
      offset,
      raw: true,
    })) as unknown as RawAttributes[];

    // Format results
    const formattedResults: SalesReportItem[] = results.map((row) => {
      let dateValue = row.date;
      if (!dateValue && row.year) {
        if (row.week) {
          dateValue = `${row.year}-W${String(row.week).padStart(2, '0')}`;
        } else if (row.month) {
          dateValue = `${row.year}-${String(row.month).padStart(2, '0')}`;
        }
      }

      const item: SalesReportItem = {
        date: dateValue || '',
        orderCount: Number(row.orderCount) || 0,
        totalSales: Number(row.totalSales) || 0,
      };

      if (row.year) item.year = Number(row.year);
      if (row.week) item.week = Number(row.week);
      if (row.month) item.month = Number(row.month);
      if (row.totalSubtotal !== undefined) item.totalSubtotal = Number(row.totalSubtotal);
      if (row.totalDeliveryFees !== undefined) item.totalDeliveryFees = Number(row.totalDeliveryFees);
      if (row.totalTax !== undefined) item.totalTax = Number(row.totalTax);
      if (row.averageOrderValue !== undefined) item.averageOrderValue = Number(row.averageOrderValue);

      return item;
    });

    const response: ReportingResponse<SalesReportItem> = {
      success: true,
      data: formattedResults,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
      filters: {
        startDate: queryStartDate.toISOString(),
        endDate: queryEndDate.toISOString(),
        status: status ? (Array.isArray(status) ? status : [status]) : undefined,
        period,
        sortBy,
        sortOrder,
      },
    };

    res.json(response);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching sales report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sales report',
    });
  }
};

/**
 * Get top-selling items by quantity or revenue
 */
export const getTopSellingItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      sortBy,
      startDate,
      endDate,
      status,
      restaurantId,
      page = 1,
      limit = 20,
    } = req.query as unknown as TopSellingItemsQuery;

    // Set default date range to last 30 days if not provided
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const queryStartDate = startDate || defaultStartDate;
    const queryEndDate = endDate || defaultEndDate;

    // Build where clause for orders
    const orderWhereClause: WhereOptions = {
      placedAt: {
        [Op.between]: [queryStartDate, queryEndDate],
      },
    };

    // Filter by status if provided
    if (status) {
      if (Array.isArray(status)) {
        orderWhereClause.status = { [Op.in]: status };
      } else {
        orderWhereClause.status = status;
      }
    } else {
      // Default: exclude cancelled orders
      orderWhereClause.status = { [Op.ne]: 'cancelled' };
    }

    if (restaurantId) {
      orderWhereClause.restaurantId = restaurantId;
    }

    type RawAttributes = {
      id: number;
      name: string;
      restaurantId: number;
      restaurantName: string;
      totalQuantitySold: number;
      totalRevenue: number;
      orderCount: number;
    };
    // Build attributes based on sortBy
    const attributes = [
      [col('dish.id'), 'id'],
      [col('dish.name'), 'name'],
      [col('dish.restaurantId'), 'restaurantId'],
      ...(restaurantId ? [] : [[col('dish->restaurant.name'), 'restaurantName']]),
      [fn('SUM', col('OrderItem.quantity')), 'totalQuantitySold'],
      [fn('SUM', col('OrderItem.subtotal')), 'totalRevenue'],
      [literal('COUNT(DISTINCT `OrderItem`.`orderId`)'), 'orderCount'],
    ];

    // Build order clause
    let orderBy: Array<[ReturnType<typeof fn>, string]>;
    if (sortBy === 'quantity') {
      orderBy = [[fn('SUM', col('OrderItem.quantity')), 'DESC']];
    } else {
      orderBy = [[fn('SUM', col('OrderItem.subtotal')), 'DESC']];
    }

    // Get total count for pagination
    const countResult = await OrderItemModel.findAll({
      attributes: [
        [col('dish.id'), 'dishId'],
        [literal('COUNT(DISTINCT `OrderItem`.`dishId`)'), 'count'],
      ],
      include: [
        {
          model: DishModel,
          as: 'dish',
          attributes: [],
          include: restaurantId
            ? []
            : [
              {
                model: RestaurantModel,
                as: 'restaurant',
                attributes: [],
              },
            ],
        },
        {
          model: OrderModel,
          as: 'order',
          attributes: [],
          where: orderWhereClause,
        },
      ],
      group: [col('dish.id')],
      raw: true,
    });

    const total = countResult.length;

    // Apply pagination
    const offset = (Number(page) - 1) * Number(limit);

    // Get paginated results
    const results: RawAttributes[] = (await OrderItemModel.findAll({
      attributes: attributes as any,
      include: [
        {
          model: DishModel,
          as: 'dish',
          attributes: [],
          include: restaurantId
            ? []
            : [
              {
                model: RestaurantModel,
                as: 'restaurant',
                attributes: [],
              },
            ],
        },
        {
          model: OrderModel,
          as: 'order',
          attributes: [],
          where: orderWhereClause,
        },
      ],
      group: [
        col('dish.id'),
        col('dish.name'),
        col('dish.restaurantId'),
        ...(restaurantId ? [] : [col('dish->restaurant.id'), col('dish->restaurant.name')]),
      ],
      order: orderBy,
      limit: Number(limit),
      offset,
      raw: true,
    })) as unknown as RawAttributes[];

    // Format results
    const formattedResults: TopSellingItem[] = results.map((row) => ({
      id: Number(row.id),
      name: row.name,
      restaurantId: Number(row.restaurantId),
      restaurantName: row.restaurantName || '',
      totalQuantitySold: Number(row.totalQuantitySold) || 0,
      totalRevenue: Number(row.totalRevenue) || 0,
      orderCount: Number(row.orderCount) || 0,
    }));

    const response: ReportingResponse<TopSellingItem> = {
      success: true,
      data: formattedResults,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
      filters: {
        startDate: queryStartDate.toISOString(),
        endDate: queryEndDate.toISOString(),
        status: status ? (Array.isArray(status) ? status : [status]) : undefined,
        sortBy,
      },
    };

    res.json(response);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching top-selling items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top-selling items',
    });
  }
};

/**
 * Get average order value by time period
 */
export const getAverageOrderValue = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      period,
      startDate,
      endDate,
      status,
      restaurantId,
      page = 1,
      limit = 20,
      sortBy = 'averageOrderValue',
      sortOrder = 'desc',
    } = req.query as unknown as AverageOrderValueQuery;

    // Set default date range to last 30 days if not provided
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const queryStartDate = startDate || defaultStartDate;
    const queryEndDate = endDate || defaultEndDate;

    // Build where clause
    const whereClause: WhereOptions = {
      placedAt: {
        [Op.between]: [queryStartDate, queryEndDate],
      },
    };

    // Filter by status if provided
    if (status) {
      if (Array.isArray(status)) {
        whereClause.status = { [Op.in]: status };
      } else {
        whereClause.status = status;
      }
    } else {
      // Default: exclude cancelled orders
      whereClause.status = { [Op.ne]: 'cancelled' };
    }

    if (restaurantId) {
      whereClause.restaurantId = restaurantId;
    }

    // Build grouping and selection based on period
    let groupBy: (ReturnType<typeof fn> | ReturnType<typeof col>)[];
    let attributes: Array<[ReturnType<typeof fn>, string] | [ReturnType<typeof col>, string]> = [
      [fn('COUNT', col('id')), 'orderCount'],
      [fn('AVG', col('totalAmount')), 'averageOrderValue'],
      [fn('MIN', col('totalAmount')), 'minOrderValue'],
      [fn('MAX', col('totalAmount')), 'maxOrderValue'],
      [fn('SUM', col('totalAmount')), 'totalSales'],
    ];

    if (restaurantId) {
      // Single restaurant report - no restaurant grouping needed
      switch (period) {
        case 'day':
          attributes.unshift(
            [fn('DATE', col('placedAt')), 'date'],
          );
          groupBy = [fn('DATE', col('placedAt'))];
          break;

        case 'week':
          attributes.unshift(
            [fn('YEAR', col('placedAt')), 'year'],
            [fn('WEEK', col('placedAt')), 'week'],
          );
          groupBy = [
            fn('YEAR', col('placedAt')),
            fn('WEEK', col('placedAt')),
          ];
          break;

        case 'month':
          attributes.unshift(
            [fn('YEAR', col('placedAt')), 'year'],
            [fn('MONTH', col('placedAt')), 'month'],
          );
          groupBy = [
            fn('YEAR', col('placedAt')),
            fn('MONTH', col('placedAt')),
          ];
          break;

        default:
          res.status(400).json({
            success: false,
            error: 'Invalid period. Must be "day", "week", or "month"',
          });
          return;
      }
    } else {
      // Multi-restaurant report - group by restaurant
      // Query from OrderModel and include Restaurant to avoid subquery issues

      attributes = [
        [col('restaurant.id'), 'restaurantId'],
        [col('restaurant.name'), 'restaurantName'],
        [fn('COUNT', col('Order.id')), 'orderCount'],
        [fn('AVG', col('Order.totalAmount')), 'averageOrderValue'],
        [fn('SUM', col('Order.totalAmount')), 'totalSales'],
      ];
      groupBy = [col('restaurant.id'), col('restaurant.name')];
    }

    // Build order clause
    let orderBy: Array<[ReturnType<typeof fn> | ReturnType<typeof col> | string, string]>;
    switch (sortBy) {
      case 'averageOrderValue':
        orderBy = [[fn('AVG', col(restaurantId ? 'totalAmount' : 'Order.totalAmount')), sortOrder.toUpperCase()]];
        break;
      case 'totalSales':
        orderBy = [[fn('SUM', col(restaurantId ? 'totalAmount' : 'Order.totalAmount')), sortOrder.toUpperCase()]];
        break;
      case 'orderCount':
        orderBy = [[fn('COUNT', col(restaurantId ? 'id' : 'Order.id')), sortOrder.toUpperCase()]];
        break;
      case 'date':
      default:
        if (!restaurantId) {
          orderBy = [[fn('AVG', col('Order.totalAmount')), sortOrder.toUpperCase()]];
        } else if (period === 'day') {
          orderBy = [[fn('DATE', col('placedAt')), sortOrder.toUpperCase()]];
        } else {
          orderBy = [
            [fn('YEAR', col('placedAt')), sortOrder.toUpperCase()],
            [fn(period === 'week' ? 'WEEK' : 'MONTH', col('placedAt')), sortOrder.toUpperCase()],
          ];
        }
        break;
    }

    // Get total count for pagination
    // For grouped queries, count distinct groups
    let countResult;
    if (restaurantId) {
      countResult = await OrderModel.findAll({
        where: whereClause,
        attributes: [[fn('COUNT', col('id')), 'orderCount']],
        group: groupBy,
        raw: true,
      });
    } else {
      countResult = await OrderModel.findAll({
        where: whereClause,
        attributes: [[col('restaurantId'), 'restaurantId']],
        include: [
          {
            model: RestaurantModel,
            as: 'restaurant',
            attributes: [],
          },
        ],
        group: [col('restaurantId')],
        raw: true,
      });
    }

    const total = countResult.length;

    // Apply pagination
    const offset = (Number(page) - 1) * Number(limit);

    // Get paginated results
    let results;
    if (restaurantId) {
      results = await OrderModel.findAll({
        where: whereClause,
        attributes: attributes,
        group: groupBy,
        order: orderBy,
        limit: Number(limit),
        offset,
        raw: true,
      });
    } else {
      results = await OrderModel.findAll({
        where: whereClause,
        attributes: attributes,
        include: [
          {
            model: RestaurantModel,
            as: 'restaurant',
            attributes: [],
          },
        ],
        group: groupBy,
        order: orderBy,
        limit: Number(limit),
        offset,
        raw: true,
      });
    }

    // Format results
    const formattedResults: AverageOrderValueReport[] = results.map((row: any) => {
      let dateValue = row.date;
      if (!dateValue && row.year) {
        if (row.week) {
          dateValue = `${row.year}-W${String(row.week).padStart(2, '0')}`;
        } else if (row.month) {
          dateValue = `${row.year}-${String(row.month).padStart(2, '0')}`;
        }
      }

      const item: AverageOrderValueReport = {
        orderCount: Number(row.orderCount) || 0,
        averageOrderValue: Number(row.averageOrderValue) || 0,
      };

      if (dateValue) item.date = dateValue;
      if (row.year) item.year = Number(row.year);
      if (row.week) item.week = Number(row.week);
      if (row.month) item.month = Number(row.month);
      if (row.restaurantId) item.restaurantId = Number(row.restaurantId);
      if (row.restaurantName) item.restaurantName = row.restaurantName;
      if (row.minOrderValue !== undefined) item.minOrderValue = Number(row.minOrderValue);
      if (row.maxOrderValue !== undefined) item.maxOrderValue = Number(row.maxOrderValue);
      if (row.totalSales !== undefined) item.totalSales = Number(row.totalSales);

      return item;
    });

    const response: ReportingResponse<AverageOrderValueReport> = {
      success: true,
      data: formattedResults,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
      filters: {
        startDate: queryStartDate.toISOString(),
        endDate: queryEndDate.toISOString(),
        status: status ? (Array.isArray(status) ? status : [status]) : undefined,
        period,
        sortBy,
        sortOrder,
      },
    };

    res.json(response);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching average order value:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch average order value',
    });
  }
};

