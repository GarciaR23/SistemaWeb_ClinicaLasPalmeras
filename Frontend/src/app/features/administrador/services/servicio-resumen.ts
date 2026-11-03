import { inject, Injectable } from '@angular/core';

import { ApiClient } from '../../../core/services/cliente-api';
import { ROLE_LABELS } from '../../../core/services/modelos-sesion';
import { ApplicantsService } from '../../recursos-humanos/services/servicio-postulantes';
import { VacanciesService } from '../../recursos-humanos/services/servicio-vacantes';
import { environment } from '../../../../environments/environment';
import {
  EstadoServicio,
  ResumenAdministrador,
} from '../models/resumen-administrador';
import { ServicioUsuarios } from './servicio-usuarios';

@Injectable({
  providedIn: 'root',
})
export class ServicioResumenAdministrador {
  private readonly api = inject(ApiClient);
  private readonly usuarios = inject(ServicioUsuarios);
  private readonly vacantes = inject(VacanciesService);
  private readonly postulantes = inject(ApplicantsService);

  async obtenerResumen(): Promise<ResumenAdministrador> {
    if (!environment.demoMode) {
      return this.api.request<ResumenAdministrador>(
        '/administrador/resumen',
      );
    }

    await this.usuarios.cargar();

    const procesosActivos = this.postulantes
      .candidates()
      .filter(
        (candidato) =>
          candidato.status !== 'Contratado' &&
          candidato.status !== 'Rechazado',
      ).length;

    return {
      indicadores: [
        {
          titulo: 'Usuarios activos',
          valor: this.usuarios.usuarios().filter((u) => u.active).length,
          icono: 'user',
        },
        {
          titulo: 'Roles configurados',
          valor: Object.keys(ROLE_LABELS).length,
          icono: 'settings',
        },
        {
          titulo: 'Vacantes publicadas',
          valor: this.vacantes
            .vacancies()
            .filter((vacante) => vacante.status === 'Publicada').length,
          icono: 'briefcase',
        },
        {
          titulo: 'Procesos activos',
          valor: procesosActivos,
          icono: 'chart',
        },
      ],
      servicios: [
        { nombre: 'Autenticación', estado: 'Operativo' },
        { nombre: 'Notificaciones', estado: 'Operativo' },
        { nombre: 'Agenda compartida', estado: 'Operativo' },
        {
          nombre: 'Persistencia local',
          estado: this.persistenciaLocal(),
        },
      ],
    };
  }

  private persistenciaLocal(): EstadoServicio {
    try {
      const clave = 'palmeras.login-rrhh.sondeo';

      localStorage.setItem(clave, '1');
      localStorage.removeItem(clave);

      return 'Operativo';
    } catch {
      return 'Con fallas';
    }
  }
}
