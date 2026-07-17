/** Standard DRF pagination envelope. List services also accept a plain array response. */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export function unwrapList<T>(response: Paginated<T> | T[]): T[] {
  return Array.isArray(response) ? response : response.results;
}
