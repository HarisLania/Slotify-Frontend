import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { AuthService } from './auth.service';
import { tokenStorage } from './token-storage';

// Module-level so concurrent 401s share one in-flight refresh instead of each racing the endpoint.
let refreshInFlight: Promise<string> | null = null;

/** Attaches the JWT access token to API requests and retries once through a token refresh on 401. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(ConfigService);
  const auth = inject(AuthService);
  const router = inject(Router);

  // ConfigService's own fetch of config.json passes through this interceptor before
  // config is loaded — apiBaseUrl isn't readable yet, so treat that request as non-API.
  const loadedConfig = config.config();
  const isApiRequest = !!loadedConfig && req.url.startsWith(loadedConfig.apiBaseUrl);
  const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register') || req.url.includes('/auth/refresh');

  const accessToken = tokenStorage.getAccessToken();
  const authedReq = isApiRequest && accessToken && !isAuthEndpoint
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;

  return next(authedReq).pipe(
    catchError((error: unknown) => {
      const shouldRefresh =
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        isApiRequest &&
        !isAuthEndpoint &&
        !!tokenStorage.getRefreshToken();

      if (!shouldRefresh) {
        return throwError(() => error);
      }

      refreshInFlight ??= auth.refreshAccessToken().finally(() => {
        refreshInFlight = null;
      });

      return from(refreshInFlight).pipe(
        switchMap((newAccessToken) =>
          next(req.clone({ setHeaders: { Authorization: `Bearer ${newAccessToken}` } })),
        ),
        catchError((refreshError) => {
          auth.logout();
          router.navigate(['/login']);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
