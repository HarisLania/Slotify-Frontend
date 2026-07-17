import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AvatarComponent } from '../../../../components/avatar/avatar';
import { EmptyStateComponent } from '../../../../components/empty-state/empty-state';
import { SpinnerComponent } from '../../../../components/spinner/spinner';
import { StatusBadgeComponent } from '../../../../components/status-badge/status-badge';
import { ToastService } from '../../../../components/toast/toast.service';
import { Booking, BookingStatus } from '../../../../core/models/booking.model';
import { Service } from '../../../../core/models/service.model';
import { BookingsService } from '../../../../services/bookings.service';
import { ServicesService } from '../../../../services/services.service';
import { formatDateLong, formatMoney, formatTime, pluralize } from '../../../../utils/date-time.util';

type FilterTab = 'all' | 'upcoming' | BookingStatus;

const TABS: Array<{ id: FilterTab; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'pending', label: 'Pending' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'no_show', label: 'No Show' },
];

const STATUS_OPTIONS: BookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];

@Component({
  selector: 'app-bookings-list-page',
  imports: [FormsModule, AvatarComponent, StatusBadgeComponent, SpinnerComponent, EmptyStateComponent],
  templateUrl: './bookings-list-page.html',
})
export class BookingsListPage {
  private readonly bookingsService = inject(BookingsService);
  private readonly servicesService = inject(ServicesService);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(true);
  protected readonly bookings = signal<Booking[]>([]);
  protected readonly servicesById = signal<Map<number, Service>>(new Map());
  protected readonly activeTab = signal<FilterTab>('all');
  protected readonly search = signal('');

  protected readonly TABS = TABS;
  protected readonly STATUS_OPTIONS = STATUS_OPTIONS;
  protected readonly formatDateLong = formatDateLong;
  protected readonly formatTime = formatTime;
  protected readonly formatMoney = formatMoney;
  protected readonly pluralize = pluralize;

  protected readonly filtered = computed(() => {
    const tab = this.activeTab();
    const query = this.search().trim().toLowerCase();
    return this.bookings()
      .filter((b) => {
        if (tab === 'all') return true;
        if (tab === 'upcoming') {
          return new Date(b.start_time) >= new Date() && b.status !== 'cancelled' && b.status !== 'completed';
        }
        return b.status === tab;
      })
      .filter(
        (b) =>
          !query ||
          b.customer_name.toLowerCase().includes(query) ||
          b.service_name.toLowerCase().includes(query),
      )
      .sort((a, b) => b.start_time.localeCompare(a.start_time));
  });

  constructor() {
    this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    const [bookings, services] = await Promise.all([
      this.bookingsService.list(),
      this.servicesService.list(),
    ]);
    this.bookings.set(bookings);
    this.servicesById.set(new Map(services.map((s) => [s.id, s])));
    this.loading.set(false);
  }

  protected async changeStatus(booking: Booking, status: BookingStatus): Promise<void> {
    if (status === booking.status) return;
    try {
      const result = await this.bookingsService.updateStatus(booking.id, status);
      this.bookings.update((all) =>
        all.map((b) => (b.id === booking.id ? { ...b, status: result.status } : b)),
      );
      this.toast.success('Booking status updated.');
    } catch {
      this.toast.error('Could not update booking status.');
    }
  }
}
