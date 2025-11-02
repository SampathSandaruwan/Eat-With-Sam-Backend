import { Request, Response } from 'express';
import { Op, WhereOptions } from 'sequelize';

import { MenuCategoryModel, MenuItemModel, RestaurantModel } from '../models';
import { MenuItem } from '../types';

export const getMenuItemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { menuItemId } = req.params;

    const menuItem = await MenuItemModel.findByPk(Number(menuItemId), {
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

const _generateWhereClause = (params: {
  isAvailable?: string;
  minPrice?: string;
  maxPrice?: string;
  categoryId?: string;
} = {}) => {
  const whereClause: WhereOptions<MenuItem> = {};
  if (params.categoryId !== undefined) {
    whereClause.categoryId = Number(params.categoryId);
  }
  if (params.isAvailable !== undefined) {
    whereClause.isAvailable = params.isAvailable === 'true';
  }
  if (params.minPrice !== undefined) {
    whereClause.price = { [Op.gte]: Number(params.minPrice) };
  }
  if (params.maxPrice !== undefined) {
    whereClause.price = { [Op.lte]: Number(params.maxPrice) };
  }
  return whereClause;
};

const _filterMenuItems = async (
  res: Response,
  whereClause: WhereOptions<MenuItem> = {},
  page = 1,
  limit = 20,
  sortBy = 'name',
  sortOrder: 'asc' | 'desc' = 'asc',
) => {
  const offset = (Number(page) - 1) * Number(limit);
  const orderBy = sortOrder === 'desc' ? 'DESC' : 'ASC';

  const { count, rows } = await MenuItemModel.findAndCountAll({
    where: whereClause,
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
};

export const getAllMenuItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      isAvailable,
      minPrice,
      maxPrice,
      categoryId,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query;

    _filterMenuItems(
      res,
      _generateWhereClause({
        categoryId: categoryId?.toString(),
        isAvailable: isAvailable?.toString(),
        minPrice: minPrice?.toString(),
        maxPrice: maxPrice?.toString(),
      }),
      Number(page),
      Number(limit),
      sortBy.toString(),
      sortOrder.toString() as 'asc' | 'desc',
    );
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu items',
    });
  }
};

export const getMenuItemsByCategoryId = async (req: Request, res: Response): Promise<void> => {
  const {
    page = 1,
    limit = 20,
    isAvailable,
    minPrice,
    maxPrice,
    sortBy = 'name',
    sortOrder = 'asc',
  } = req.query;

  try {
    const { categoryId } = req.params;

    // Verify category exists
    const category = await MenuCategoryModel.findByPk(Number(categoryId));
    if (!category) {
      res.status(404).json({
        success: false,
        error: 'Category not found',
      });
      return;
    }

    _filterMenuItems(
      res,
      _generateWhereClause({
        categoryId: categoryId?.toString(),
        isAvailable: isAvailable?.toString(),
        minPrice: minPrice?.toString(),
        maxPrice: maxPrice?.toString(),
      }),
      Number(page),
      Number(limit),
      sortBy.toString(),
      sortOrder.toString() as 'asc' | 'desc',
    );
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu items',
    });
  }
};

export const createMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId, restaurantId } = req.body;

    // Verify category exists
    const category = await MenuCategoryModel.findByPk(Number(categoryId));
    if (!category) {
      res.status(404).json({
        success: false,
        error: 'Category not found',
      });
      return;
    }

    // Verify restaurant exists
    const restaurant = await RestaurantModel.findByPk(Number(restaurantId));
    if (!restaurant) {
      res.status(404).json({
        success: false,
        error: 'Restaurant not found',
      });
      return;
    }

    // Verify category belongs to restaurant
    if (category.restaurantId !== Number(restaurantId)) {
      res.status(400).json({
        success: false,
        error: 'Category does not belong to the specified restaurant',
      });
      return;
    }

    const menuItem = await MenuItemModel.create(req.body);

    res.status(201).json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create menu item',
    });
  }
};

export const updateMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { menuItemId } = req.params;

    const menuItem = await MenuItemModel.findByPk(Number(menuItemId), {
      include: [
        {
          model: MenuCategoryModel,
          as: 'category',
          attributes: ['id', 'name'],
        },
        {
          model: RestaurantModel,
          as: 'restaurant',
          attributes: ['id', 'name'],
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

    await menuItem.update(req.body);
    await menuItem.reload({
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

    res.json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update menu item',
    });
  }
};

export const deleteMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { menuItemId } = req.params;

    const menuItem = await MenuItemModel.findByPk(Number(menuItemId));

    if (!menuItem) {
      res.status(404).json({
        success: false,
        error: 'Menu item not found',
      });
      return;
    }

    await menuItem.destroy();

    res.json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete menu item',
    });
  }
};

