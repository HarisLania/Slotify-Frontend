import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stepper',
  template: `
    <div>
      <div class="flex gap-2">
        @for (step of steps(); track step; let i = $index) {
          <div
            class="h-1.5 flex-1 rounded-full"
            [class]="i <= activeIndex() ? 'bg-brand-600' : 'bg-slate-200'"
          ></div>
        }
      </div>
      <div class="mt-2 flex gap-2">
        @for (step of steps(); track step; let i = $index) {
          <span class="flex-1 text-center text-xs font-medium" [class]="i === activeIndex() ? 'text-brand-600' : 'text-slate-400'">
            {{ step }}
          </span>
        }
      </div>
    </div>
  `,
})
export class StepperComponent {
  readonly steps = input.required<string[]>();
  readonly activeIndex = input.required<number>();
}
