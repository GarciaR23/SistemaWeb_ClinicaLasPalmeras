import { Injectable, signal } from '@angular/core';
import { Documento } from '../models/documento';

@Injectable({ providedIn: 'root' })
export class ServicioDocumentos {
  private readonly _lista = signal<Documento[]>([{ id: 1, nombre: 'CV_Lucia_Torres.pdf' }]);
  readonly lista = this._lista.asReadonly();

  /** Devuelve false si el archivo no es PDF. */
  agregar(archivo: File): boolean {
    if (archivo.type !== 'application/pdf') return false;
    this._lista.update((l) => [...l, { id: Date.now(), nombre: archivo.name }]);
    return true;
  }
}
