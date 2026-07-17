import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonComponent } from '../../../../components/button/button';
import { FieldErrorComponent } from '../../../../components/field-error/field-error';
import { ModalComponent } from '../../../../components/modal/modal';
import { ToastService } from '../../../../components/toast/toast.service';
import { Service } from '../../../../core/models/service.model';
import { ServicesService } from '../../../../services/services.service';

@Component({
  selector: 'app-service-form-dialog',
  imports: [ReactiveFormsModule, ButtonComponent, FieldErrorComponent, ModalComponent],
  templateUrl: './service-form-dialog.html',
})
export class ServiceFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly servicesService = inject(ServicesService);
  private readonly toast = inject(ToastService);

  readonly open = input(false);
  readonly service = input<Service | null>(null);
  readonly closed = output<void>();
  readonly saved = output<void>();

  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    duration_minutes: [30, [Validators.required, Validators.min(5)]],
    buffer_minutes: [0, [Validators.required, Validators.min(0)]],
    price: [0, [Validators.required, Validators.min(0)]],
    is_active: [true],
  });

  constructor() {
    effect(() => {
      const service = this.service();
      if (service) {
        this.form.patchValue({
          name: service.name,
          description: service.description,
          duration_minutes: service.duration_minutes,
          buffer_minutes: service.buffer_minutes,
          price: parseFloat(service.price),
          is_active: service.is_active,
        });
      } else {
        this.form.reset({
          name: '',
          description: '',
          duration_minutes: 30,
          buffer_minutes: 0,
          price: 0,
          is_active: true,
        });
      }
    });
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    try {
      const value = { ...this.form.getRawValue(), price: this.form.getRawValue().price.toString() };
      const current = this.service();
      if (current) {
        await this.servicesService.update(current.id, value);
        this.toast.success('Service updated.');
      } else {
        await this.servicesService.create(value);
        this.toast.success('Service created.');
      }
      this.saved.emit();
    } catch {
      this.toast.error('Could not save this service.');
    } finally {
      this.saving.set(false);
    }
  }
}
