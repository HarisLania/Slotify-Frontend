import { Injectable, signal } from '@angular/core';

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel: string;
  danger: boolean;
}

interface PendingConfirm extends ConfirmRequest {
  resolve: (result: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly pendingSignal = signal<PendingConfirm | null>(null);
  readonly pending = this.pendingSignal.asReadonly();

  ask(options: Partial<ConfirmRequest> & { message: string }): Promise<boolean> {
    return new Promise((resolve) => {
      this.pendingSignal.set({
        title: options.title ?? 'Are you sure?',
        message: options.message,
        confirmLabel: options.confirmLabel ?? 'Confirm',
        danger: options.danger ?? false,
        resolve,
      });
    });
  }

  respond(result: boolean): void {
    this.pendingSignal()?.resolve(result);
    this.pendingSignal.set(null);
  }
}
