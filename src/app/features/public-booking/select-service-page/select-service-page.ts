import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { EmptyStateComponent } from '../../../components/empty-state/empty-state';
import { PublicService } from '../../../core/models/public.model';
import { formatMoney } from '../../../utils/date-time.util';
import { BookingWizardStore } from '../booking-shell/booking-wizard.store';

@Component({
  selector: 'app-select-service-page',
  imports: [EmptyStateComponent],
  templateUrl: './select-service-page.html',
})
export class SelectServicePage {
  private readonly router = inject(Router);
  protected readonly store = inject(BookingWizardStore);

  protected readonly formatMoney = formatMoney;

  protected get services(): PublicService[] {
    return this.store.selection().services;
  }

  protected choose(service: PublicService): void {
    this.store.selectService(service.id);
    this.router.navigate(['/book', this.store.selection().slug, 'staff']);
  }
}
