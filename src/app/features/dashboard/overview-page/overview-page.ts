import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AvatarComponent } from '../../../components/avatar/avatar';
import { SpinnerComponent } from '../../../components/spinner/spinner';
import { StatusBadgeComponent } from '../../../components/status-badge/status-badge';
import { AuthService } from '../../../core/auth/auth.service';
import { Booking } from '../../../core/models/booking.model';
import { Service } from '../../../core/models/service.model';
import { StaffMember } from '../../../core/models/staff.model';
import { BusinessService } from '../../../services/business.service';
import { BookingsService } from '../../../services/bookings.service';
import { ServicesService } from '../../../services/services.service';
import { StaffScheduleService } from '../../../services/staff-schedule.service';
import { StaffService } from '../../../services/staff.service';
import { addDays, formatMoney, formatTime, isSameDay, monthMatrix, startOfWeek, toIsoDate } from '../../../utils/date-time.util';

@Component({
  selector: 'app-overview-page',
  imports: [RouterLink, DatePipe, AvatarComponent, StatusBadgeComponent, SpinnerComponent],
  templateUrl: './overview-page.html',
})
export class OverviewPage {
  private readonly bookingsService = inject(BookingsService);
  private readonly staffService = inject(StaffService);
  private readonly servicesService = inject(ServicesService);
  private readonly staffSchedule = inject(StaffScheduleService);
  protected readonly businessService = inject(BusinessService);
  protected readonly auth = inject(AuthService);

  protected readonly loading = signal(true);
  protected readonly today = new Date();

  private readonly monthBookings = signal<Booking[]>([]);
  private readonly staff = signal<StaffMember[]>([]);
  protected readonly servicesById = signal<Map<number, Service>>(new Map());

  protected readonly calendarYear = signal(this.today.getFullYear());
  protected readonly calendarMonth = signal(this.today.getMonth());
  protected readonly selectedDate = signal(this.today);
  protected readonly staffOnDuty = signal<Map<number, boolean>>(new Map());

  protected readonly calendarCells = computed(() =>
    monthMatrix(this.calendarYear(), this.calendarMonth()),
  );

  protected readonly todaysAppointments = computed(() =>
    this.monthBookings()
      .filter((b) => isSameDay(new Date(b.start_time), this.today))
      .sort((a, b) => a.start_time.localeCompare(b.start_time)),
  );

  protected readonly weekCount = computed(() => {
    const weekStart = startOfWeek(this.today);
    const weekEnd = addDays(weekStart, 7);
    return this.monthBookings().filter((b) => {
      const start = new Date(b.start_time);
      return start >= weekStart && start < weekEnd;
    }).length;
  });

  protected readonly cancellationCount = computed(
    () => this.monthBookings().filter((b) => b.status === 'cancelled').length,
  );

  protected readonly revenueMtd = computed(() =>
    this.monthBookings()
      .filter((b) => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + parseFloat(this.servicesById().get(b.service)?.price ?? '0'), 0),
  );

  protected readonly bookingDatesWithActivity = computed(
    () => new Set(this.monthBookings().map((b) => toIsoDate(new Date(b.start_time)))),
  );

  protected readonly formatTime = formatTime;
  protected readonly formatMoney = formatMoney;
  protected readonly isSameDay = isSameDay;

  constructor() {
    this.loadMonth();
    this.businessService.getBusiness();
  }

  private async loadMonth(): Promise<void> {
    this.loading.set(true);
    const year = this.calendarYear();
    const month = this.calendarMonth();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    const [bookings, staff, services] = await Promise.all([
      this.bookingsService.list({
        date_from: toIsoDate(monthStart),
        date_to: toIsoDate(monthEnd),
      }),
      this.staffService.list(),
      this.servicesService.list(),
    ]);
    this.monthBookings.set(bookings);
    this.staff.set(staff.filter((s) => s.is_active));
    this.servicesById.set(new Map(services.map((s) => [s.id, s])));
    this.loading.set(false);

    await this.selectDate(this.selectedDate());
  }

  protected async selectDate(date: Date): Promise<void> {
    this.selectedDate.set(date);
    this.staffOnDuty.set(await this.staffSchedule.computeAvailability(this.staff(), date));
  }

  protected changeMonth(delta: number): void {
    const next = new Date(this.calendarYear(), this.calendarMonth() + delta, 1);
    this.calendarYear.set(next.getFullYear());
    this.calendarMonth.set(next.getMonth());
    this.loadMonth();
  }

  protected readonly staffList = computed(() => this.staff());
  protected readonly toIsoDate = toIsoDate;
}
