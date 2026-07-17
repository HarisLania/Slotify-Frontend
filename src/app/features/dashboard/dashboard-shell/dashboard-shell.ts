import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AvatarComponent } from '../../../components/avatar/avatar';
import { AuthService } from '../../../core/auth/auth.service';
import { Business } from '../../../core/models/business.model';
import { BusinessService } from '../../../services/business.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AvatarComponent],
  templateUrl: './dashboard-shell.html',
})
export class DashboardShell {
  private readonly businessService = inject(BusinessService);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  protected readonly business = signal<Business | null>(null);

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', path: 'overview', icon: '🏠' },
    { label: 'Bookings', path: 'bookings', icon: '📅' },
    { label: 'Services', path: 'services', icon: '🕒' },
    { label: 'Staff', path: 'staff', icon: '👥' },
    { label: 'Availability', path: 'availability', icon: '🗓️' },
  ];

  constructor() {
    this.businessService.getBusiness().then((business) => this.business.set(business));
  }

  protected async signOut(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/login');
  }
}
