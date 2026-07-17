import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ConfigService } from '../core/config/config.service';
import { Paginated, unwrapList } from '../core/models/pagination.model';
import { Service, ServiceInput } from '../core/models/service.model';

@Injectable({ providedIn: 'root' })
export class ServicesService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  private get url(): string {
    return `${this.config.apiBaseUrl}/services/`;
  }

  async list(): Promise<Service[]> {
    const response = await firstValueFrom(
      this.http.get<Paginated<Service> | Service[]>(this.url),
    );
    return unwrapList(response);
  }

  get(id: number): Promise<Service> {
    return firstValueFrom(this.http.get<Service>(`${this.url}${id}/`));
  }

  create(input: ServiceInput): Promise<Service> {
    return firstValueFrom(this.http.post<Service>(this.url, input));
  }

  update(id: number, input: Partial<ServiceInput>): Promise<Service> {
    return firstValueFrom(this.http.patch<Service>(`${this.url}${id}/`, input));
  }

  delete(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.url}${id}/`));
  }
}
