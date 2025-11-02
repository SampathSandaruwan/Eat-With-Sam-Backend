/* eslint-disable no-console */
import cron from 'node-cron';

import { calculateRestaurantRatings } from '../jobs';

export const startCrons = () => {
  // Setup cron job to calculate restaurant ratings every 4 hours
  // Cron expression: '0 */4 * * *' means "at minute 0 of every 4th hour"
  cron.schedule('0 */4 * * *', async () => {
    console.log('[Cron] Starting scheduled restaurant rating calculation...');
    try {
      const result = await calculateRestaurantRatings();
      console.log(`[Cron] Restaurant rating calculation completed: ${result.message}`);
    } catch (error) {
      console.error('[Cron] Error in scheduled restaurant rating calculation:', error);
    }
  });
  console.log('[Cron] Restaurant rating calculation scheduled to run every 4 hours');

};
