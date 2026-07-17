import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { RegisterPage } from './register-page';

describe('RegisterPage', () => {
  let fixture: ComponentFixture<RegisterPage>;
  let component: RegisterPage;
  let authSpy: jasmine.SpyObj<Pick<AuthService, 'register'>>;

  beforeEach(() => {
    authSpy = jasmine.createSpyObj('AuthService', ['register']);
    TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [provideRouter([]), { provide: AuthService, useValue: authSpy }],
    });
    fixture = TestBed.createComponent(RegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function fillValidFormExceptPasswords() {
    component['form'].patchValue({
      username: 'alexlee',
      businessName: 'Bloom Salon',
      email: 'alex@example.com',
    });
  }

  it('flags confirmPassword with a mismatch error when passwords differ', () => {
    fillValidFormExceptPasswords();
    component['form'].patchValue({ password: 'secret123', confirmPassword: 'different' });
    expect(component['form'].controls.confirmPassword.hasError('mismatch')).toBeTrue();
    expect(component['form'].invalid).toBeTrue();
  });

  it('does not call register while the form is invalid', async () => {
    await component['submit']();
    expect(authSpy.register).not.toHaveBeenCalled();
  });

  it('registers with the username (not a split full name) and navigates to /onboarding', async () => {
    authSpy.register.and.returnValue(Promise.resolve());
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigateByUrl');

    fillValidFormExceptPasswords();
    component['form'].patchValue({ password: 'secret123', confirmPassword: 'secret123' });
    await component['submit']();

    expect(authSpy.register).toHaveBeenCalledWith({
      username: 'alexlee',
      email: 'alex@example.com',
      password: 'secret123',
      phone: undefined,
      business_name: 'Bloom Salon',
    });
    expect(navigateSpy).toHaveBeenCalledWith('/onboarding');
  });
});
