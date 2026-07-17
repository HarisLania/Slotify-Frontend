import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

import { SpinnerComponent } from '../../../components/spinner/spinner';
import { StepperComponent } from '../../../components/stepper/stepper';
import { PublicBookingService } from '../../../services/public-booking.service';
import { BookingWizardStore } from './booking-wizard.store';

const STEP_LABELS = ['Service', 'Staff', 'Time', 'Details'];
const STEP_PATHS = ['service', 'staff', 'time', 'details'];

@Component({
  selector: 'app-booking-shell',
  imports: [RouterOutlet, StepperComponent, SpinnerComponent],
  templateUrl: './booking-shell.html',
})
export class BookingShell {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly publicBookingService = inject(PublicBookingService);
  protected readonly store = inject(BookingWizardStore);

  protected readonly slug = this.route.snapshot.paramMap.get('slug')!;
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);

  protected readonly STEP_LABELS = STEP_LABELS;

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly currentStepIndex = computed(() => {
    const url = this.currentUrl();
    const index = STEP_PATHS.findIndex((path) => url.endsWith(`/${path}`));
    return index === -1 ? 0 : index;
  });

  protected readonly showBack = computed(() => this.currentStepIndex() > 0);
  protected readonly showStepper = computed(() => !this.currentUrl().endsWith('/confirmation'));

  constructor() {
    this.store.initFor(this.slug);
    this.loadContext();
  }

  private async loadContext(): Promise<void> {
    this.loading.set(true);
    try {
      const services = await this.publicBookingService.listServices(this.slug);
      this.store.setServices(services);
    } catch {
      this.loadError.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  protected goBack(): void {
    const previousStep = STEP_PATHS[this.currentStepIndex() - 1];
    if (previousStep) {
      this.router.navigate(['/book', this.slug, previousStep]);
    }
  }
}
