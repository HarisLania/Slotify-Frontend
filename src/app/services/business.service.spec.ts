import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ConfigService } from '../core/config/config.service';
import { BusinessService } from './business.service';

describe('BusinessService', () => {
  let service: BusinessService;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://api.example.com/api';
  const business = {
    id: 1,
    owner: 1,
    name: 'Bloom Salon',
    slug: 'bloom-salon',
    timezone: 'Asia/Dubai',
    address: '',
    logo: null,
    created_at: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { apiBaseUrl } },
      ],
    });
    service = TestBed.inject(BusinessService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('fetches the business on first call', async () => {
    const promise = service.getBusiness();
    const req = httpMock.expectOne(`${apiBaseUrl}/business/`);
    req.flush(business);
    expect(await promise).toEqual(business);
  });

  it('serves subsequent calls from cache without another request', async () => {
    const first = service.getBusiness();
    httpMock.expectOne(`${apiBaseUrl}/business/`).flush(business);
    await first;

    const second = await service.getBusiness();
    httpMock.expectNone(`${apiBaseUrl}/business/`);
    expect(second).toEqual(business);
  });

  it('forceRefresh bypasses the cache', async () => {
    const first = service.getBusiness();
    httpMock.expectOne(`${apiBaseUrl}/business/`).flush(business);
    await first;

    const updated = { ...business, name: 'Renamed Salon' };
    const second = service.getBusiness(true);
    httpMock.expectOne(`${apiBaseUrl}/business/`).flush(updated);
    expect(await second).toEqual(updated);
  });

  it('updateBusiness patches and refreshes the cache', async () => {
    const promise = service.updateBusiness({ name: 'New Name' });
    const req = httpMock.expectOne(`${apiBaseUrl}/business/`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...business, name: 'New Name' });
    await promise;
    expect(service.business()?.name).toBe('New Name');
  });
});
