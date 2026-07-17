import { Component, input } from '@angular/core';

export type StatusBadgeKind =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show'
  | 'upcoming';

const LABELS: Record<StatusBadgeKind, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
  no_show: 'No Show',
  upcoming: 'Upcoming',
};

const CLASSES: Record<StatusBadgeKind, string> = {
  pending: 'bg-status-pending-bg text-status-pending-fg',
  confirmed: 'bg-status-confirmed-bg text-status-confirmed-fg',
  cancelled: 'bg-status-cancelled-bg text-status-cancelled-fg',
  completed: 'bg-status-completed-bg text-status-completed-fg',
  no_show: 'bg-status-noshow-bg text-status-noshow-fg',
  upcoming: 'bg-status-upcoming-bg text-status-upcoming-fg',
};

@Component({
  selector: 'app-status-badge',
  template: `
    <span
      class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
      [class]="CLASSES[status()]"
    >
      {{ LABELS[status()] }}
    </span>
  `,
})
export class StatusBadgeComponent {
  readonly status = input.required<StatusBadgeKind>();
  protected readonly LABELS = LABELS;
  protected readonly CLASSES = CLASSES;
}
