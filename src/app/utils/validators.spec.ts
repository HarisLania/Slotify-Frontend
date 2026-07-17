import { FormBuilder } from '@angular/forms';

import {
  firstErrorMessage,
  futureDateTimeValidator,
  matchFieldsValidator,
  phoneValidator,
  timeRangeValidator,
} from './validators';

describe('validators', () => {
  const fb = new FormBuilder();

  describe('matchFieldsValidator', () => {
    it('flags the confirming control when the values differ', () => {
      const group = fb.group(
        { password: ['secret123'], confirmPassword: ['different'] },
        { validators: matchFieldsValidator('password', 'confirmPassword') },
      );
      expect(group.controls['confirmPassword'].hasError('mismatch')).toBeTrue();
    });

    it('clears the mismatch error once the values match', () => {
      const group = fb.group(
        { password: ['secret123'], confirmPassword: ['different'] },
        { validators: matchFieldsValidator('password', 'confirmPassword') },
      );
      group.controls['confirmPassword'].setValue('secret123');
      expect(group.controls['confirmPassword'].hasError('mismatch')).toBeFalse();
    });
  });

  describe('phoneValidator', () => {
    it('allows an empty value (optional field)', () => {
      const control = fb.control('');
      expect(phoneValidator(control)).toBeNull();
    });

    it('accepts a well-formed phone number', () => {
      const control = fb.control('+1 (555) 000-0000');
      expect(phoneValidator(control)).toBeNull();
    });

    it('rejects letters', () => {
      const control = fb.control('call-me-maybe');
      expect(phoneValidator(control)).toEqual({ phone: true });
    });
  });

  describe('timeRangeValidator', () => {
    it('flags when end is not after start', () => {
      const group = fb.group(
        { start: ['10:00'], end: ['09:00'] },
        { validators: timeRangeValidator('start', 'end') },
      );
      expect(group.hasError('rangeInvalid')).toBeTrue();
    });

    it('passes when end is after start', () => {
      const group = fb.group(
        { start: ['09:00'], end: ['10:00'] },
        { validators: timeRangeValidator('start', 'end') },
      );
      expect(group.hasError('rangeInvalid')).toBeFalse();
    });
  });

  describe('futureDateTimeValidator', () => {
    it('rejects a date in the past', () => {
      const control = fb.control(new Date(2000, 0, 1).toISOString());
      expect(futureDateTimeValidator(control)).toEqual({ notFuture: true });
    });

    it('accepts a date in the future', () => {
      const future = new Date(Date.now() + 86_400_000).toISOString();
      const control = fb.control(future);
      expect(futureDateTimeValidator(control)).toBeNull();
    });
  });

  describe('firstErrorMessage', () => {
    it('returns null when there are no errors', () => {
      expect(firstErrorMessage(null)).toBeNull();
    });

    it('maps minlength to a friendly message with the required length', () => {
      expect(firstErrorMessage({ minlength: { requiredLength: 8 } })).toContain('8 characters');
    });

    it('falls back to a generic message for unknown keys', () => {
      expect(firstErrorMessage({ somethingWeird: true })).toBe('Invalid value.');
    });
  });
});
