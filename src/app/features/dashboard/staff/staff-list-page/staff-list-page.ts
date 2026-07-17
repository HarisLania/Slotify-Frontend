import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AvatarComponent } from '../../../../components/avatar/avatar';
import { ButtonComponent } from '../../../../components/button/button';
import { ConfirmService } from '../../../../components/confirm-dialog/confirm.service';
import { EmptyStateComponent } from '../../../../components/empty-state/empty-state';
import { SpinnerComponent } from '../../../../components/spinner/spinner';
import { ToastService } from '../../../../components/toast/toast.service';
import { Service } from '../../../../core/models/service.model';
import { StaffMember } from '../../../../core/models/staff.model';
import { StaffScheduleService } from '../../../../services/staff-schedule.service';
import { StaffService } from '../../../../services/staff.service';
import { ServicesService } from '../../../../services/services.service';
import { StaffFormDialog } from '../staff-form-dialog/staff-form-dialog';
import { pluralize } from '../../../../utils/date-time.util';

@Component({
  selector: 'app-staff-list-page',
  imports: [RouterLink, ButtonComponent, SpinnerComponent, EmptyStateComponent, AvatarComponent, StaffFormDialog],
  templateUrl: './staff-list-page.html',
})
export class StaffListPage {
  private readonly staffService = inject(StaffService);
  private readonly servicesService = inject(ServicesService);
  private readonly staffSchedule = inject(StaffScheduleService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(true);
  protected readonly staff = signal<StaffMember[]>([]);
  protected readonly services = signal<Service[]>([]);
  protected readonly availableToday = signal<Map<number, boolean>>(new Map());

  protected readonly dialogOpen = signal(false);
  protected readonly editingStaff = signal<StaffMember | null>(null);
  protected readonly pluralize = pluralize;

  constructor() {
    this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    const [staff, services] = await Promise.all([this.staffService.list(), this.servicesService.list()]);
    this.staff.set(staff);
    this.services.set(services);
    this.availableToday.set(await this.staffSchedule.computeAvailability(staff, new Date()));
    this.loading.set(false);
  }

  protected openInvite(): void {
    this.editingStaff.set(null);
    this.dialogOpen.set(true);
  }

  protected openEdit(member: StaffMember): void {
    this.editingStaff.set(member);
    this.dialogOpen.set(true);
  }

  protected closeDialog(): void {
    this.dialogOpen.set(false);
  }

  protected async onSaved(): Promise<void> {
    this.dialogOpen.set(false);
    await this.load();
  }

  protected serviceNames(member: StaffMember): string[] {
    const byId = new Map(this.services().map((s) => [s.id, s.name]));
    return member.services.map((id) => byId.get(id)).filter((name): name is string => !!name);
  }

  protected async remove(member: StaffMember): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Remove staff member?',
      message: `${member.user.first_name} ${member.user.last_name} will no longer be bookable.`,
      confirmLabel: 'Remove',
      danger: true,
    });
    if (!confirmed) return;

    try {
      await this.staffService.delete(member.id);
      this.toast.success('Staff member removed.');
      await this.load();
    } catch {
      this.toast.error('Could not remove this staff member.');
    }
  }
}
