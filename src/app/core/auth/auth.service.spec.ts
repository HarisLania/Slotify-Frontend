import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ConfigService } from '../config/config.service';
import { AuthService } from './auth.service';
import { tokenStorage } from './token-storage';

// firstValueFrom() resolves through a macrotask relative to flush(), so chained
// HTTP calls (e.g. login -> me/) need a real tick before the next request exists.
function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://api.example.com/api';

  beforeEach(() => {
    tokenStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    spyOnProperty(TestBed.inject(ConfigService), 'apiBaseUrl', 'get').and.returnValue(apiBaseUrl);
  });

  afterEach(() => {
    httpMock.verify();
    tokenStorage.clear();
  });

  it('login stores tokens and loads the current user', async () => {
    const loginPromise = service.login({ username: 'alex', password: 'secret123' });

    const loginReq = httpMock.expectOne(`${apiBaseUrl}/auth/login/`);
    expect(loginReq.request.body).toEqual({ username: 'alex', password: 'secret123' });
    loginReq.flush({ access: 'access-token', refresh: 'refresh-token' });
    await flushMicrotasks();

    const meReq = httpMock.expectOne(`${apiBaseUrl}/auth/me/`);
    meReq.flush({ id: 1, username: 'alex', email: 'alex@example.com', role: 'owner', phone: '' });

    await loginPromise;

    expect(tokenStorage.getAccessToken()).toBe('access-token');
    expect(tokenStorage.getRefreshToken()).toBe('refresh-token');
    expect(service.currentUser()?.username).toBe('alex');
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.isOwner()).toBeTrue();
  });

  it('register creates the account then logs in with the same credentials', async () => {
    const registerPromise = service.register({
      username: 'alex',
      email: 'alex@example.com',
      password: 'secret123',
      business_name: 'Bloom Salon',
    });

    const registerReq = httpMock.expectOne(`${apiBaseUrl}/auth/register/`);
    registerReq.flush({
      user: { id: 1, username: 'alex', email: 'alex@example.com', role: 'owner', phone: '' },
      business: { id: 1, name: 'Bloom Salon', slug: 'bloom-salon' },
    });
    await flushMicrotasks();

    const loginReq = httpMock.expectOne(`${apiBaseUrl}/auth/login/`);
    expect(loginReq.request.body).toEqual({ username: 'alex', password: 'secret123' });
    loginReq.flush({ access: 'access-token', refresh: 'refresh-token' });
    await flushMicrotasks();

    const meReq = httpMock.expectOne(`${apiBaseUrl}/auth/me/`);
    meReq.flush({ id: 1, username: 'alex', email: 'alex@example.com', role: 'owner', phone: '' });

    await registerPromise;
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('logout clears tokens and the current user', async () => {
    tokenStorage.setTokens('a', 'r');
    await service.logout();
    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(service.currentUser()).toBeNull();
  });

  it('init restores the session when a token is already stored', async () => {
    tokenStorage.setTokens('existing-access', 'existing-refresh');
    const initPromise = service.init();

    const meReq = httpMock.expectOne(`${apiBaseUrl}/auth/me/`);
    meReq.flush({ id: 2, username: 'sam', email: 'sam@example.com', role: 'owner', phone: '' });

    await initPromise;
    expect(service.initialized()).toBeTrue();
    expect(service.currentUser()?.username).toBe('sam');
  });

  it('init clears stale tokens if restoring the session fails', async () => {
    tokenStorage.setTokens('bad-access', 'bad-refresh');
    const initPromise = service.init();

    const meReq = httpMock.expectOne(`${apiBaseUrl}/auth/me/`);
    meReq.flush('unauthorized', { status: 401, statusText: 'Unauthorized' });

    await initPromise;
    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(service.initialized()).toBeTrue();
  });

  it('refreshAccessToken exchanges the refresh token for a new access token', async () => {
    tokenStorage.setTokens('old-access', 'refresh-token');
    const refreshPromise = service.refreshAccessToken();

    const req = httpMock.expectOne(`${apiBaseUrl}/auth/refresh/`);
    expect(req.request.body).toEqual({ refresh: 'refresh-token' });
    req.flush({ access: 'new-access' });

    const newAccess = await refreshPromise;
    expect(newAccess).toBe('new-access');
    expect(tokenStorage.getAccessToken()).toBe('new-access');
  });

  it('refreshAccessToken throws when there is no refresh token', async () => {
    await expectAsync(service.refreshAccessToken()).toBeRejected();
  });
});
