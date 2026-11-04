import { computed, inject, Injectable } from '@angular/core';

import { ApiClient } from '../../../core/services/cliente-api';
import { ApplicantsService } from '../../recursos-humanos/services/servicio-postulantes';
import { HealthService } from '../../recursos-humanos/services/servicio-resultados-medicos';
import { environment } from '../../../../environments/environment';
import { CitaAgenda } from '../models/cita-agenda';
import {
  ProgramacionExamen,
  SolicitudExamen,
} from '../models/solicitud-examen';

/**
 * Punto único de acceso de Salud Ocupacional. Reutiliza los servicios de
 * postulantes y de salud ya existentes para que RR. HH. y Salud Ocupacional
 * compartan las mismas citas y estados.
 */
@Injectable({
  providedIn: 'root',
})
export class ServicioSaludOcupacional {
  private readonly api = inject(ApiClient);
  private readonly health = inject(HealthService);
  private readonly applicants = inject(ApplicantsService);

  readonly sedes = this.health.sites;
  readonly citas = this.health.appointments;

  readonly solicitudes = computed<SolicitudExamen[]>(() =>
    this.applicants
      .candidates()
      .filter((candidato) => candidato.status === 'Solicitud médica')
      .map((candidato) => ({
        id: candidato.id,
        nombre: candidato.name,
        puesto: candidato.role,
        dni: candidato.dni,
        fecha: candidato.date,
        estado: candidato.status,
      })),
  );

  /** Evaluaciones de un día (AAAA-MM-DD), ordenadas por hora. */
  agendaDelDia(fecha: string): CitaAgenda[] {
    const candidatos = this.applicants.candidates();

    return this.citas()
      .filter((cita) => cita.date === fecha)
      .map((cita) => {
        const candidato = candidatos.find(
          (item) => item.id === cita.applicationId,
        );

        return {
          id: cita.id,
          hora: cita.time,
          sede: cita.site ?? cita.place ?? '—',
          tipo: cita.type ?? 'Evaluación ocupacional',
          nombre: candidato?.name ?? 'Postulante no disponible',
          puesto: candidato?.role ?? '',
        };
      })
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }

  cuposDisponibles(sede: string, fecha: string): number {
    return this.horariosDisponibles(sede, fecha).length;
  }

  async cargar(): Promise<void> {
    await this.applicants.load();
    await this.health.load();
  }

  horariosDisponibles(sede: string, fecha: string): string[] {
    return this.health.availableSlots(sede, fecha);
  }

  async programar(datos: ProgramacionExamen): Promise<void> {
    if (!datos.sede || !datos.fecha || !datos.hora || !datos.tipo) {
      throw new Error('Completa sede, fecha, hora y tipo de examen.');
    }

    if (!environment.demoMode) {
      await this.api.request('/salud/citas', 'POST', datos);
      await this.cargar();
      return;
    }

    await this.health.schedule(
      datos.applicationId,
      datos.fecha,
      datos.hora,
      datos.sede,
      datos.tipo,
    );
  }
}
