import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ConfigService } from '../core/config/config.service';
import { BookingsService } from './bookings.service';

describe('BookingsService', () => {
  let service: BookingsService;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://api.example.com/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { apiBaseUrl } },
      ],
    });
    service = TestBed.inject(BookingsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list() sends only the filters that were provided as query params', async () => {
    const promise = service.list({ status: 'confirmed', date_from: '2026-07-01' });
    const req = httpMock.expectOne(
      (r) => r.url === `${apiBaseUrl}/bookings/` && r.params.get('status') === 'confirmed',
    );
    expect(req.request.params.get('date_from')).toBe('2026-07-01');
    expect(req.request.params.has('staff')).toBeFalse();
    req.flush([]);
    await promise;
  });

  it('updateStatus() returns only {id, status}, not a full booking', async () => {
    const promise = service.updateStatus(5, 'cancelled');
    const req = httpMock.expectOne(`${apiBaseUrl}/bookings/5/status/`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'cancelled' });
    req.flush({ id: 5, status: 'cancelled' });
    expect(await promise).toEqual({ id: 5, status: 'cancelled' });
  });
});
