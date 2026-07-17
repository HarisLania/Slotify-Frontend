import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ConfigService } from '../core/config/config.service';
import { PublicBookingService } from './public-booking.service';

describe('PublicBookingService', () => {
  let service: PublicBookingService;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://api.example.com/api';
  const slug = 'demo-salon';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { apiBaseUrl } },
      ],
    });
    service = TestBed.inject(PublicBookingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('listServices() hits the slug-scoped endpoint', async () => {
    const promise = service.listServices(slug);
    const req = httpMock.expectOne(`${apiBaseUrl}/public/${slug}/services/`);
    req.flush([{ id: 1, name: 'Haircut', description: '', duration_minutes: 30, price: '25.00' }]);
    expect((await promise)[0].name).toBe('Haircut');
  });

  it('listSlots() extracts the slots array from the response envelope', async () => {
    const promise = service.listSlots(slug, 1, 1, '2026-07-20');
    const req = httpMock.expectOne(
      (r) =>
        r.url === `${apiBaseUrl}/public/${slug}/slots/` &&
        r.params.get('staff') === '1' &&
        r.params.get('service') === '1' &&
        r.params.get('date') === '2026-07-20',
    );
    req.flush({ date: '2026-07-20', staff: 1, service: 1, slots: ['2026-07-20T09:00:00Z'] });
    expect(await promise).toEqual(['2026-07-20T09:00:00Z']);
  });

  it('listSlotsForAnyStaff() merges every staff\'s slots and keeps the first staff per start time', async () => {
    const staff = [
      { id: 1, name: 'Sarah' },
      { id: 2, name: 'Marco' },
    ];
    const promise = service.listSlotsForAnyStaff(slug, staff, 1, '2026-07-20');

    const req1 = httpMock.expectOne((r) => r.params.get('staff') === '1');
    req1.flush({ date: '2026-07-20', staff: 1, service: 1, slots: ['2026-07-20T09:00:00Z', '2026-07-20T10:00:00Z'] });
    const req2 = httpMock.expectOne((r) => r.params.get('staff') === '2');
    req2.flush({ date: '2026-07-20', staff: 2, service: 1, slots: ['2026-07-20T09:00:00Z', '2026-07-20T11:00:00Z'] });

    const result = await promise;
    expect(result).toEqual([
      { startTime: '2026-07-20T09:00:00Z', staffId: 1 },
      { startTime: '2026-07-20T10:00:00Z', staffId: 1 },
      { startTime: '2026-07-20T11:00:00Z', staffId: 2 },
    ]);
  });

  it('createBooking() posts to the slug-scoped bookings endpoint', async () => {
    const input = {
      service: 1,
      staff: 1,
      start_time: '2026-07-20T09:00:00Z',
      customer_name: 'Jane',
      customer_email: 'jane@example.com',
      customer_phone: '',
      notes: '',
    };
    const promise = service.createBooking(slug, input);
    const req = httpMock.expectOne(`${apiBaseUrl}/public/${slug}/bookings/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(input);
    req.flush({ id: 1, business: 1, service_name: 'Haircut', staff_name: 'sarah', status: 'pending', ...input });
    expect((await promise).id).toBe(1);
  });
});
