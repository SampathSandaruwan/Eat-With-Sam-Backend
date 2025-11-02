import { Request, Response } from 'express';

import { calculateRestaurantRatings } from '../jobs';

/**
 * Manually trigger restaurant rating calculation job
 * Useful for testing or immediate updates
 */
export const triggerRatingCalculation = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await calculateRestaurantRatings();

    res.json({
      success: result.success,
      message: result.message || 'Restaurant rating calculation completed',
      data: {
        processed: result.processed,
        errors: result.errors,
      },
    });
  } catch (error) {
    console.error('Error triggering rating calculation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger restaurant rating calculation',
    });
  }
};

