import { Injectable, computed, inject } from '@angular/core';
import { ResumenInicio } from '../models/resumen-inicio';
import { ServicioEntrevistas } from './servicio-entrevistas';
import { ServicioEvaluaciones } from './servicio-evaluaciones';
import { ServicioNotificaciones } from './servicio-notificaciones';
import { ServicioPostulaciones } from './servicio-postulaciones';
import { ServicioVacantes } from './servicio-vacantes';

@Injectable({ providedIn: 'root' })
export class ServicioInicio {
  private readonly vacantes = inject(ServicioVacantes);
  private readonly postulaciones = inject(ServicioPostulaciones);
  private readonly entrevistas = inject(ServicioEntrevistas);
  private readonly evaluaciones = inject(ServicioEvaluaciones);
  private readonly notificaciones = inject(ServicioNotificaciones);

  readonly resumen = computed<ResumenInicio>(() => ({
    postulacionesActivas: this.postulaciones.lista().length,
    proximosEventos: this.entrevistas.lista().length + this.evaluaciones.lista().length,
    vacantesDisponibles: this.vacantes.lista().length,
    notificaciones: this.notificaciones.noLeidas(),
  }));

  readonly procesoActual = computed(() => this.postulaciones.lista()[0] ?? null);
  readonly recomendadas = computed(() => this.vacantes.lista().slice(0, 3));
}
