import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { firstErrorMessage } from '../../utils/validators';

/** Shows the first validation error message for a control, but only once it's been touched/dirty. */
@Component({
  selector: 'app-field-error',
  template: `
    @if (message(); as msg) {
      <p class="mt-1 text-sm text-red-600">{{ msg }}</p>
    }
  `,
})
export class FieldErrorComponent {
  readonly control = input.required<AbstractControl | null>();

  protected message(): string | null {
    const control = this.control();
    if (!control || !(control.dirty || control.touched) || control.valid) {
      return null;
    }
    return firstErrorMessage(control.errors);
  }
}
