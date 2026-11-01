import { inject, Injectable, signal } from '@angular/core';
import { LocalStore } from '../../../core/services/almacenamiento-local';
import { Session } from '../../../core/services/sesion';
import { ApiClient } from '../../../core/services/cliente-api';
import { environment } from '../../../../environments/environment';
export interface Preferences {
  theme: 'light' | 'dark';
  textSize: 'normal' | 'large';
  highContrast: boolean;
  interview: boolean;
  exam: boolean;
  candidate: boolean;
}
@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private store = inject(LocalStore);
  private session = inject(Session);
  private api = inject(ApiClient);
  readonly preferences = signal<Preferences>({
    theme: 'light',
    textSize: 'normal',
    highContrast: false,
    interview: true,
    exam: true,
    candidate: false,
  });
  async load() {
    this.preferences.set(
      environment.demoMode
        ? this.store.read('preferences.' + this.session.user()?.email, {
            theme: 'light',
            textSize: 'normal',
            highContrast: false,
            interview: true,
            exam: true,
            candidate: false,
          })
        : await this.api.request<Preferences>('/cuenta/preferencias'),
    );
  }
  async save(value: Preferences) {
    if (!environment.demoMode) await this.api.request('/cuenta/preferencias', 'PUT', value);
    else this.store.write('preferences.' + this.session.user()?.email, value);
    this.preferences.set({ ...value });
  }
}
