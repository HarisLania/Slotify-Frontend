import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { LoginInput, LoginResponse, RefreshResponse, RegisterInput, RegisterResponse } from '../models/auth.model';
import { AuthUser } from '../models/user.model';
import { tokenStorage } from './token-storage';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  private readonly currentUserSignal = signal<AuthUser | null>(null);
  private readonly initializedSignal = signal(false);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly initialized = this.initializedSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  readonly isOwner = computed(() => this.currentUserSignal()?.role === 'owner');

  private get baseUrl(): string {
    return `${this.config.apiBaseUrl}/auth`;
  }

  /** Called once from the app initializer: restores the session if a token is already stored. */
  async init(): Promise<void> {
    if (tokenStorage.getAccessToken()) {
      try {
        await this.loadCurrentUser();
      } catch {
        tokenStorage.clear();
      }
    }
    this.initializedSignal.set(true);
  }

  async login(input: LoginInput): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<LoginResponse>(`${this.baseUrl}/login/`, input),
    );
    tokenStorage.setTokens(response.access, response.refresh);
    await this.loadCurrentUser();
  }

  async register(input: RegisterInput): Promise<void> {
    await firstValueFrom(this.http.post<RegisterResponse>(`${this.baseUrl}/register/`, input));
    await this.login({ username: input.username, password: input.password });
  }

  async logout(): Promise<void> {
    tokenStorage.clear();
    this.currentUserSignal.set(null);
  }

  async refreshAccessToken(): Promise<string> {
    const refresh = tokenStorage.getRefreshToken();
    if (!refresh) {
      throw new Error('No refresh token available.');
    }
    const response = await firstValueFrom(
      this.http.post<RefreshResponse>(`${this.baseUrl}/refresh/`, { refresh }),
    );
    tokenStorage.setAccessToken(response.access);
    return response.access;
  }

  async loadCurrentUser(): Promise<void> {
    const user = await firstValueFrom(this.http.get<AuthUser>(`${this.baseUrl}/me/`));
    this.currentUserSignal.set(user);
  }
}
