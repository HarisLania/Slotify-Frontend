export interface TimeOff {
  id: number;
  staff: number;
  start_datetime: string;
  end_datetime: string;
  reason: string;
}

export type TimeOffInput = Omit<TimeOff, 'id' | 'staff'>;
