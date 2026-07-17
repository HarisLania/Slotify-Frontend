import { StaffUser } from './user.model';

export interface StaffMember {
  id: number;
  user: StaffUser;
  services: number[];
  is_active: boolean;
}

/** Payload for POST /api/staff/ — creates the linked User account and the StaffMember in one call. */
export interface StaffCreateInput {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  services: number[];
}

export interface StaffUpdateInput {
  services?: number[];
  is_active?: boolean;
}
