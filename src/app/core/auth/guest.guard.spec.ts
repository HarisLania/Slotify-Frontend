import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthService } from './auth.service';
import { guestGuard } from './guest.guard';

describe('guestGuard', () => {
  let authenticated = false;

  beforeEach(() => {
    authenticated = false;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { isAuthenticated: () => authenticated } },
      ],
    });
  });

  it('allows navigation for a guest', () => {
    const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));
    expect(result).toBeTrue();
  });

  it('redirects an already-authenticated owner to /dashboard', () => {
    authenticated = true;
    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));
    expect(result?.toString()).toBe(router.parseUrl('/dashboard').toString());
  });
});
