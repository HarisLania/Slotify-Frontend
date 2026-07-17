import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AvatarComponent } from '../../../components/avatar/avatar';
import { SpinnerComponent } from '../../../components/spinner/spinner';
import { PublicStaff } from '../../../core/models/public.model';
import { PublicBookingService } from '../../../services/public-booking.service';
import { ANY_STAFF, BookingWizardStore } from '../booking-shell/booking-wizard.store';

@Component({
  selector: 'app-select-staff-page',
  imports: [AvatarComponent, SpinnerComponent],
  templateUrl: './select-staff-page.html',
})
export class SelectStaffPage {
  private readonly router = inject(Router);
  private readonly publicBookingService = inject(PublicBookingService);
  protected readonly store = inject(BookingWizardStore);

  protected readonly loading = signal(true);
  protected readonly staff = signal<PublicStaff[]>([]);

  constructor() {
    const selection = this.store.selection();
    if (!selection.selectedServiceId) {
      this.router.navigate(['/book', selection.slug, 'service']);
      return;
    }
    this.load(selection.slug, selection.selectedServiceId);
  }

  private async load(slug: string, serviceId: number): Promise<void> {
    this.loading.set(true);
    const staff = await this.publicBookingService.listStaff(slug, serviceId);
    this.staff.set(staff);
    this.store.setStaffOptions(staff);
    this.loading.set(false);
  }

  protected chooseAny(): void {
    this.store.selectStaff(ANY_STAFF);
    this.router.navigate(['/book', this.store.selection().slug, 'time']);
  }

  protected choose(member: PublicStaff): void {
    this.store.selectStaff(member.id);
    this.router.navigate(['/book', this.store.selection().slug, 'time']);
  }
}
