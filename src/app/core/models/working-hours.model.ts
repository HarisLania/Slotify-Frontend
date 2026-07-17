/** 0=Monday ... 6=Sunday, matching the backend's WorkingHours.day_of_week. */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAY_LABELS: Record<DayOfWeek, string> = {
  0: 'Mon',
  1: 'Tue',
  2: 'Wed',
  3: 'Thu',
  4: 'Fri',
  5: 'Sat',
  6: 'Sun',
};

export interface WorkingHours {
  id: number;
  staff: number;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
}

export type WorkingHoursInput = Omit<WorkingHours, 'id' | 'staff'>;
