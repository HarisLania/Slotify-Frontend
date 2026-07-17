import { Component, inject } from '@angular/core';

import { ButtonComponent } from '../button/button';
import { ConfirmService } from './confirm.service';

@Component({
  selector: 'app-confirm-host',
  imports: [ButtonComponent],
  template: `
    @if (confirmService.pending(); as request) {
      <div class="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 p-4">
        <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
          <h2 class="text-lg font-bold text-slate-900">{{ request.title }}</h2>
          <p class="mt-2 text-sm text-slate-600">{{ request.message }}</p>
          <div class="mt-6 flex justify-end gap-3">
            <app-button variant="outline" (click)="confirmService.respond(false)">Cancel</app-button>
            <app-button [variant]="request.danger ? 'danger' : 'primary'" (click)="confirmService.respond(true)">
              {{ request.confirmLabel }}
            </app-button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmHostComponent {
  protected readonly confirmService = inject(ConfirmService);
}
