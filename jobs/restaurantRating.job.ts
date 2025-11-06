/* eslint-disable no-console */
import { Op } from 'sequelize';

import { DishModel, RestaurantModel } from '../models';

interface RatingCalculationResult {
  success: boolean;
  processed: number;
  errors: number;
  message: string;
}

/**
 * Calculate restaurant average rating from dishes
 * Uses weighted average: (sum of dish.averageRating * dish.ratingCount) / total ratingCount
 * This ensures restaurants with more rated dishes have accurate overall ratings
 */
export const calculateRestaurantRatings = async (): Promise<RatingCalculationResult> => {
  try {
    console.log('[Restaurant Rating Job] Starting restaurant rating calculation...');

    // Get all restaurants (ratings are historical data, so process all)
    const restaurants = await RestaurantModel.findAll({
      attributes: ['id'],
    });

    let processed = 0;
    let errors = 0;

    for (const restaurant of restaurants) {
      try {
        // Get all dishes for this restaurant with their ratings
        const dishes = await DishModel.findAll({
          where: {
            restaurantId: restaurant.id,
            ratingCount: {
              [Op.gt]: 0, // Only include items that have ratings
            },
          },
          attributes: ['averageRating', 'ratingCount'],
        });

        if (dishes.length === 0) {
          // No rated items - set to 0
          await RestaurantModel.update(
            {
              averageRating: 0,
              ratingCount: 0,
            },
            {
              where: {
                id: restaurant.id,
              },
            },
          );
          processed++;
          continue;
        }

        // Calculate weighted average
        // Weighted average = sum(rating * count) / sum(count)
        let totalWeightedRating = 0;
        let totalRatingCount = 0;

        for (const item of dishes) {
          const rating = Number(item.averageRating);
          const count = item.ratingCount;
          if (rating > 0 && count > 0) {
            totalWeightedRating += rating * count;
            totalRatingCount += count;
          }
        }

        let restaurantAverageRating = 0;
        if (totalRatingCount > 0) {
          restaurantAverageRating = totalWeightedRating / totalRatingCount;
        }

        // Round to 8 decimal places for storage (DECIMAL(9, 8))
        const roundedRating = Number(restaurantAverageRating.toFixed(8));

        console.log('rating', JSON.stringify({
          restaurantId: restaurant.id,
          averageRating: roundedRating,
          ratingCount: totalRatingCount,
        }, null, 2));

        // Update restaurant
        await RestaurantModel.update(
          {
            averageRating: roundedRating,
            ratingCount: totalRatingCount,
          },
          {
            where: {
              id: restaurant.id,
            },
          },
        );

        processed++;
      } catch (error) {
        console.error(`[Restaurant Rating Job] Error processing restaurant ${restaurant.id}:`, error);
        errors++;
      }
    }

    console.log(`[Restaurant Rating Job] Completed. Processed: ${processed}, Errors: ${errors}`);

    return {
      success: errors === 0,
      processed,
      errors,
      message: `Processed ${processed} restaurants${errors > 0 ? `, ${errors} errors` : ''}`,
    };
  } catch (error) {
    console.error('[Restaurant Rating Job] Fatal error:', error);
    return {
      success: false,
      processed: 0,
      errors: 1,
      message: `Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

