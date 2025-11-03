export interface User {
  id: number;
  email: string;
  passwordHash?: string | null;
  googleId?: string | null;
  name: string;
  phoneNumber?: string | null;
  address?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterUserRequestBody {
  email: string;
  password?: string | null;
  googleId?: string | null;
  name: string;
  phoneNumber?: string | null;
  address?: string | null;
}

export interface UserResponse {
  id: number;
  email: string;
  googleId?: string | null;
  name: string;
  phoneNumber?: string | null;
  address?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
