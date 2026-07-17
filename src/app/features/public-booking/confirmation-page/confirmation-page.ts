import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '../../../components/button/button';
import { formatDateLong, formatMoney, formatTime } from '../../../utils/date-time.util';
import { downloadIcsFile } from '../../../utils/ics.util';
import { BookingWizardStore } from '../booking-shell/booking-wizard.store';

@Component({
  selector: 'app-confirmation-page',
  imports: [RouterLink, ButtonComponent],
  templateUrl: './confirmation-page.html',
})
export class ConfirmationPage {
  protected readonly store = inject(BookingWizardStore);

  protected readonly formatDateLong = formatDateLong;
  protected readonly formatTime = formatTime;
  protected readonly formatMoney = formatMoney;

  protected addToCalendar(): void {
    const booking = this.store.selection().createdBooking;
    if (!booking) return;
    downloadIcsFile(`${booking.service_name}.ics`, {
      title: `${booking.service_name} — Slotify`,
      description: booking.notes,
      start: booking.start_time,
      end: booking.end_time,
    });
  }
}
