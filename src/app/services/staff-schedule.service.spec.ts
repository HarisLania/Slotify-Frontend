import { TestBed } from '@angular/core/testing';

import { StaffMember } from '../core/models/staff.model';
import { TimeOff } from '../core/models/time-off.model';
import { WorkingHours } from '../core/models/working-hours.model';
import { StaffScheduleService } from './staff-schedule.service';
import { StaffService } from './staff.service';

describe('StaffScheduleService', () => {
  let service: StaffScheduleService;
  let staffServiceSpy: jasmine.SpyObj<Pick<StaffService, 'listWorkingHours' | 'listTimeOff'>>;

  const staff: StaffMember[] = [
    { id: 1, user: { id: 1, username: 'sarah', email: '', first_name: 'Sarah', last_name: 'Chen' }, services: [], is_active: true },
    { id: 2, user: { id: 2, username: 'marco', email: '', first_name: 'Marco', last_name: 'Rivera' }, services: [], is_active: true },
  ];

  beforeEach(() => {
    staffServiceSpy = jasmine.createSpyObj('StaffService', ['listWorkingHours', 'listTimeOff']);
    TestBed.configureTestingModule({
      providers: [{ provide: StaffService, useValue: staffServiceSpy }],
    });
    service = TestBed.inject(StaffScheduleService);
  });

  it('computes availability per staff member for the given date', async () => {
    const monday = new Date(2026, 6, 20);
    const mondayHours: WorkingHours[] = [
      { id: 1, staff: 1, day_of_week: 0, start_time: '09:00:00', end_time: '17:00:00' },
    ];

    staffServiceSpy.listWorkingHours.and.callFake((staffId: number) =>
      Promise.resolve(staffId === 1 ? mondayHours : []),
    );
    staffServiceSpy.listTimeOff.and.returnValue(Promise.resolve([] as TimeOff[]));

    const result = await service.computeAvailability(staff, monday);

    expect(result.get(1)).toBeTrue();
    expect(result.get(2)).toBeFalse();
  });
});
