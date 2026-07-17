import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { authInterceptor } from './core/auth/auth.interceptor';
import { ConfigService } from './core/config/config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAppInitializer(async () => {
      // inject() only works synchronously, before the first await — resolve both
      // services up front, then use them across the two awaited calls.
      const configService = inject(ConfigService);
      const authService = inject(AuthService);
      // Config must load before anything else — every other service reads apiBaseUrl from it.
      await configService.load();
      await authService.init();
    }),
  ],
};
