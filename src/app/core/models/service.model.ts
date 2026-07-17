export interface Service {
  id: number;
  business: number;
  name: string;
  description: string;
  duration_minutes: number;
  buffer_minutes: number;
  price: string;
  is_active: boolean;
}

export type ServiceInput = Omit<Service, 'id' | 'business'>;
