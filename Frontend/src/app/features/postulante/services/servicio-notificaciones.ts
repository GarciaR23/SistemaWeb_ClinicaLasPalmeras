import { Injectable, computed, signal } from '@angular/core';
import { Notificacion } from '../models/notificacion';

@Injectable({ providedIn: 'root' })
export class ServicioNotificaciones {
  private readonly _lista = signal<Notificacion[]>([
    { id: 1, titulo: 'Postulación recibida', mensaje: 'Recibimos tu postulación a Enfermera Jefe.', fecha: '2026-08-18', leida: false },
    { id: 2, titulo: 'Postulación en revisión', mensaje: 'El área de Recursos Humanos está revisando tu perfil.', fecha: '2026-08-19', leida: false },
  ]);
  readonly lista = this._lista.asReadonly();
  readonly noLeidas = computed(() => this._lista().filter((n) => !n.leida).length);
  readonly hayNoLeidas = computed(() => this.noLeidas() > 0);

  marcarLeida(id: number): void {
    this._lista.update((l) => l.map((n) => (n.id === id ? { ...n, leida: true } : n)));
  }

  marcarTodas(): void {
    this._lista.update((l) => l.map((n) => ({ ...n, leida: true })));
  }
}
