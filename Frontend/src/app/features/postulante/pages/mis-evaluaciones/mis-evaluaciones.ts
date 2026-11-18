import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { EstadoVacio } from '../../components/estado-vacio/estado-vacio';
import { Icono } from '../../components/icono/icono';
import { ServicioEvaluaciones } from '../../services/servicio-evaluaciones';
import { Evaluacion } from '../../models/evaluacion';

@Component({
  selector: 'app-mis-evaluaciones',
  imports: [DatePipe, EstadoVacio, Icono],
  templateUrl: './mis-evaluaciones.html',
  styleUrl: './mis-evaluaciones.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MisEvaluaciones {
  protected readonly evaluaciones = inject(ServicioEvaluaciones).lista;
  protected readonly descargandoId = signal<number | null>(null);

  protected descargarOrden(ev: Evaluacion): void {
    this.descargandoId.set(ev.id);
    setTimeout(() => {
      this.descargandoId.set(null);
    }, 2000);
  }
}
