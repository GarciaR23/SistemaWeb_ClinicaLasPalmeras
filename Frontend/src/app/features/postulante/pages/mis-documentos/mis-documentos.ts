import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Icono } from '../../components/icono/icono';
import { ServicioDocumentos } from '../../services/servicio-documentos';

@Component({
  selector: 'app-mis-documentos',
  imports: [Icono],
  templateUrl: './mis-documentos.html',
  styleUrl: './mis-documentos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MisDocumentos {
  private readonly servicio = inject(ServicioDocumentos);

  protected readonly documentos = this.servicio.lista;
  protected readonly arrastrando = signal(false);
  protected readonly error = signal('');

  protected alSeleccionar(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.procesar(input.files);
    input.value = ''; // permite volver a elegir el mismo archivo
  }

  protected alSoltar(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastrando.set(false);
    this.procesar(evento.dataTransfer?.files ?? null);
  }

  protected alArrastrar(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastrando.set(true);
  }

  private procesar(archivos: FileList | null): void {
    this.error.set('');
    for (const archivo of Array.from(archivos ?? [])) {
      if (!this.servicio.agregar(archivo)) {
        this.error.set(`"${archivo.name}" no es un PDF. Adjunta archivos en formato PDF.`);
      }
    }
  }
}
