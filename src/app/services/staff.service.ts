import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ConfigService } from '../core/config/config.service';
import { Paginated, unwrapList } from '../core/models/pagination.model';
import { StaffCreateInput, StaffMember, StaffUpdateInput } from '../core/models/staff.model';
import { TimeOff, TimeOffInput } from '../core/models/time-off.model';
import { WorkingHours, WorkingHoursInput } from '../core/models/working-hours.model';

@Injectable({ providedIn: 'root' })
export class StaffService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  private get url(): string {
    return `${this.config.apiBaseUrl}/staff/`;
  }

  async list(): Promise<StaffMember[]> {
    const response = await firstValueFrom(
      this.http.get<Paginated<StaffMember> | StaffMember[]>(this.url),
    );
    return unwrapList(response);
  }

  get(id: number): Promise<StaffMember> {
    return firstValueFrom(this.http.get<StaffMember>(`${this.url}${id}/`));
  }

  create(input: StaffCreateInput): Promise<StaffMember> {
    return firstValueFrom(this.http.post<StaffMember>(this.url, input));
  }

  update(id: number, input: StaffUpdateInput): Promise<StaffMember> {
    return firstValueFrom(this.http.patch<StaffMember>(`${this.url}${id}/`, input));
  }

  delete(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.url}${id}/`));
  }

  async listWorkingHours(staffId: number): Promise<WorkingHours[]> {
    const response = await firstValueFrom(
      this.http.get<Paginated<WorkingHours> | WorkingHours[]>(
        `${this.url}${staffId}/working-hours/`,
      ),
    );
    return unwrapList(response);
  }

  setWorkingHours(staffId: number, input: WorkingHoursInput): Promise<WorkingHours> {
    return firstValueFrom(
      this.http.post<WorkingHours>(`${this.url}${staffId}/working-hours/`, input),
    );
  }

  async listTimeOff(staffId: number): Promise<TimeOff[]> {
    const response = await firstValueFrom(
      this.http.get<Paginated<TimeOff> | TimeOff[]>(`${this.url}${staffId}/time-off/`),
    );
    return unwrapList(response);
  }

  addTimeOff(staffId: number, input: TimeOffInput): Promise<TimeOff> {
    return firstValueFrom(this.http.post<TimeOff>(`${this.url}${staffId}/time-off/`, input));
  }
}
