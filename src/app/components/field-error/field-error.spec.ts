import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { FieldErrorComponent } from './field-error';

@Component({
  imports: [ReactiveFormsModule, FieldErrorComponent],
  template: `<app-field-error [control]="control" />`,
})
class HostComponent {
  control = new FormControl('', [Validators.required, Validators.email]);
}

describe('FieldErrorComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  it('shows nothing before the control is touched or dirty', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });

  it('shows the required message once touched and empty', () => {
    host.control.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('required');
  });

  it('shows the email message for an invalid email', () => {
    host.control.setValue('not-an-email');
    host.control.markAsDirty();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('valid email');
  });

  it('shows nothing once the control becomes valid', () => {
    host.control.setValue('me@example.com');
    host.control.markAsDirty();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });
});
