import { Request, Response } from 'express';
import { Op, WhereOptions } from 'sequelize';

import { MenuCategoryModel, MenuItemModel, RestaurantModel } from '../models';
import { MenuItem } from '../types';

export const getMenuItemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItemModel.findByPk(Number(id), {
      include: [
        {
          model: MenuCategoryModel,
          as: 'category',
          attributes: ['id', 'name', 'displayOrder'],
        },
        {
          model: RestaurantModel,
          as: 'restaurant',
          attributes: ['id', 'name', 'address'],
        },
      ],
    });

    if (!menuItem) {
      res.status(404).json({
        success: false,
        error: 'Menu item not found',
      });
      return;
    }

    res.json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu item',
    });
  }
};

export const getMenuItemsByCategoryId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const {
      page = 1,
      limit = 20,
      isAvailable,
      minPrice,
      maxPrice,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query;

    // Verify restaurant exists
    const category = await MenuCategoryModel.findByPk(categoryId);
    if (!category) {
      res.status(404).json({
        success: false,
        error: 'Category not found',
      });
      return;
    }

    const filters: WhereOptions<MenuItem> = {
      categoryId: Number(categoryId),
    };

    if (categoryId) {
      filters.categoryId = Number(categoryId);
    }

    if (isAvailable !== undefined) {
      const isAvailableValue =
        typeof isAvailable === 'string'
          ? isAvailable === 'true'
          : Boolean(isAvailable);
      filters.isAvailable = isAvailableValue;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: {
        [Op.gte]?: number;
        [Op.lte]?: number;
      } = {};

      if (minPrice !== undefined) {
        priceFilter[Op.gte] = Number(minPrice);
      }
      if (maxPrice !== undefined) {
        priceFilter[Op.lte] = Number(maxPrice);
      }

      filters.price = priceFilter;
    }

    const offset = (Number(page) - 1) * Number(limit);
    const orderBy = sortOrder === 'desc' ? 'DESC' : 'ASC';

    const { count, rows } = await MenuItemModel.findAndCountAll({
      where: filters,
      limit: Number(limit),
      offset,
      order: [[sortBy as string, orderBy]],
      include: [
        {
          model: MenuCategoryModel,
          as: 'category',
          attributes: ['id', 'name', 'displayOrder'],
        },
        {
          model: RestaurantModel,
          as: 'restaurant',
          attributes: ['id', 'name'],
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
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu items',
    });
  }
};

