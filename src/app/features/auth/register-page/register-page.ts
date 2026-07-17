import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ButtonComponent } from '../../../components/button/button';
import { FieldErrorComponent } from '../../../components/field-error/field-error';
import { ToastService } from '../../../components/toast/toast.service';
import { AuthService } from '../../../core/auth/auth.service';
import { matchFieldsValidator, phoneValidator } from '../../../utils/validators';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, FieldErrorComponent],
  templateUrl: './register-page.html',
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly submitting = signal(false);

  protected readonly form = this.fb.nonNullable.group(
    {
      username: ['', [Validators.required, Validators.pattern(/^[\w.@+-]+$/), Validators.maxLength(150)]],
      businessName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [phoneValidator]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: matchFieldsValidator('password', 'confirmPassword') },
  );

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    try {
      const { username, businessName, email, phone, password } = this.form.getRawValue();
      await this.auth.register({
        username,
        email,
        password,
        phone: phone || undefined,
        business_name: businessName,
      });
      await this.router.navigateByUrl('/onboarding');
    } catch {
      this.toast.error('Could not create your account. That username or email may already be taken.');
    } finally {
      this.submitting.set(false);
    }
  }
}
