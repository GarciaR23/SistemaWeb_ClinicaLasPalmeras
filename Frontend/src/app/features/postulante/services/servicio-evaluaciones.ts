import { Injectable, signal } from '@angular/core';
import { Evaluacion } from '../models/evaluacion';

@Injectable({ providedIn: 'root' })
export class ServicioEvaluaciones {
  private readonly _lista = signal<Evaluacion[]>([
    {
      id: 1,
      tipo: 'Evaluación médica prelaboral',
      fecha: '2026-11-12',
      hora: '09:30',
      sede: 'Sede Central - Consultorio 2',
      indicaciones: 'Presentarse 15 minutos antes. Llevar DNI y botella de agua.',
    },
    {
      id: 2,
      tipo: 'Examen de aptitud ocupacional',
      fecha: '2026-11-20',
      hora: '11:00',
      sede: 'Sede Norte - Salud Ocupacional',
      indicaciones: 'Acudir en ayunas y portar la orden emitida por el área de selección.',
    },
  ]);
  readonly lista = this._lista.asReadonly();
}
