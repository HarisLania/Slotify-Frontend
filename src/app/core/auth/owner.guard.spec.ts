import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthService } from './auth.service';
import { ownerGuard } from './owner.guard';

describe('ownerGuard', () => {
  let authenticated = false;
  let owner = false;

  beforeEach(() => {
    authenticated = false;
    owner = false;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: { isAuthenticated: () => authenticated, isOwner: () => owner },
        },
      ],
    });
  });

  it('redirects to /login when not authenticated at all', () => {
    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() => ownerGuard({} as never, {} as never));
    expect(result?.toString()).toBe(router.parseUrl('/login').toString());
  });

  it('redirects to /login when authenticated but not an owner', () => {
    authenticated = true;
    owner = false;
    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() => ownerGuard({} as never, {} as never));
    expect(result?.toString()).toBe(router.parseUrl('/login').toString());
  });

  it('allows navigation for an authenticated owner', () => {
    authenticated = true;
    owner = true;
    const result = TestBed.runInInjectionContext(() => ownerGuard({} as never, {} as never));
    expect(result).toBeTrue();
  });
});
