import { inject, Injectable } from '@angular/core';
import { LocalStore, nextId } from './almacenamiento-local';
import { ApiClient } from './cliente-api';
import { Session } from './sesion';
import { environment } from '../../../environments/environment';

export interface PortalNotification {
  id: number;
  email?: string;
  title?: string;
  message?: string;
  mensaje?: string;
}

@Injectable({ providedIn: 'root' })
export class Notifications {
  private store = inject(LocalStore);
  private session = inject(Session);
  private api = inject(ApiClient);
  add(email: string, title: string, message: string) {
    if (!environment.demoMode) return;
    const entries = this.store.read<PortalNotification[]>('notifications', []);
    this.store.write(
      'notifications',
      [{ id: nextId(entries), email, title, message }, ...entries].slice(0, 200),
    );
  }
  async load(): Promise<PortalNotification[]> {
    return environment.demoMode
      ? this.store
          .read<PortalNotification[]>('notifications', [])
          .filter((n) => n.email === this.session.user()?.email)
      : this.api.request<PortalNotification[]>('/notificaciones');
  }
}
