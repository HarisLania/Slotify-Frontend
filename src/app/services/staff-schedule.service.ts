import { Injectable, inject } from '@angular/core';

import { StaffMember } from '../core/models/staff.model';
import { isStaffAvailableOn } from '../utils/staff-schedule.util';
import { StaffService } from './staff.service';

/** Cross-references each staff member's working hours + time off to derive "on duty" status for a date. */
@Injectable({ providedIn: 'root' })
export class StaffScheduleService {
  private readonly staffService = inject(StaffService);

  async computeAvailability(staff: StaffMember[], date: Date): Promise<Map<number, boolean>> {
    const entries = await Promise.all(
      staff.map(async (member) => {
        const [workingHours, timeOff] = await Promise.all([
          this.staffService.listWorkingHours(member.id),
          this.staffService.listTimeOff(member.id),
        ]);
        return [member.id, isStaffAvailableOn(date, workingHours, timeOff)] as const;
      }),
    );
    return new Map(entries);
  }
}
