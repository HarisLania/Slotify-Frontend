export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

/** Flat dashboard/public representation — service and staff are ids with a display name alongside, not nested objects. */
export interface Booking {
  id: number;
  business: number;
  service: number;
  service_name: string;
  staff: number;
  staff_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  notes: string;
  created_at: string;
}

export interface BookingFilters {
  status?: BookingStatus;
  staff?: number;
  date_from?: string;
  date_to?: string;
}

/** PATCH /api/bookings/{id}/status/ only ever returns {id, status}, not the full booking. */
export interface BookingStatusResult {
  id: number;
  status: BookingStatus;
}

/** Payload for POST /api/public/{business_slug}/bookings/ */
export interface PublicBookingInput {
  service: number;
  staff: number;
  start_time: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes: string;
}
