import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ConfigService } from '../core/config/config.service';
import { Booking, BookingFilters, BookingStatus, BookingStatusResult } from '../core/models/booking.model';
import { Paginated, unwrapList } from '../core/models/pagination.model';

@Injectable({ providedIn: 'root' })
export class BookingsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  private get url(): string {
    return `${this.config.apiBaseUrl}/bookings/`;
  }

  async list(filters: BookingFilters = {}): Promise<Booking[]> {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.staff) params = params.set('staff', filters.staff);
    if (filters.date_from) params = params.set('date_from', filters.date_from);
    if (filters.date_to) params = params.set('date_to', filters.date_to);

    const response = await firstValueFrom(
      this.http.get<Paginated<Booking> | Booking[]>(this.url, { params }),
    );
    return unwrapList(response);
  }

  get(id: number): Promise<Booking> {
    return firstValueFrom(this.http.get<Booking>(`${this.url}${id}/`));
  }

  /** Returns only {id, status} — callers should merge this into their local copy of the booking. */
  updateStatus(id: number, status: BookingStatus): Promise<BookingStatusResult> {
    return firstValueFrom(
      this.http.patch<BookingStatusResult>(`${this.url}${id}/status/`, { status }),
    );
  }
}
