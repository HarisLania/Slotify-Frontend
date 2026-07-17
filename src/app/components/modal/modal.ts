import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" (click)="close.emit()">
        <div
          class="w-full rounded-2xl bg-white p-6 shadow-xl"
          [class]="widthClass()"
          (click)="$event.stopPropagation()"
        >
          <div class="mb-4 flex items-start justify-between">
            <h2 class="text-lg font-bold text-slate-900">{{ title() }}</h2>
            <button
              type="button"
              class="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close"
              (click)="close.emit()"
            >
              ✕
            </button>
          </div>
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  readonly open = input(false);
  readonly title = input('');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly close = output<void>();

  protected widthClass(): string {
    return { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }[this.size()];
  }
}
