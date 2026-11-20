import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Icono } from '../../components/icono/icono';
import { ServicioDocumentos } from '../../services/servicio-documentos';
import { ServicioNotificaciones } from '../../services/servicio-notificaciones';
import { Documento } from '../../models/documento';

@Component({
  selector: 'app-mis-documentos',
  imports: [Icono, DatePipe],
  templateUrl: './mis-documentos.html',
  styleUrl: './mis-documentos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MisDocumentos {
  private readonly servicio = inject(ServicioDocumentos);
  private readonly notificaciones = inject(ServicioNotificaciones);

  protected readonly documentos = this.servicio.lista;
  protected readonly arrastrando = signal(false);
  protected readonly error = signal('');
  protected readonly exito = signal('');
  protected readonly documentoSeleccionado = signal<Documento | null>(null);

  protected alSeleccionar(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.procesar(input.files);
    input.value = '';
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

  protected eliminar(id: number, nombre: string): void {
    this.servicio.eliminar(id);
    this.exito.set(`Se eliminó "${nombre}".`);
    setTimeout(() => this.exito.set(''), 3000);
  }

  protected verDocumento(doc: Documento): void {
    this.documentoSeleccionado.set(doc);
  }

  private procesar(archivos: FileList | null): void {
    this.error.set('');
    this.exito.set('');
    let agregados = 0;

    for (const archivo of Array.from(archivos ?? [])) {
      if (this.servicio.agregar(archivo)) {
        agregados++;
        this.notificaciones.agregar(
          'Documento subido',
          `Se ha adjuntado "${archivo.name}" a tu expediente de postulante.`
        );
      } else {
        this.error.set(`"${archivo.name}" no es un PDF. Solo se admiten archivos en formato PDF.`);
      }
    }

    if (agregados > 0) {
      this.exito.set(
        agregados === 1
          ? '¡Documento adjuntado y guardado correctamente!'
          : `¡${agregados} documentos adjuntados con éxito!`
      );
      setTimeout(() => this.exito.set(''), 4000);
    }
  }
}
