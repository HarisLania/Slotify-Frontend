import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { EmptyStateComponent } from '../../../components/empty-state/empty-state';
import { SpinnerComponent } from '../../../components/spinner/spinner';
import { PublicBookingService, ResolvedSlot } from '../../../services/public-booking.service';
import { formatTime, monthMatrix, toIsoDate } from '../../../utils/date-time.util';
import { ANY_STAFF, BookingWizardStore } from '../booking-shell/booking-wizard.store';

@Component({
  selector: 'app-select-slot-page',
  imports: [DatePipe, SpinnerComponent, EmptyStateComponent],
  templateUrl: './select-slot-page.html',
})
export class SelectSlotPage {
  private readonly router = inject(Router);
  private readonly publicBookingService = inject(PublicBookingService);
  protected readonly store = inject(BookingWizardStore);

  protected readonly loading = signal(false);
  protected readonly slots = signal<ResolvedSlot[]>([]);

  private readonly today = new Date();
  protected readonly calendarYear = signal(this.today.getFullYear());
  protected readonly calendarMonth = signal(this.today.getMonth());
  protected readonly selectedDate = signal<Date>(this.today);

  protected readonly calendarCells = computed(() => monthMatrix(this.calendarYear(), this.calendarMonth()));
  protected readonly formatTime = formatTime;
  protected readonly toIsoDate = toIsoDate;

  constructor() {
    const selection = this.store.selection();
    if (!selection.selectedServiceId || selection.selectedStaffId == null) {
      this.router.navigate(['/book', selection.slug, 'staff']);
      return;
    }
    this.loadSlots(this.today);
  }

  protected isPast(date: Date): boolean {
    const startOfToday = new Date(this.today);
    startOfToday.setHours(0, 0, 0, 0);
    return date < startOfToday;
  }

  protected selectDate(date: Date): void {
    if (this.isPast(date)) return;
    this.selectedDate.set(date);
    this.loadSlots(date);
  }

  protected changeMonth(delta: number): void {
    const next = new Date(this.calendarYear(), this.calendarMonth() + delta, 1);
    this.calendarYear.set(next.getFullYear());
    this.calendarMonth.set(next.getMonth());
  }

  private async loadSlots(date: Date): Promise<void> {
    const selection = this.store.selection();
    const slug = selection.slug;
    const serviceId = selection.selectedServiceId!;
    const dateStr = toIsoDate(date);
    this.store.selectDate(dateStr);

    this.loading.set(true);
    try {
      if (selection.selectedStaffId === ANY_STAFF) {
        this.slots.set(
          await this.publicBookingService.listSlotsForAnyStaff(slug, selection.staff, serviceId, dateStr),
        );
      } else {
        const staffId = selection.selectedStaffId as number;
        const slots = await this.publicBookingService.listSlots(slug, staffId, serviceId, dateStr);
        this.slots.set(slots.map((startTime) => ({ startTime, staffId })));
      }
    } finally {
      this.loading.set(false);
    }
  }

  protected choose(slot: ResolvedSlot): void {
    this.store.selectSlot(slot);
    this.router.navigate(['/book', this.store.selection().slug, 'details']);
  }
}
