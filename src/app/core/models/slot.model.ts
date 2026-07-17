/** GET /api/public/{slug}/slots/ returns { date, staff, service, slots: [...] } — slots are bare ISO datetime strings. */
export interface SlotsResponse {
  date: string;
  staff: number;
  service: number;
  slots: string[];
}
