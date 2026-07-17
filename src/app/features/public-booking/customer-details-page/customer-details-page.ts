import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ButtonComponent } from '../../../components/button/button';
import { FieldErrorComponent } from '../../../components/field-error/field-error';
import { ToastService } from '../../../components/toast/toast.service';
import { PublicBookingService } from '../../../services/public-booking.service';
import { formatDateLong, formatMoney, formatTime } from '../../../utils/date-time.util';
import { phoneValidator } from '../../../utils/validators';
import { BookingWizardStore } from '../booking-shell/booking-wizard.store';

@Component({
  selector: 'app-customer-details-page',
  imports: [ReactiveFormsModule, ButtonComponent, FieldErrorComponent],
  templateUrl: './customer-details-page.html',
})
export class CustomerDetailsPage {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly publicBookingService = inject(PublicBookingService);
  private readonly toast = inject(ToastService);
  protected readonly store = inject(BookingWizardStore);

  protected readonly submitting = signal(false);
  protected readonly formatDateLong = formatDateLong;
  protected readonly formatTime = formatTime;
  protected readonly formatMoney = formatMoney;

  protected readonly form = this.fb.nonNullable.group({
    customer_name: ['', [Validators.required, Validators.minLength(2)]],
    customer_email: ['', [Validators.required, Validators.email]],
    customer_phone: ['', [phoneValidator]],
    notes: [''],
  });

  constructor() {
    const selection = this.store.selection();
    if (!selection.selectedSlot || !selection.selectedServiceId) {
      this.router.navigate(['/book', selection.slug, 'time']);
    }
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const selection = this.store.selection();
    if (!selection.selectedSlot || !selection.selectedServiceId) return;

    this.submitting.set(true);
    try {
      const booking = await this.publicBookingService.createBooking(selection.slug, {
        service: selection.selectedServiceId,
        staff: selection.selectedSlot.staffId,
        start_time: selection.selectedSlot.startTime,
        ...this.form.getRawValue(),
      });
      this.store.setCreatedBooking(booking);
      await this.router.navigate(['/book', selection.slug, 'confirmation']);
    } catch {
      this.toast.error('Could not complete your booking. That time may no longer be available.');
    } finally {
      this.submitting.set(false);
    }
  }
}
