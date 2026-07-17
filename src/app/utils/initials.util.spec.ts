import { colorOf, initialsOf } from './initials.util';

describe('initials.util', () => {
  it('takes the first and last initial for multi-word names', () => {
    expect(initialsOf('Sarah Chen')).toBe('SC');
  });

  it('takes the first two letters for a single-word name', () => {
    expect(initialsOf('Cher')).toBe('CH');
  });

  it('handles empty input', () => {
    expect(initialsOf('')).toBe('?');
  });

  it('colorOf is deterministic for the same name', () => {
    expect(colorOf('Sarah Chen')).toBe(colorOf('Sarah Chen'));
  });
});
