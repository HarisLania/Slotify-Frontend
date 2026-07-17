import { Component, inject, signal } from '@angular/core';

import { AvatarComponent } from '../../../../components/avatar/avatar';
import { ButtonComponent } from '../../../../components/button/button';
import { ConfirmService } from '../../../../components/confirm-dialog/confirm.service';
import { EmptyStateComponent } from '../../../../components/empty-state/empty-state';
import { SpinnerComponent } from '../../../../components/spinner/spinner';
import { ToastService } from '../../../../components/toast/toast.service';
import { Service } from '../../../../core/models/service.model';
import { StaffMember } from '../../../../core/models/staff.model';
import { ServicesService } from '../../../../services/services.service';
import { StaffService } from '../../../../services/staff.service';
import { formatMoney, pluralize } from '../../../../utils/date-time.util';
import { ServiceFormDialog } from '../service-form-dialog/service-form-dialog';

@Component({
  selector: 'app-services-list-page',
  imports: [ButtonComponent, SpinnerComponent, EmptyStateComponent, AvatarComponent, ServiceFormDialog],
  templateUrl: './services-list-page.html',
})
export class ServicesListPage {
  private readonly servicesService = inject(ServicesService);
  private readonly staffService = inject(StaffService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(true);
  protected readonly services = signal<Service[]>([]);
  protected readonly staff = signal<StaffMember[]>([]);

  protected readonly dialogOpen = signal(false);
  protected readonly editingService = signal<Service | null>(null);

  protected readonly formatMoney = formatMoney;
  protected readonly pluralize = pluralize;

  constructor() {
    this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    const [services, staff] = await Promise.all([this.servicesService.list(), this.staffService.list()]);
    this.services.set(services);
    this.staff.set(staff);
    this.loading.set(false);
  }

  protected assignedStaff(serviceId: number): StaffMember[] {
    return this.staff().filter((member) => member.services.includes(serviceId));
  }

  protected openCreate(): void {
    this.editingService.set(null);
    this.dialogOpen.set(true);
  }

  protected openEdit(service: Service): void {
    this.editingService.set(service);
    this.dialogOpen.set(true);
  }

  protected closeDialog(): void {
    this.dialogOpen.set(false);
  }

  protected async onSaved(): Promise<void> {
    this.dialogOpen.set(false);
    await this.load();
  }

  protected async delete(service: Service): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Delete service?',
      message: `"${service.name}" will no longer be bookable. This can't be undone.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!confirmed) return;

    try {
      await this.servicesService.delete(service.id);
      this.toast.success('Service deleted.');
      await this.load();
    } catch {
      this.toast.error('Could not delete this service.');
    }
  }
}
