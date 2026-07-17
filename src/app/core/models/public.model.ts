/** GET /api/public/{slug}/services/ — no description of the business itself is exposed here. */
export interface PublicService {
  id: number;
  name: string;
  description: string;
  duration_minutes: number;
  price: string;
}

/** GET /api/public/{slug}/staff/?service= — just enough to pick a person, no email/phone. */
export interface PublicStaff {
  id: number;
  name: string;
}
