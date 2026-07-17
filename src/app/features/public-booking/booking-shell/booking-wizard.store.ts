import { Injectable, signal } from '@angular/core';

import { Booking } from '../../../core/models/booking.model';
import { PublicService, PublicStaff } from '../../../core/models/public.model';
import { ResolvedSlot } from '../../../services/public-booking.service';

export const ANY_STAFF = 'any' as const;

export interface WizardSelection {
  slug: string;
  services: PublicService[];
  selectedServiceId: number | null;
  staff: PublicStaff[];
  selectedStaffId: number | typeof ANY_STAFF | null;
  selectedDate: string | null;
  selectedSlot: ResolvedSlot | null;
  createdBooking: Booking | null;
}

const EMPTY: WizardSelection = {
  slug: '',
  services: [],
  selectedServiceId: null,
  staff: [],
  selectedStaffId: null,
  selectedDate: null,
  selectedSlot: null,
  createdBooking: null,
};

function storageKey(slug: string): string {
  return `slotify.bookingWizard.${slug}`;
}

/**
 * Holds the public booking wizard's in-progress selections and mirrors them to
 * sessionStorage per business slug. Combined with the wizard being built as real
 * child routes (not one component swapping internal state), this is what lets
 * both the in-page back arrow and the browser's native back button move between
 * steps without losing what the customer already picked.
 */
@Injectable({ providedIn: 'root' })
export class BookingWizardStore {
  private readonly state = signal<WizardSelection>(EMPTY);
  readonly selection = this.state.asReadonly();

  initFor(slug: string): void {
    if (this.state().slug === slug) {
      return;
    }
    const stored = sessionStorage.getItem(storageKey(slug));
    this.state.set(stored ? { ...EMPTY, ...JSON.parse(stored), slug } : { ...EMPTY, slug });
  }

  private persist(): void {
    sessionStorage.setItem(storageKey(this.state().slug), JSON.stringify(this.state()));
  }

  setServices(services: PublicService[]): void {
    this.state.update((s) => ({ ...s, services }));
    this.persist();
  }

  selectService(serviceId: number): void {
    this.state.update((s) => ({
      ...s,
      selectedServiceId: serviceId,
      selectedStaffId: null,
      selectedDate: null,
      selectedSlot: null,
    }));
    this.persist();
  }

  setStaffOptions(staff: PublicStaff[]): void {
    this.state.update((s) => ({ ...s, staff }));
    this.persist();
  }

  selectStaff(staffId: number | typeof ANY_STAFF): void {
    this.state.update((s) => ({ ...s, selectedStaffId: staffId, selectedDate: null, selectedSlot: null }));
    this.persist();
  }

  selectDate(date: string): void {
    this.state.update((s) => ({ ...s, selectedDate: date, selectedSlot: null }));
    this.persist();
  }

  selectSlot(slot: ResolvedSlot): void {
    this.state.update((s) => ({ ...s, selectedSlot: slot }));
    this.persist();
  }

  setCreatedBooking(booking: Booking): void {
    this.state.update((s) => ({ ...s, createdBooking: booking }));
    this.persist();
  }

  get selectedService(): PublicService | null {
    const s = this.state();
    return s.services.find((svc) => svc.id === s.selectedServiceId) ?? null;
  }

  get resolvedStaff(): PublicStaff | null {
    const s = this.state();
    if (s.selectedStaffId === ANY_STAFF || s.selectedStaffId === null) {
      return s.staff.find((member) => member.id === s.selectedSlot?.staffId) ?? null;
    }
    return s.staff.find((member) => member.id === s.selectedStaffId) ?? null;
  }
}
