import { Component, input } from '@angular/core';

import { colorOf, initialsOf } from '../../utils/initials.util';

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
};

@Component({
  selector: 'app-avatar',
  template: `
    <span
      class="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      [class]="sizeClass()"
      [style.backgroundColor]="colorOf(name())"
    >
      {{ initialsOf(name()) }}
    </span>
  `,
})
export class AvatarComponent {
  readonly name = input.required<string>();
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  protected readonly initialsOf = initialsOf;
  protected readonly colorOf = colorOf;

  protected sizeClass(): string {
    return SIZE_CLASSES[this.size()];
  }
}
