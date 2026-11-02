import { Injectable, signal } from '@angular/core';
import { Vacante } from '../models/vacante';
import { VACANTES_DEMOSTRACION } from '../models/vacantes-demostracion';

@Injectable({ providedIn: 'root' })
export class ServicioVacantes {
  private readonly _lista = signal<Vacante[]>(VACANTES_DEMOSTRACION);
  readonly lista = this._lista.asReadonly();

  obtener(id: number): Vacante | undefined {
    return this._lista().find((v) => v.id === id);
  }
}
