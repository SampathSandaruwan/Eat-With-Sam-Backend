export interface Restaurant {
  id: number;
  name: string;
  description?: string | null;
  cuisineType?: string | null;
  address: string;
  city?: string | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phoneNumber?: string | null;
  email?: string | null;
  imageUri?: string | null;
  deliveryTime?: number | null;
  minimumOrder: number;
  deliveryFee: number;
  taxRate: number;
  isActive: boolean;
  openingTime?: string | null;
  closingTime?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
