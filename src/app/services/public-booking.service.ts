import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ConfigService } from '../core/config/config.service';
import { Booking, PublicBookingInput } from '../core/models/booking.model';
import { PublicService, PublicStaff } from '../core/models/public.model';
import { SlotsResponse } from '../core/models/slot.model';

/** A slot resolved to the staff it belongs to — needed once "Any available" merges multiple staff's slots. */
export interface ResolvedSlot {
  startTime: string;
  staffId: number;
}

@Injectable({ providedIn: 'root' })
export class PublicBookingService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  private base(slug: string): string {
    return `${this.config.apiBaseUrl}/public/${slug}`;
  }

  listServices(slug: string): Promise<PublicService[]> {
    return firstValueFrom(this.http.get<PublicService[]>(`${this.base(slug)}/services/`));
  }

  listStaff(slug: string, serviceId: number): Promise<PublicStaff[]> {
    const params = new HttpParams().set('service', serviceId);
    return firstValueFrom(
      this.http.get<PublicStaff[]>(`${this.base(slug)}/staff/`, { params }),
    );
  }

  async listSlots(slug: string, staffId: number, serviceId: number, date: string): Promise<string[]> {
    const params = new HttpParams().set('staff', staffId).set('service', serviceId).set('date', date);
    const response = await firstValueFrom(
      this.http.get<SlotsResponse>(`${this.base(slug)}/slots/`, { params }),
    );
    return response.slots;
  }

  /** "Any available" — queries every eligible staff's slots for the date and keeps the earliest per start time. */
  async listSlotsForAnyStaff(
    slug: string,
    staff: PublicStaff[],
    serviceId: number,
    date: string,
  ): Promise<ResolvedSlot[]> {
    const results = await Promise.all(
      staff.map(async (member) => {
        const slots = await this.listSlots(slug, member.id, serviceId, date);
        return slots.map((startTime) => ({ startTime, staffId: member.id }));
      }),
    );
    const merged = results.flat();
    const byStartTime = new Map<string, ResolvedSlot>();
    for (const slot of merged) {
      if (!byStartTime.has(slot.startTime)) {
        byStartTime.set(slot.startTime, slot);
      }
    }
    return [...byStartTime.values()].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  createBooking(slug: string, input: PublicBookingInput): Promise<Booking> {
    return firstValueFrom(this.http.post<Booking>(`${this.base(slug)}/bookings/`, input));
  }
}
