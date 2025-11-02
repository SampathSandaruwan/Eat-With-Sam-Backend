import { Request, Response } from 'express';
import { WhereOptions } from 'sequelize';

import { RestaurantModel } from '../models';
import { Restaurant } from '../types';

export const getAllRestaurants = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { isActive } = req.query;

    const whereClause: WhereOptions<Restaurant> = {};
    if (isActive !== undefined) {
      const isActiveValue =
        typeof isActive === 'string' ? isActive === 'true' : Boolean(isActive);
      whereClause.isActive = isActiveValue;
    }

    const restaurants = await RestaurantModel.findAll({
      where: whereClause,
      order: [['name', 'ASC']],
    });

    res.json({
      success: true,
      data: restaurants,
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
    const { id } = req.params;

    const restaurant = await RestaurantModel.findByPk(Number(id));

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

