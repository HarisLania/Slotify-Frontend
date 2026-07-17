import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ConfigService } from '../core/config/config.service';
import { StaffService } from './staff.service';

describe('StaffService', () => {
  let service: StaffService;
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
    service = TestBed.inject(StaffService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('create() posts the username/credentials payload to /staff/', async () => {
    const input = {
      username: 'sarah_stylist',
      first_name: 'Sarah',
      last_name: 'Chen',
      email: 'sarah@example.com',
      password: 'password123',
      services: [1],
    };
    const promise = service.create(input);
    const req = httpMock.expectOne(`${apiBaseUrl}/staff/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(input);
    req.flush({ id: 1, user: { id: 3, ...input }, services: [1], is_active: true });
    expect((await promise).id).toBe(1);
  });

  it('update() sends only services/is_active, never credentials', async () => {
    const promise = service.update(1, { services: [1, 2], is_active: false });
    const req = httpMock.expectOne(`${apiBaseUrl}/staff/1/`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ services: [1, 2], is_active: false });
    req.flush({ id: 1, user: {}, services: [1, 2], is_active: false });
    await promise;
  });

  it('listWorkingHours() and setWorkingHours() hit the nested collection', async () => {
    const listPromise = service.listWorkingHours(1);
    httpMock.expectOne(`${apiBaseUrl}/staff/1/working-hours/`).flush([]);
    expect(await listPromise).toEqual([]);

    const input = { day_of_week: 0 as const, start_time: '09:00:00', end_time: '17:00:00' };
    const setPromise = service.setWorkingHours(1, input);
    const req = httpMock.expectOne(`${apiBaseUrl}/staff/1/working-hours/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(input);
    req.flush({ id: 1, staff: 1, ...input });
    await setPromise;
  });

  it('listTimeOff() and addTimeOff() hit the nested collection', async () => {
    const listPromise = service.listTimeOff(1);
    httpMock.expectOne(`${apiBaseUrl}/staff/1/time-off/`).flush([]);
    expect(await listPromise).toEqual([]);

    const input = { start_datetime: '2026-08-01T09:00:00Z', end_datetime: '2026-08-01T12:00:00Z', reason: 'Dentist' };
    const addPromise = service.addTimeOff(1, input);
    const req = httpMock.expectOne(`${apiBaseUrl}/staff/1/time-off/`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 1, staff: 1, ...input });
    await addPromise;
  });
});
