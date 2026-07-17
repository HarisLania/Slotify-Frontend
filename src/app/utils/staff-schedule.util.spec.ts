import { TimeOff } from '../core/models/time-off.model';
import { WorkingHours } from '../core/models/working-hours.model';
import { isStaffAvailableOn } from './staff-schedule.util';

function workingHours(dayOfWeek: number): WorkingHours[] {
  return [{ id: 1, staff: 1, day_of_week: dayOfWeek as WorkingHours['day_of_week'], start_time: '09:00:00', end_time: '17:00:00' }];
}

describe('isStaffAvailableOn', () => {
  it('returns false when the staff has no working hours for that day', () => {
    const monday = new Date(2026, 6, 20); // Monday
    expect(isStaffAvailableOn(monday, workingHours(1), [])).toBeFalse(); // only works Tuesdays
  });

  it('returns true when working hours match the day and there is no time off', () => {
    const monday = new Date(2026, 6, 20);
    expect(isStaffAvailableOn(monday, workingHours(0), [])).toBeTrue();
  });

  it('returns false when a time-off entry overlaps that day', () => {
    const monday = new Date(2026, 6, 20);
    const timeOff: TimeOff[] = [
      {
        id: 1,
        staff: 1,
        start_datetime: new Date(2026, 6, 20, 8).toISOString(),
        end_datetime: new Date(2026, 6, 20, 12).toISOString(),
        reason: 'Dentist',
      },
    ];
    expect(isStaffAvailableOn(monday, workingHours(0), timeOff)).toBeFalse();
  });

  it('ignores time off on other days', () => {
    const monday = new Date(2026, 6, 20);
    const timeOff: TimeOff[] = [
      {
        id: 1,
        staff: 1,
        start_datetime: new Date(2026, 6, 21, 8).toISOString(),
        end_datetime: new Date(2026, 6, 21, 12).toISOString(),
        reason: 'Dentist',
      },
    ];
    expect(isStaffAvailableOn(monday, workingHours(0), timeOff)).toBeTrue();
  });
});
