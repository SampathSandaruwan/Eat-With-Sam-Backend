import { Request, Response } from 'express';
import { WhereOptions } from 'sequelize';

import { MenuCategoryModel, RestaurantModel } from '../models';
import { MenuCategory } from '../types';

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const category = await MenuCategoryModel.findByPk(Number(categoryId));

    if (!category) {
      res.status(404).json({
        success: false,
        error: 'Menu category not found',
      });
      return;
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category',
    });
  }
};

const _generateWhereClause = (params: {
  isActive?: string;
  restaurantId?: string;
} = {}) => {
  const whereClause: WhereOptions<MenuCategory> = {};
  if (params.restaurantId !== undefined) {
    whereClause.restaurantId = Number(params.restaurantId);
  }
  if (params.isActive !== undefined) {
    whereClause.isActive = params.isActive === 'true';
  }

  return whereClause;
};

const _filterCategories = async (
  res: Response,
  whereClause: WhereOptions<MenuCategory> = {},
  page = 1,
  limit = 20,
  sortBy = 'displayOrder',
  sortOrder: 'asc' | 'desc' = 'asc',
): Promise<void> => {
  const offset = (Number(page) - 1) * Number(limit);
  const orderBy = sortOrder === 'desc' ? 'DESC' : 'ASC';

  const { count, rows } = await MenuCategoryModel.findAndCountAll({
    where: whereClause,
    limit: Number(limit),
    offset,
    order: [[sortBy as string, orderBy]],
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
    data: rows,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count,
      totalPages: Math.ceil(count / Number(limit)),
    },
  });
};

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      isActive,
      sortBy = 'displayOrder',
      sortOrder = 'asc',
      restaurantId,
    } = req.query;

    await _filterCategories(
      res,
      _generateWhereClause({
        restaurantId: restaurantId?.toString(),
        isActive: isActive?.toString(),
      }),
      Number(page),
      Number(limit),
      sortBy.toString(),
      sortOrder.toString() as 'asc' | 'desc',
    );
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
  const {
    page = 1,
    limit = 20,
    isActive,
    sortBy = 'displayOrder',
    sortOrder = 'asc',
  } = req.query;

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

    await _filterCategories(
      res,
      _generateWhereClause({
        restaurantId: restaurantId?.toString(),
        isActive: isActive?.toString(),
      }),
      Number(page),
      Number(limit),
      sortBy.toString(),
      sortOrder.toString() as 'asc' | 'desc',
    );
  } catch (error) {
    console.error('Error fetching categories by restaurant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories by restaurant',
    });
  }
};

export const createMenuCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId } = req.body;

    // Verify restaurant exists
    const restaurant = await RestaurantModel.findByPk(Number(restaurantId));
    if (!restaurant) {
      res.status(404).json({
        success: false,
        error: 'Restaurant not found',
      });
      return;
    }

    const category = await MenuCategoryModel.create(req.body);

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error creating menu category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create menu category',
    });
  }
};

export const updateMenuCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;

    const category = await MenuCategoryModel.findByPk(Number(categoryId));

    if (!category) {
      res.status(404).json({
        success: false,
        error: 'Menu category not found',
      });
      return;
    }

    await category.update(req.body);
    await category.reload();

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error updating menu category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update menu category',
    });
  }
};

export const deleteMenuCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;

    const category = await MenuCategoryModel.findByPk(Number(categoryId));

    if (!category) {
      res.status(404).json({
        success: false,
        error: 'Menu category not found',
      });
      return;
    }

    await category.destroy();

    res.json({
      success: true,
      message: 'Menu category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting menu category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete menu category',
    });
  }
};

