import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('throws if apiBaseUrl is read before load() resolves', () => {
    expect(() => service.apiBaseUrl).toThrowError();
  });

  it('fetches config.json and exposes apiBaseUrl afterwards', async () => {
    const loadPromise = service.load();
    const req = httpMock.expectOne(environment.configUrl);
    expect(req.request.method).toBe('GET');
    req.flush({ apiBaseUrl: 'http://api.example.com/api' });
    await loadPromise;

    expect(service.apiBaseUrl).toBe('http://api.example.com/api');
    expect(service.config()).toEqual({ apiBaseUrl: 'http://api.example.com/api' });
  });
});
