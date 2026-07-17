import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonComponent } from '../../../../components/button/button';
import { FieldErrorComponent } from '../../../../components/field-error/field-error';
import { ModalComponent } from '../../../../components/modal/modal';
import { ToastService } from '../../../../components/toast/toast.service';
import { Service } from '../../../../core/models/service.model';
import { StaffMember } from '../../../../core/models/staff.model';
import { StaffService } from '../../../../services/staff.service';

@Component({
  selector: 'app-staff-form-dialog',
  imports: [ReactiveFormsModule, ButtonComponent, FieldErrorComponent, ModalComponent],
  templateUrl: './staff-form-dialog.html',
})
export class StaffFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly staffService = inject(StaffService);
  private readonly toast = inject(ToastService);

  readonly open = input(false);
  readonly staffMember = input<StaffMember | null>(null);
  readonly services = input.required<Service[]>();
  readonly closed = output<void>();
  readonly saved = output<void>();

  protected readonly saving = signal(false);

  protected readonly createForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.pattern(/^[\w.@+-]+$/), Validators.maxLength(150)]],
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    serviceIds: this.fb.nonNullable.control<number[]>([]),
    is_active: [true],
  });

  constructor() {
    effect(() => {
      const member = this.staffMember();
      this.createForm.reset({
        username: member?.user.username ?? '',
        first_name: member?.user.first_name ?? '',
        last_name: member?.user.last_name ?? '',
        email: member?.user.email ?? '',
        password: '',
        serviceIds: member?.services ?? [],
        is_active: member?.is_active ?? true,
      });
      if (member) {
        this.createForm.controls.username.disable();
        this.createForm.controls.email.disable();
        this.createForm.controls.password.disable();
      } else {
        this.createForm.controls.username.enable();
        this.createForm.controls.email.enable();
        this.createForm.controls.password.enable();
      }
    });
  }

  protected isServiceSelected(serviceId: number): boolean {
    return this.createForm.controls.serviceIds.value.includes(serviceId);
  }

  protected toggleService(serviceId: number, checked: boolean): void {
    const current = this.createForm.controls.serviceIds.value;
    this.createForm.controls.serviceIds.setValue(
      checked ? [...current, serviceId] : current.filter((id) => id !== serviceId),
    );
  }

  protected async submit(): Promise<void> {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    try {
      const value = this.createForm.getRawValue();
      const current = this.staffMember();
      if (current) {
        await this.staffService.update(current.id, {
          services: value.serviceIds,
          is_active: value.is_active,
        });
        this.toast.success('Staff member updated.');
      } else {
        await this.staffService.create({
          username: value.username,
          first_name: value.first_name,
          last_name: value.last_name,
          email: value.email,
          password: value.password,
          services: value.serviceIds,
        });
        this.toast.success('Staff member added.');
      }
      this.saved.emit();
    } catch {
      this.toast.error('Could not save this staff member.');
    } finally {
      this.saving.set(false);
    }
  }
}
