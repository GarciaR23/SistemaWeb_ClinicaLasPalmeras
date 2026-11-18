import { Injectable, signal } from '@angular/core';
import { Documento } from '../models/documento';

@Injectable({ providedIn: 'root' })
export class ServicioDocumentos {
  private readonly _lista = signal<Documento[]>([
    { id: 1, nombre: 'CV_Lucia_Torres.pdf', tamano: '2.4 MB', fecha: '2026-08-18' },
    { id: 2, nombre: 'Titulo_Licenciatura_Enfermeria.pdf', tamano: '1.8 MB', fecha: '2026-08-18' },
    { id: 3, nombre: 'Colegiatura_Certificada_CEP.pdf', tamano: '950 KB', fecha: '2026-08-19' },
  ]);
  readonly lista = this._lista.asReadonly();

  /** Devuelve false si el archivo no es PDF. */
  agregar(archivo: File): boolean {
    if (archivo.type !== 'application/pdf') return false;
    const mb = archivo.size / (1024 * 1024);
    const tamano = mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(archivo.size / 1024)} KB`;
    this._lista.update((l) => [
      ...l,
      {
        id: Date.now(),
        nombre: archivo.name,
        tamano,
        fecha: new Date().toISOString().slice(0, 10),
      },
    ]);
    return true;
  }

  eliminar(id: number): void {
    this._lista.update((l) => l.filter((d) => d.id !== id));
  }
}
