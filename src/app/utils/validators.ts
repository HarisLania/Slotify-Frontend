import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Cross-field validator: flags `mismatchControlName` with `mismatch` when it differs from `controlName`. */
export function matchFieldsValidator(controlName: string, mismatchControlName: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const control = group.get(controlName);
    const mismatchControl = group.get(mismatchControlName);
    if (!control || !mismatchControl) {
      return null;
    }
    if (mismatchControl.value && mismatchControl.value !== control.value) {
      mismatchControl.setErrors({ ...mismatchControl.errors, mismatch: true });
    } else if (mismatchControl.hasError('mismatch')) {
      const { mismatch, ...rest } = mismatchControl.errors ?? {};
      mismatchControl.setErrors(Object.keys(rest).length ? rest : null);
    }
    return null;
  };
}

/** Loose international-friendly phone check — digits, spaces, +, -, () only, 7-20 chars. */
export function phoneValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  const pattern = /^[+\d][\d\s\-().]{6,19}$/;
  return pattern.test(control.value) ? null : { phone: true };
}

/** Ensures a Working Hours / Time Off range's end is strictly after its start. */
export function timeRangeValidator(startControlName: string, endControlName: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = group.get(startControlName)?.value;
    const end = group.get(endControlName)?.value;
    if (!start || !end) {
      return null;
    }
    return end > start ? null : { rangeInvalid: true };
  };
}

/** Time off blocks and new bookings must start in the future. */
export function futureDateTimeValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  const value = new Date(control.value);
  return value.getTime() > Date.now() ? null : { notFuture: true };
}

/** Maps validator keys to user-facing messages for the shared field-error component. */
export const VALIDATION_MESSAGES: Record<string, string> = {
  required: 'This field is required.',
  email: 'Enter a valid email address.',
  minlength: 'Too short.',
  maxlength: 'Too long.',
  mismatch: "Passwords don't match.",
  phone: 'Enter a valid phone number.',
  rangeInvalid: 'End time must be after the start time.',
  notFuture: 'Pick a time in the future.',
};

export function firstErrorMessage(errors: ValidationErrors | null): string | null {
  if (!errors) {
    return null;
  }
  const key = Object.keys(errors)[0];
  if (key === 'minlength') {
    return `Must be at least ${errors['minlength'].requiredLength} characters.`;
  }
  if (key === 'maxlength') {
    return `Must be at most ${errors['maxlength'].requiredLength} characters.`;
  }
  return VALIDATION_MESSAGES[key] ?? 'Invalid value.';
}

export function isFormGroup(control: AbstractControl | null): control is FormGroup {
  return control instanceof FormGroup;
}
