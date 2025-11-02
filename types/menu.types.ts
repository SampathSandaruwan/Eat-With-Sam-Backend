export interface MenuCategory {
  id: number;
  name: string;
  description?: string | null;
  displayOrder: number;
  restaurantId: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  imageUri?: string | null;
  kcal?: number | null;
  tags?: string[] | null;
  discountPercent?: number | null;
  isAvailable: boolean;
  categoryId: number;
  restaurantId: number;
  averageRating: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

