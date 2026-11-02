import { Injectable, signal } from '@angular/core';
import { Evaluacion } from '../models/evaluacion';

@Injectable({ providedIn: 'root' })
export class ServicioEvaluaciones {
  private readonly _lista = signal<Evaluacion[]>([]);
  readonly lista = this._lista.asReadonly();
}
