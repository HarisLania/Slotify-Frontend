import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ConfigService } from '../core/config/config.service';
import { ServicesService } from './services.service';

describe('ServicesService', () => {
  let service: ServicesService;
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
    service = TestBed.inject(ServicesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list() unwraps a bare array response', async () => {
    const promise = service.list();
    const req = httpMock.expectOne(`${apiBaseUrl}/services/`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, name: 'Haircut' }]);
    expect(await promise).toEqual([{ id: 1, name: 'Haircut' } as never]);
  });

  it('list() unwraps a paginated response', async () => {
    const promise = service.list();
    const req = httpMock.expectOne(`${apiBaseUrl}/services/`);
    req.flush({ count: 1, next: null, previous: null, results: [{ id: 1, name: 'Haircut' }] });
    expect(await promise).toEqual([{ id: 1, name: 'Haircut' } as never]);
  });

  it('create() posts to the collection endpoint', async () => {
    const input = {
      name: 'Massage',
      description: '',
      duration_minutes: 60,
      buffer_minutes: 0,
      price: '80.00',
      is_active: true,
    };
    const promise = service.create(input);
    const req = httpMock.expectOne(`${apiBaseUrl}/services/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(input);
    req.flush({ id: 2, ...input });
    expect((await promise).id).toBe(2);
  });

  it('update() patches the item endpoint', async () => {
    const promise = service.update(2, { price: '90.00' });
    const req = httpMock.expectOne(`${apiBaseUrl}/services/2/`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ id: 2, price: '90.00' });
    await promise;
  });

  it('delete() issues a DELETE to the item endpoint', async () => {
    const promise = service.delete(2);
    const req = httpMock.expectOne(`${apiBaseUrl}/services/2/`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    await promise;
  });
});
