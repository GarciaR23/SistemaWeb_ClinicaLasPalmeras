import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { EstadoVacio } from '../../components/estado-vacio/estado-vacio';
import { Icono } from '../../components/icono/icono';
import { ServicioPostulaciones } from '../../services/servicio-postulaciones';
import { ServicioVacantes } from '../../services/servicio-vacantes';

@Component({
  selector: 'app-detalle-vacante',
  imports: [RouterLink, DatePipe, Icono, EstadoVacio],
  templateUrl: './detalle-vacante.html',
  styleUrl: './detalle-vacante.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleVacante {
  private readonly servicioVacantes = inject(ServicioVacantes);
  private readonly servicioPostulaciones = inject(ServicioPostulaciones);

  private readonly id = toSignal(inject(ActivatedRoute).paramMap.pipe(map((p) => Number(p.get('id')))), { initialValue: 0 });

  protected readonly vacante = computed(() => this.servicioVacantes.obtener(this.id()));
  protected readonly yaPostulado = computed(() => this.servicioPostulaciones.yaPostulo(this.id()));

  protected postular(): void {
    const v = this.vacante();
    if (v) this.servicioPostulaciones.postular(v);
  }
}
