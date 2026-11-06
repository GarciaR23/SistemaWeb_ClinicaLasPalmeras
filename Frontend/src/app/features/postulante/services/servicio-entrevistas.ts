import { Injectable, signal } from '@angular/core';
import { Entrevista } from '../models/entrevista';

@Injectable({ providedIn: 'root' })
export class ServicioEntrevistas {
  private readonly _lista = signal<Entrevista[]>([
    {
      id: 1,
      puesto: 'Auxiliar de Enfermería',
      fecha: '2026-11-09',
      hora: '10:00',
      modalidad: 'Presencial',
      lugar: 'Sede Central - Sala de entrevistas 3',
    },
    {
      id: 2,
      puesto: 'Recepcionista',
      fecha: '2026-11-16',
      hora: '15:30',
      modalidad: 'Virtual',
      lugar: 'Enlace de videollamada por correo institucional',
    },
  ]);
  readonly lista = this._lista.asReadonly();
}
