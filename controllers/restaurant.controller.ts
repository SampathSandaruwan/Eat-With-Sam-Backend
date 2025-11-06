import { Request, Response } from 'express';
import { WhereOptions } from 'sequelize';

import { RestaurantModel } from '../models';
import { Restaurant } from '../types';

export const getAllRestaurants = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      isActive,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query;

    const whereClause: WhereOptions<Restaurant> = {};
    if (isActive !== undefined) {
      const isActiveValue =
        typeof isActive === 'string' ? isActive === 'true' : Boolean(isActive);
      whereClause.isActive = isActiveValue;
    }

    const offset = (Number(page) - 1) * Number(limit);
    const orderBy = sortOrder === 'desc' ? 'DESC' : 'ASC';

    const { count, rows } = await RestaurantModel.findAndCountAll({
      where: whereClause,
      limit: Number(limit),
      offset,
      order: [[sortBy as string, orderBy]],
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
    console.error('Error fetching restaurants:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch restaurants',
    });
  }
};

export const getRestaurantById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await RestaurantModel.findByPk(Number(restaurantId));

    if (!restaurant) {
      res.status(404).json({
        success: false,
        error: 'Restaurant not found',
      });
      return;
    }

    res.json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch restaurant',
    });
  }
};

export const createRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurant = await RestaurantModel.create(req.body);

    res.status(201).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create restaurant',
    });
  }
};

export const updateRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await RestaurantModel.findByPk(Number(restaurantId));

    if (!restaurant) {
      res.status(404).json({
        success: false,
        error: 'Restaurant not found',
      });
      return;
    }

    await restaurant.update(req.body);
    await restaurant.reload();

    res.json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update restaurant',
    });
  }
};

export const deleteRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await RestaurantModel.findByPk(Number(restaurantId));

    if (!restaurant) {
      res.status(404).json({
        success: false,
        error: 'Restaurant not found',
      });
      return;
    }

    await restaurant.destroy();

    res.json({
      success: true,
      message: 'Restaurant deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete restaurant',
    });
  }
};

