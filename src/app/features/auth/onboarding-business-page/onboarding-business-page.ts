import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ButtonComponent } from '../../../components/button/button';
import { FieldErrorComponent } from '../../../components/field-error/field-error';
import { SpinnerComponent } from '../../../components/spinner/spinner';
import { ToastService } from '../../../components/toast/toast.service';
import { BusinessService } from '../../../services/business.service';
import { COMMON_TIMEZONES } from '../../../utils/timezones';

@Component({
  selector: 'app-onboarding-business-page',
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, FieldErrorComponent, SpinnerComponent],
  templateUrl: './onboarding-business-page.html',
})
export class OnboardingBusinessPage {
  private readonly fb = inject(FormBuilder);
  private readonly businessService = inject(BusinessService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly timezones = COMMON_TIMEZONES;
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    timezone: ['Asia/Dubai', [Validators.required]],
    address: [''],
  });

  constructor() {
    this.loadBusiness();
  }

  private async loadBusiness(): Promise<void> {
    try {
      const business = await this.businessService.getBusiness();
      this.form.patchValue({
        name: business.name,
        timezone: business.timezone,
        address: business.address,
      });
    } catch {
      this.toast.error('Could not load your business details.');
    } finally {
      this.loading.set(false);
    }
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    try {
      await this.businessService.updateBusiness(this.form.getRawValue());
      await this.router.navigateByUrl('/dashboard');
    } catch {
      this.toast.error('Could not save your business details.');
    } finally {
      this.submitting.set(false);
    }
  }
}
