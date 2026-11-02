import { Injectable, signal } from '@angular/core';
import { Entrevista } from '../models/entrevista';

@Injectable({ providedIn: 'root' })
export class ServicioEntrevistas {
  private readonly _lista = signal<Entrevista[]>([]);
  readonly lista = this._lista.asReadonly();
}
