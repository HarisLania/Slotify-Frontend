import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ConfigService } from '../core/config/config.service';
import { Business, BusinessUpdate } from '../core/models/business.model';

@Injectable({ providedIn: 'root' })
export class BusinessService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  // Cached so the dashboard shell and its child pages don't each re-fetch the same profile.
  private readonly cachedBusiness = signal<Business | null>(null);
  readonly business = this.cachedBusiness.asReadonly();

  private get url(): string {
    return `${this.config.apiBaseUrl}/business/`;
  }

  async getBusiness(forceRefresh = false): Promise<Business> {
    if (!forceRefresh && this.cachedBusiness()) {
      return this.cachedBusiness()!;
    }
    const business = await firstValueFrom(this.http.get<Business>(this.url));
    this.cachedBusiness.set(business);
    return business;
  }

  async updateBusiness(update: BusinessUpdate): Promise<Business> {
    const business = await firstValueFrom(this.http.patch<Business>(this.url, update));
    this.cachedBusiness.set(business);
    return business;
  }
}
