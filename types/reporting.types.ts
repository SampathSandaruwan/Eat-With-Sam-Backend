import { OrderStatus } from './order.types';

export type TimePeriod = 'day' | 'week' | 'month';

export type SortByPriority =
  | 'totalSales'
  | 'orderCount'
  | 'date'
  | 'totalQuantitySold'
  | 'totalRevenue'
  | 'averageOrderValue';

export interface SalesReportQuery {
  period: TimePeriod;
  startDate?: Date;
  endDate?: Date;
  status?: OrderStatus | OrderStatus[];
  page?: number;
  limit?: number;
  sortBy?: SortByPriority;
  sortOrder?: 'asc' | 'desc';
}

export interface TopSellingItemsQuery {
  sortBy: 'quantity' | 'revenue';
  startDate?: Date;
  endDate?: Date;
  status?: OrderStatus | OrderStatus[];
  restaurantId?: number;
  page?: number;
  limit?: number;
}

export interface AverageOrderValueQuery {
  period: TimePeriod;
  startDate?: Date;
  endDate?: Date;
  status?: OrderStatus | OrderStatus[];
  restaurantId?: number;
  page?: number;
  limit?: number;
  sortBy?: SortByPriority;
  sortOrder?: 'asc' | 'desc';
}

export interface SalesReportItem {
  date: string;
  year?: number;
  week?: number;
  month?: number;
  orderCount: number;
  totalSales: number;
  totalSubtotal?: number;
  totalDeliveryFees?: number;
  totalTax?: number;
  averageOrderValue?: number;
}

export interface TopSellingItem {
  id: number;
  name: string;
  restaurantId: number;
  restaurantName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  orderCount: number;
}

export interface AverageOrderValueReport {
  date?: string;
  year?: number;
  week?: number;
  month?: number;
  restaurantId?: number;
  restaurantName?: string;
  orderCount: number;
  averageOrderValue: number;
  minOrderValue?: number;
  maxOrderValue?: number;
  totalSales?: number;
}

export interface ReportingResponse<T> {
  success: boolean;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters?: {
    startDate?: string;
    endDate?: string;
    status?: string | string[];
    period?: TimePeriod;
    sortBy?: string;
    sortOrder?: string;
  };
}

