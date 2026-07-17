import {
  addDays,
  formatMoney,
  isSameDay,
  monthMatrix,
  overlaps,
  pluralize,
  startOfWeek,
  toBackendDayOfWeek,
  toIsoDate,
} from './date-time.util';

describe('date-time.util', () => {
  it('toBackendDayOfWeek converts JS Sunday-first to backend Monday-first', () => {
    expect(toBackendDayOfWeek(new Date(2026, 6, 20))).toBe(0); // Monday
    expect(toBackendDayOfWeek(new Date(2026, 6, 26))).toBe(6); // Sunday
  });

  it('toIsoDate zero-pads month and day', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('formatMoney strips a trailing .00 but keeps other cents', () => {
    expect(formatMoney('25.00')).toBe('$25');
    expect(formatMoney('25.50')).toBe('$25.50');
    expect(formatMoney(9.9)).toBe('$9.90');
  });

  it('isSameDay compares calendar day, not time', () => {
    expect(isSameDay(new Date(2026, 6, 20, 9, 0), new Date(2026, 6, 20, 23, 0))).toBeTrue();
    expect(isSameDay(new Date(2026, 6, 20), new Date(2026, 6, 21))).toBeFalse();
  });

  it('addDays adds calendar days', () => {
    const result = addDays(new Date(2026, 6, 20), 5);
    expect(toIsoDate(result)).toBe('2026-07-25');
  });

  it('startOfWeek returns the Monday of the given date\'s week', () => {
    const result = startOfWeek(new Date(2026, 6, 23)); // Thursday
    expect(toIsoDate(result)).toBe('2026-07-20');
  });

  it('monthMatrix pads to a multiple of 7 and includes every day of the month', () => {
    const cells = monthMatrix(2026, 6); // July 2026
    expect(cells.length % 7).toBe(0);
    const days = cells.filter((c) => c !== null);
    expect(days.length).toBe(31);
  });

  it('overlaps detects intersecting ranges and rejects disjoint ones', () => {
    const a = [new Date(2026, 6, 20, 9), new Date(2026, 6, 20, 11)] as const;
    const b = [new Date(2026, 6, 20, 10), new Date(2026, 6, 20, 12)] as const;
    const c = [new Date(2026, 6, 20, 12), new Date(2026, 6, 20, 13)] as const;
    expect(overlaps(a[0], a[1], b[0], b[1])).toBeTrue();
    expect(overlaps(a[0], a[1], c[0], c[1])).toBeFalse();
  });

  it('pluralize picks singular only for exactly 1', () => {
    expect(pluralize(1, 'service')).toBe('service');
    expect(pluralize(0, 'service')).toBe('services');
    expect(pluralize(2, 'service')).toBe('services');
    expect(pluralize(2, 'member', 'members')).toBe('members');
  });
});
