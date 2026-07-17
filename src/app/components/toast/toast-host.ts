import { Component, inject } from '@angular/core';

import { ToastService } from './toast.service';

const KIND_CLASSES: Record<string, string> = {
  success: 'bg-emerald-600',
  error: 'bg-red-600',
  info: 'bg-slate-800',
};

@Component({
  selector: 'app-toast-host',
  template: `
    <div class="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg"
          [class]="KIND_CLASSES[toast.kind]"
        >
          {{ toast.message }}
          <button type="button" class="opacity-70 hover:opacity-100" (click)="toastService.dismiss(toast.id)">
            ✕
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastHostComponent {
  protected readonly toastService = inject(ToastService);
  protected readonly KIND_CLASSES = KIND_CLASSES;
}
