import { Request, Response } from 'express';
import { WhereOptions } from 'sequelize';

import { MenuCategoryModel, RestaurantModel } from '../models';
import { MenuCategory } from '../types';

export const getAllCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await MenuCategoryModel.findAll();
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
    });
  }
};

export const getCategoriesByRestaurantId = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { restaurantId } = req.params;
    const { isActive } = req.query;

    // Verify restaurant exists
    const restaurant = await RestaurantModel.findByPk(restaurantId);
    if (!restaurant) {
      res.status(404).json({
        success: false,
        error: 'Restaurant not found',
      });
      return;
    }

    const filters: WhereOptions<MenuCategory> = {
      restaurantId: Number(restaurantId),
    };

    if (isActive !== undefined) {
      const isActiveValue = typeof isActive === 'string' ? isActive === 'true' : Boolean(isActive);
      filters.isActive = isActiveValue;
    }

    const categories = await MenuCategoryModel.findAll({
      where: filters,
      order: [['displayOrder', 'ASC']],
      include: [
        {
          model: RestaurantModel,
          as: 'restaurant',
          attributes: ['id', 'name'],
        },
      ],
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
    });
  }
};

