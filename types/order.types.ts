export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  restaurantId: number;
  status: OrderStatus;
  totalAmount: number;
  subtotal: number;
  deliveryFee: number;
  serviceCharge: number;
  taxAmount: number;
  deliveryAddress: string;
  deliveryInstructions?: string | null;
  estimatedDeliveryTime?: Date | null;
  actualDeliveryTime?: Date | null;
  placedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: number;
  orderId: number;
  dishId: number;
  quantity: number;
  priceAtOrder: number;
  subtotal: number;
  specialInstructions?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlaceOrderRequestBody {
  restaurantId: number;
  items: Array<{
    dishId: number;
    quantity: number;
    specialInstructions?: string | null;
  }>;
  deliveryAddress: string;
  deliveryInstructions?: string | null;
}

export interface UpdateOrderStatusRequestBody {
  status: OrderStatus;
  estimatedDeliveryTime?: Date | null;
  actualDeliveryTime?: Date | null;
}

