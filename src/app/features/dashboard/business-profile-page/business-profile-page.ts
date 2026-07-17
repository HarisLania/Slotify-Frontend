import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonComponent } from '../../../components/button/button';
import { FieldErrorComponent } from '../../../components/field-error/field-error';
import { SpinnerComponent } from '../../../components/spinner/spinner';
import { ToastService } from '../../../components/toast/toast.service';
import { BusinessService } from '../../../services/business.service';
import { COMMON_TIMEZONES } from '../../../utils/timezones';

@Component({
  selector: 'app-business-profile-page',
  imports: [ReactiveFormsModule, ButtonComponent, FieldErrorComponent, SpinnerComponent],
  templateUrl: './business-profile-page.html',
})
export class BusinessProfilePage {
  private readonly fb = inject(FormBuilder);
  private readonly businessService = inject(BusinessService);
  private readonly toast = inject(ToastService);

  protected readonly timezones = COMMON_TIMEZONES;
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly slug = signal('');
  protected readonly bookingUrl = signal('');

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    timezone: ['', [Validators.required]],
    address: [''],
  });

  constructor() {
    this.load();
  }

  private async load(): Promise<void> {
    try {
      const business = await this.businessService.getBusiness(true);
      this.form.patchValue({
        name: business.name,
        timezone: business.timezone,
        address: business.address,
      });
      this.slug.set(business.slug);
      this.bookingUrl.set(`${location.origin}/book/${business.slug}`);
    } catch {
      this.toast.error('Could not load your business details.');
    } finally {
      this.loading.set(false);
    }
  }

  protected async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    try {
      await this.businessService.updateBusiness(this.form.getRawValue());
      this.toast.success('Business profile updated.');
    } catch {
      this.toast.error('Could not save your changes.');
    } finally {
      this.saving.set(false);
    }
  }

  protected async copyBookingUrl(): Promise<void> {
    await navigator.clipboard.writeText(this.bookingUrl());
    this.toast.success('Booking link copied.');
  }
}
