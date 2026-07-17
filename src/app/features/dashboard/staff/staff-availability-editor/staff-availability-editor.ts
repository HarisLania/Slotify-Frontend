import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ButtonComponent } from '../../../../components/button/button';
import { FieldErrorComponent } from '../../../../components/field-error/field-error';
import { SpinnerComponent } from '../../../../components/spinner/spinner';
import { ToastService } from '../../../../components/toast/toast.service';
import { StaffMember } from '../../../../core/models/staff.model';
import { TimeOff } from '../../../../core/models/time-off.model';
import { DAY_LABELS, DayOfWeek, WorkingHours } from '../../../../core/models/working-hours.model';
import { StaffService } from '../../../../services/staff.service';
import { formatDateLong, formatTime } from '../../../../utils/date-time.util';
import { futureDateTimeValidator, timeRangeValidator } from '../../../../utils/validators';

interface DayRow {
  day: DayOfWeek;
  label: string;
  enabled: boolean;
  start: string;
  end: string;
}

const ALL_DAYS: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];

@Component({
  selector: 'app-staff-availability-editor',
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, FieldErrorComponent, SpinnerComponent],
  templateUrl: './staff-availability-editor.html',
})
export class StaffAvailabilityEditor {
  private readonly route = inject(ActivatedRoute);
  private readonly staffService = inject(StaffService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  private readonly staffId = Number(this.route.snapshot.paramMap.get('staffId'));

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly addingTimeOff = signal(false);
  protected readonly staffMember = signal<StaffMember | null>(null);
  protected readonly days = signal<DayRow[]>([]);
  protected readonly timeOff = signal<TimeOff[]>([]);

  protected readonly DAY_LABELS = DAY_LABELS;
  protected readonly formatDateLong = formatDateLong;
  protected readonly formatTime = formatTime;

  protected readonly timeOffForm = this.fb.nonNullable.group(
    {
      start_datetime: ['', [Validators.required, futureDateTimeValidator]],
      end_datetime: ['', [Validators.required]],
      reason: [''],
    },
    { validators: timeRangeValidator('start_datetime', 'end_datetime') },
  );

  constructor() {
    this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    const [staffMember, workingHours, timeOff] = await Promise.all([
      this.staffService.get(this.staffId),
      this.staffService.listWorkingHours(this.staffId),
      this.staffService.listTimeOff(this.staffId),
    ]);
    this.staffMember.set(staffMember);
    this.timeOff.set(timeOff);

    const byDay = new Map(workingHours.map((wh) => [wh.day_of_week, wh]));
    this.days.set(
      ALL_DAYS.map((day) => {
        const existing = byDay.get(day);
        return {
          day,
          label: DAY_LABELS[day],
          enabled: !!existing,
          start: existing?.start_time?.slice(0, 5) ?? '09:00',
          end: existing?.end_time?.slice(0, 5) ?? '17:00',
        };
      }),
    );
    this.loading.set(false);
  }

  protected toggleDay(day: DayOfWeek): void {
    this.days.update((rows) =>
      rows.map((row) => (row.day === day ? { ...row, enabled: !row.enabled } : row)),
    );
  }

  protected updateDayTime(day: DayOfWeek, field: 'start' | 'end', value: string): void {
    this.days.update((rows) =>
      rows.map((row) => (row.day === day ? { ...row, [field]: value } : row)),
    );
  }

  protected async saveWorkingHours(): Promise<void> {
    this.saving.set(true);
    try {
      const enabledDays = this.days().filter((row) => row.enabled);
      await Promise.all(
        enabledDays.map((row) =>
          this.staffService.setWorkingHours(this.staffId, {
            day_of_week: row.day,
            start_time: `${row.start}:00`,
            end_time: `${row.end}:00`,
          }),
        ),
      );
      this.toast.success('Working hours saved.');
    } catch {
      this.toast.error('Could not save working hours.');
    } finally {
      this.saving.set(false);
    }
  }

  protected async addTimeOff(): Promise<void> {
    if (this.timeOffForm.invalid) {
      this.timeOffForm.markAllAsTouched();
      return;
    }
    this.addingTimeOff.set(true);
    try {
      const value = this.timeOffForm.getRawValue();
      const created = await this.staffService.addTimeOff(this.staffId, {
        start_datetime: new Date(value.start_datetime).toISOString(),
        end_datetime: new Date(value.end_datetime).toISOString(),
        reason: value.reason,
      });
      this.timeOff.update((entries) => [...entries, created]);
      this.timeOffForm.reset({ start_datetime: '', end_datetime: '', reason: '' });
      this.toast.success('Time off added.');
    } catch {
      this.toast.error('Could not add time off.');
    } finally {
      this.addingTimeOff.set(false);
    }
  }
}
