export interface Business {
  id: number;
  owner: number;
  name: string;
  slug: string;
  timezone: string;
  address: string;
  logo: string | null;
  created_at: string;
}

export type BusinessUpdate = Partial<Pick<Business, 'name' | 'timezone' | 'address'>>;
