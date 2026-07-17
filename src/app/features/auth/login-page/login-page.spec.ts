import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { LoginPage } from './login-page';

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let component: LoginPage;
  let authSpy: jasmine.SpyObj<Pick<AuthService, 'login'>>;

  beforeEach(() => {
    authSpy = jasmine.createSpyObj('AuthService', ['login']);
    TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideRouter([]), { provide: AuthService, useValue: authSpy }],
    });
    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not call login and marks fields touched when the form is invalid', async () => {
    await component['submit']();
    expect(authSpy.login).not.toHaveBeenCalled();
    expect(component['form'].controls.username.touched).toBeTrue();
  });

  it('calls AuthService.login and navigates to /dashboard on success', async () => {
    authSpy.login.and.returnValue(Promise.resolve());
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigateByUrl');

    component['form'].setValue({ username: 'alex', password: 'secret123' });
    await component['submit']();

    expect(authSpy.login).toHaveBeenCalledWith({ username: 'alex', password: 'secret123' });
    expect(navigateSpy).toHaveBeenCalledWith('/dashboard');
  });

  it('surfaces a toast and stays on the page when login rejects', async () => {
    authSpy.login.and.returnValue(Promise.reject(new Error('bad credentials')));
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigateByUrl');

    component['form'].setValue({ username: 'alex', password: 'wrong' });
    await component['submit']();

    expect(navigateSpy).not.toHaveBeenCalled();
    expect(component['submitting']()).toBeFalse();
  });
});
