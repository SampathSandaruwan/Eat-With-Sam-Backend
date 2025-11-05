import { Op } from 'sequelize';

import { OrderModel } from '../models';

/**
 * Generates a unique order number in the format: ORD-YYYY-NNNNNN
 * where YYYY is the current year and NNNNNN is a 6-digit sequential number
 */
export const generateOrderNumber = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const prefix = `ORD-${currentYear}-`;

  // Find the highest order number for the current year
  const lastOrder = await OrderModel.findOne({
    where: {
      orderNumber: {
        [Op.like]: `${prefix}%`,
      },
    },
    order: [['orderNumber', 'DESC']],
    attributes: ['orderNumber'],
  });

  let sequenceNumber = 1;

  if (lastOrder) {
    // Extract the sequence number from the last order number
    const lastNumber = lastOrder.orderNumber.replace(prefix, '');
    const lastSequence = parseInt(lastNumber, 10);
    if (!isNaN(lastSequence)) {
      sequenceNumber = lastSequence + 1;
    }
  }

  // Format sequence number as 6-digit string with leading zeros
  const formattedSequence = sequenceNumber.toString().padStart(6, '0');

  return `${prefix}${formattedSequence}`;
};

