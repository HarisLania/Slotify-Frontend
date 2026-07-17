import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

/**
 * Restricts dashboard routes to the `owner` role. The API only exposes
 * business/services/staff/bookings management to owners — staff and customer
 * accounts have no dashboard endpoints, so they're sent back to login instead
 * of into a shell with nothing to show.
 */
export const ownerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.parseUrl('/login');
  }
  return auth.isOwner() ? true : router.parseUrl('/login');
};
