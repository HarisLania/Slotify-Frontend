import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { ConfigService } from '../config/config.service';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';
import { tokenStorage } from './token-storage';

const API_BASE = 'http://api.example.com/api';

// firstValueFrom()/from(promise) resolve through a macrotask relative to flush(),
// so the retried request needs a real tick before it exists to expect on.
function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let refreshAccessToken: jasmine.Spy;
  let logout: jasmine.Spy;

  beforeEach(() => {
    tokenStorage.clear();
    refreshAccessToken = jasmine.createSpy('refreshAccessToken');
    logout = jasmine.createSpy('logout');

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { config: () => ({ apiBaseUrl: API_BASE }) } },
        { provide: AuthService, useValue: { refreshAccessToken, logout } },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    tokenStorage.clear();
  });

  it('attaches the bearer token to API requests when one is stored', () => {
    tokenStorage.setTokens('my-access-token', 'my-refresh-token');
    http.get(`${API_BASE}/services/`).subscribe();

    const req = httpMock.expectOne(`${API_BASE}/services/`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-access-token');
    req.flush([]);
  });

  it('does not attach a header to non-API requests', () => {
    tokenStorage.setTokens('my-access-token', 'my-refresh-token');
    http.get('/config.json').subscribe();

    const req = httpMock.expectOne('/config.json');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('does not attach a header to auth endpoints', () => {
    tokenStorage.setTokens('my-access-token', 'my-refresh-token');
    http.post(`${API_BASE}/auth/login/`, {}).subscribe();

    const req = httpMock.expectOne(`${API_BASE}/auth/login/`);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('refreshes the token and retries once on a 401, then succeeds', async () => {
    tokenStorage.setTokens('expired-access', 'my-refresh-token');
    refreshAccessToken.and.returnValue(Promise.resolve('new-access-token'));

    const resultPromise = new Promise((resolve) => {
      http.get(`${API_BASE}/bookings/`).subscribe({ next: resolve });
    });

    const firstReq = httpMock.expectOne(`${API_BASE}/bookings/`);
    expect(firstReq.request.headers.get('Authorization')).toBe('Bearer expired-access');
    firstReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    await flushMicrotasks();

    const retryReq = httpMock.expectOne(`${API_BASE}/bookings/`);
    expect(retryReq.request.headers.get('Authorization')).toBe('Bearer new-access-token');
    retryReq.flush([{ id: 1 }]);

    expect(await resultPromise).toEqual([{ id: 1 }]);
    expect(refreshAccessToken).toHaveBeenCalled();
  });

  it('logs out and redirects to /login when the refresh itself fails', async () => {
    tokenStorage.setTokens('expired-access', 'my-refresh-token');
    refreshAccessToken.and.returnValue(Promise.reject(new Error('refresh failed')));
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');

    let caught: unknown;
    const donePromise = new Promise<void>((resolve) => {
      http.get(`${API_BASE}/bookings/`).subscribe({
        error: (err) => {
          caught = err;
          resolve();
        },
      });
    });

    const firstReq = httpMock.expectOne(`${API_BASE}/bookings/`);
    firstReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    await donePromise;
    expect(caught).toBeTruthy();
    expect(logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
