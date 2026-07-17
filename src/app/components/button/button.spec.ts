import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonComponent } from './button';

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ButtonComponent] });
    fixture = TestBed.createComponent(ButtonComponent);
  });

  it('defaults to a primary, medium, enabled button', () => {
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.type).toBe('button');
    expect(button.disabled).toBeFalse();
    expect(button.className).toContain('bg-brand-600');
  });

  it('disables the button while loading and shows a spinner', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBeTrue();
    expect(fixture.nativeElement.querySelector('.animate-spin')).toBeTruthy();
  });

  it('the bare "full" attribute coerces to true via booleanAttribute', () => {
    fixture.componentRef.setInput('full', '');
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.className).toContain('w-full');
  });

  it('applies the danger variant classes', () => {
    fixture.componentRef.setInput('variant', 'danger');
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.className).toContain('bg-red-600');
  });
});
