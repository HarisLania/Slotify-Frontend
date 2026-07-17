import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonComponent } from '../../../../components/button/button';
import { FieldErrorComponent } from '../../../../components/field-error/field-error';
import { ModalComponent } from '../../../../components/modal/modal';
import { SpinnerComponent } from '../../../../components/spinner/spinner';
import { ToastService } from '../../../../components/toast/toast.service';
import { Booking } from '../../../../core/models/booking.model';
import { StaffMember } from '../../../../core/models/staff.model';
import { TimeOff } from '../../../../core/models/time-off.model';
import { BookingsService } from '../../../../services/bookings.service';
import { StaffService } from '../../../../services/staff.service';
import { addDays, startOfWeek, toIsoDate } from '../../../../utils/date-time.util';
import { colorOf } from '../../../../utils/initials.util';
import { futureDateTimeValidator, timeRangeValidator } from '../../../../utils/validators';

const HOUR_START = 8;
const HOUR_END = 19;

interface CalendarEvent {
  kind: 'booking' | 'time_off';
  title: string;
  subtitle: string;
  staffColor: string;
  top: number;
  height: number;
}

@Component({
  selector: 'app-availability-calendar-page',
  imports: [ReactiveFormsModule, DatePipe, ButtonComponent, SpinnerComponent, ModalComponent, FieldErrorComponent],
  templateUrl: './availability-calendar-page.html',
})
export class AvailabilityCalendarPage {
  private readonly staffService = inject(StaffService);
  private readonly bookingsService = inject(BookingsService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(true);
  protected readonly weekStart = signal(startOfWeek(new Date()));
  protected readonly staff = signal<StaffMember[]>([]);
  protected readonly bookings = signal<Booking[]>([]);
  protected readonly timeOff = signal<Array<TimeOff & { staffName: string; color: string }>>([]);

  protected readonly hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
  protected readonly weekDays = computed(() =>
    Array.from({ length: 6 }, (_, i) => addDays(this.weekStart(), i)),
  );

  protected readonly blockDialogOpen = signal(false);
  protected readonly submittingBlock = signal(false);

  protected readonly blockForm = this.fb.nonNullable.group(
    {
      staffId: [0, [Validators.required, Validators.min(1)]],
      start_datetime: ['', [Validators.required, futureDateTimeValidator]],
      end_datetime: ['', [Validators.required]],
      reason: [''],
    },
    { validators: timeRangeValidator('start_datetime', 'end_datetime') },
  );

  protected readonly colorOf = colorOf;

  constructor() {
    this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    const weekStart = this.weekStart();
    const weekEnd = addDays(weekStart, 6);

    const [staff, bookings] = await Promise.all([
      this.staffService.list(),
      this.bookingsService.list({ date_from: toIsoDate(weekStart), date_to: toIsoDate(weekEnd) }),
    ]);
    const activeStaff = staff.filter((s) => s.is_active);
    this.staff.set(activeStaff);
    this.bookings.set(bookings);

    const timeOffLists = await Promise.all(
      activeStaff.map((member) => this.staffService.listTimeOff(member.id)),
    );
    const staffName = (member: StaffMember) => `${member.user.first_name} ${member.user.last_name}`;
    this.timeOff.set(
      activeStaff.flatMap((member, i) =>
        timeOffLists[i].map((entry) => ({
          ...entry,
          staffName: staffName(member),
          color: colorOf(staffName(member)),
        })),
      ),
    );
    this.loading.set(false);
  }

  private timePosition(start: Date, end: Date): { top: number; height: number } {
    const totalMinutes = (HOUR_END - HOUR_START) * 60;
    const startMinutes = (start.getHours() - HOUR_START) * 60 + start.getMinutes();
    const endMinutes = (end.getHours() - HOUR_START) * 60 + end.getMinutes();
    const top = Math.max(0, (startMinutes / totalMinutes) * 100);
    const height = Math.max(4, ((endMinutes - startMinutes) / totalMinutes) * 100);
    return { top, height };
  }

  protected eventsForDay(day: Date): CalendarEvent[] {
    const dayKey = toIsoDate(day);
    const bookingEvents: CalendarEvent[] = this.bookings()
      .filter((b) => toIsoDate(new Date(b.start_time)) === dayKey && b.status !== 'cancelled')
      .map((b) => {
        const { top, height } = this.timePosition(new Date(b.start_time), new Date(b.end_time));
        return {
          kind: 'booking',
          title: b.customer_name,
          subtitle: `${b.service_name} · ${b.staff_name}`,
          staffColor: colorOf(b.staff_name),
          top,
          height,
        };
      });

    const blockedEvents: CalendarEvent[] = this.timeOff()
      .filter((entry) => toIsoDate(new Date(entry.start_datetime)) === dayKey)
      .map((entry) => {
        const { top, height } = this.timePosition(
          new Date(entry.start_datetime),
          new Date(entry.end_datetime),
        );
        return {
          kind: 'time_off',
          title: 'Blocked',
          subtitle: entry.reason || entry.staffName,
          staffColor: entry.color,
          top,
          height,
        };
      });

    return [...bookingEvents, ...blockedEvents];
  }

  protected changeWeek(days: number): void {
    this.weekStart.set(addDays(this.weekStart(), days));
    this.load();
  }

  protected goToToday(): void {
    this.weekStart.set(startOfWeek(new Date()));
    this.load();
  }

  protected openBlockDialog(): void {
    this.blockForm.reset({ staffId: this.staff()[0]?.id ?? 0, start_datetime: '', end_datetime: '', reason: '' });
    this.blockDialogOpen.set(true);
  }

  protected async submitBlock(): Promise<void> {
    if (this.blockForm.invalid) {
      this.blockForm.markAllAsTouched();
      return;
    }
    this.submittingBlock.set(true);
    try {
      const value = this.blockForm.getRawValue();
      await this.staffService.addTimeOff(value.staffId, {
        start_datetime: new Date(value.start_datetime).toISOString(),
        end_datetime: new Date(value.end_datetime).toISOString(),
        reason: value.reason,
      });
      this.toast.success('Time blocked.');
      this.blockDialogOpen.set(false);
      await this.load();
    } catch {
      this.toast.error('Could not block this time.');
    } finally {
      this.submittingBlock.set(false);
    }
  }
}
