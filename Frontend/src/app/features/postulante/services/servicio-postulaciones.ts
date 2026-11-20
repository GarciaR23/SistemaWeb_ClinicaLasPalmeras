import { Injectable, inject, signal } from '@angular/core';
import { Postulacion } from '../models/postulacion';
import { POSTULACIONES_DEMOSTRACION } from '../models/postulaciones-demostracion';
import { Vacante } from '../models/vacante';
import { ServicioNotificaciones } from './servicio-notificaciones';

@Injectable({ providedIn: 'root' })
export class ServicioPostulaciones {
  private readonly notificaciones = inject(ServicioNotificaciones);
  private readonly _lista = signal<Postulacion[]>(POSTULACIONES_DEMOSTRACION);
  readonly lista = this._lista.asReadonly();

  yaPostulo(vacanteId: number): boolean {
    return this._lista().some((p) => p.vacanteId === vacanteId);
  }

  postular(vacante: Vacante): void {
    if (this.yaPostulo(vacante.id)) return;
    const nueva: Postulacion = {
      id: Date.now(),
      vacanteId: vacante.id,
      puesto: vacante.titulo,
      area: vacante.area,
      fechaEnvio: new Date().toISOString().slice(0, 10),
      etapaActual: 0,
    };
    this._lista.update((lista) => [nueva, ...lista]);
    this.notificaciones.agregar(
      'Postulación registrada',
      `Tu postulación al puesto de ${vacante.titulo} ha sido recibida con éxito.`
    );
  }
}
