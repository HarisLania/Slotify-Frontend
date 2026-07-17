import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface AppConfig {
  apiBaseUrl: string;
}

/**
 * Loads runtime configuration from `public/config.json` (fetched once at
 * bootstrap via provideAppInitializer). Keeping the backend URL out of the
 * compiled bundle means it can be repointed by editing config.json on the
 * deployed server, with no rebuild required.
 */
@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly http = inject(HttpClient);
  private readonly configSignal = signal<AppConfig | null>(null);

  readonly config = this.configSignal.asReadonly();

  get apiBaseUrl(): string {
    const config = this.configSignal();
    if (!config) {
      throw new Error('ConfigService.load() must resolve before apiBaseUrl is read.');
    }
    return config.apiBaseUrl;
  }

  async load(): Promise<void> {
    const config = await firstValueFrom(this.http.get<AppConfig>(environment.configUrl));
    this.configSignal.set(config);
  }
}
