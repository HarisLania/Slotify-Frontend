import { TimeOff } from '../core/models/time-off.model';
import { WorkingHours } from '../core/models/working-hours.model';
import { overlaps, toBackendDayOfWeek } from './date-time.util';

/** A staff member is "on duty" for a date if they have working hours that day and aren't on time off. */
export function isStaffAvailableOn(date: Date, workingHours: WorkingHours[], timeOff: TimeOff[]): boolean {
  const dow = toBackendDayOfWeek(date);
  const worksThatDay = workingHours.some((wh) => wh.day_of_week === dow);
  if (!worksThatDay) {
    return false;
  }

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const onTimeOff = timeOff.some((entry) =>
    overlaps(new Date(entry.start_datetime), new Date(entry.end_datetime), dayStart, dayEnd),
  );
  return !onTimeOff;
}
