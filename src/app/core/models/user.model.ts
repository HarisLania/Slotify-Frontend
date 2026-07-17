export type UserRole = 'owner' | 'staff' | 'customer';

/** Shape returned by GET /api/auth/me/ — note there's no first/last name, only username. */
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  phone: string;
}

/** Shape nested under StaffMember.user — a different, dashboard-only representation. */
export interface StaffUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}
