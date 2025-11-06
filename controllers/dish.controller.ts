import { Request, Response } from 'express';
import { Op, WhereOptions } from 'sequelize';

import { DishModel, MenuCategoryModel, RestaurantModel } from '../models';
import { Dish } from '../types';

export const getDishById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dishId } = req.params;

    const dish = await DishModel.findByPk(Number(dishId), {
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

    if (!dish) {
      res.status(404).json({
        success: false,
        error: 'Dish not found',
      });
      return;
    }

    res.json({
      success: true,
      data: dish,
    });
  } catch (error) {
    console.error('Error fetching dish:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dish',
    });
  }
};

const _generateWhereClause = (params: {
  isAvailable?: string;
  minPrice?: string;
  maxPrice?: string;
  categoryId?: string;
} = {}) => {
  const whereClause: WhereOptions<Dish> = {};
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

const _filterDishes = async (
  res: Response,
  whereClause: WhereOptions<Dish> = {},
  page = 1,
  limit = 20,
  sortBy = 'name',
  sortOrder: 'asc' | 'desc' = 'asc',
) => {
  const offset = (Number(page) - 1) * Number(limit);
  const orderBy = sortOrder === 'desc' ? 'DESC' : 'ASC';

  const { count, rows } = await DishModel.findAndCountAll({
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

export const getAllDishes = async (req: Request, res: Response): Promise<void> => {
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

    _filterDishes(
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
    console.error('Error fetching dishes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dishes',
    });
  }
};

export const getDishesByCategoryId = async (req: Request, res: Response): Promise<void> => {
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

    _filterDishes(
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
    console.error('Error fetching dishes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dishes',
    });
  }
};

export const createDish = async (req: Request, res: Response): Promise<void> => {
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

    const dish = await DishModel.create(req.body);

    res.status(201).json({
      success: true,
      data: dish,
    });
  } catch (error) {
    console.error('Error creating dish:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create dish',
    });
  }
};

export const updateDish = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dishId } = req.params;

    const dish = await DishModel.findByPk(Number(dishId), {
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

    if (!dish) {
      res.status(404).json({
        success: false,
        error: 'Dish not found',
      });
      return;
    }

    await dish.update(req.body);
    await dish.reload({
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
      data: dish,
    });
  } catch (error) {
    console.error('Error updating dish:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update dish',
    });
  }
};

export const deleteDish = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dishId } = req.params;

    const dish = await DishModel.findByPk(Number(dishId));

    if (!dish) {
      res.status(404).json({
        success: false,
        error: 'Dish not found',
      });
      return;
    }

    await dish.destroy();

    res.json({
      success: true,
      message: 'Dish deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting dish:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete dish',
    });
  }
};

