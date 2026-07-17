import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ConfirmHostComponent } from './components/confirm-dialog/confirm-host';
import { ToastHostComponent } from './components/toast/toast-host';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastHostComponent, ConfirmHostComponent],
  templateUrl: './app.html',
})
export class App {}
