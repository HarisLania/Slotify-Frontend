import { Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  template: `
    <div class="flex items-center justify-center py-10" role="status" aria-label="Loading">
      <span
        class="inline-block animate-spin rounded-full border-4 border-slate-200 border-t-brand-600"
        [style.width.px]="size()"
        [style.height.px]="size()"
      ></span>
    </div>
  `,
})
export class SpinnerComponent {
  readonly size = input(32);
}
