import { AuthUser } from './user.model';

export interface LoginInput {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

/** Payload for POST /api/auth/register/ — creates the owner User + their Business together. */
export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  phone?: string;
  business_name: string;
  timezone?: string;
}

export interface RegisterResponse {
  user: AuthUser;
  business: { id: number; name: string; slug: string };
}

export interface RefreshResponse {
  access: string;
}
