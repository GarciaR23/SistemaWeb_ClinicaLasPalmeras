import { computed, inject, Injectable } from '@angular/core';

import { ApiClient } from '../../../core/services/cliente-api';
import {
  LocalStore,
  nextId,
} from '../../../core/services/almacenamiento-local';
import { claveFecha } from '../../../core/utils/formato';
import { ApplicantsService } from '../../recursos-humanos/services/servicio-postulantes';
import { HealthService } from '../../recursos-humanos/services/servicio-resultados-medicos';
import { environment } from '../../../../environments/environment';
import { CitaAgenda } from '../models/cita-agenda';
import { IndicadorSalud, TrabajoPendiente } from '../models/resumen-salud';
import {
  CONCLUSIONES,
  FilaAptitud,
  RegistroAptitud,
} from '../models/resultado-aptitud';
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
  private readonly store = inject(LocalStore);

  readonly sedes = this.health.sites;
  readonly citas = this.health.appointments;
  readonly aptitudes = this.health.fitness;

  /** Evaluaciones por registrar (con cita) y resultados ya registrados. */
  readonly resultados = computed<FilaAptitud[]>(() => {
    const candidatos = this.applicants.candidates();
    const registrados = this.aptitudes();
    const filas: FilaAptitud[] = [];

    for (const candidato of candidatos) {
      const cita = this.ultimaCita(candidato.id);
      const aptitud = registrados.find(
        (item) => item.applicationId === candidato.id,
      );

      if (aptitud) {
        filas.push({
          applicationId: candidato.id,
          nombre: candidato.name,
          puesto: candidato.role,
          fecha: cita?.date ?? aptitud.registeredAt?.slice(0, 10) ?? '',
          sede: cita?.site ?? '—',
          conclusion: aptitud.conclusion,
          observacion: aptitud.note,
          puedeRegistrar: false,
        });
      } else if (candidato.status === 'Examen médico' && cita) {
        const realizada =
          new Date(`${cita.date}T${cita.time}:00`).getTime() <= Date.now();

        filas.push({
          applicationId: candidato.id,
          nombre: candidato.name,
          puesto: candidato.role,
          fecha: cita.date,
          sede: cita.site ?? '—',
          conclusion: null,
          // En la demostración se puede registrar sin esperar a la fecha de la cita.
          puedeRegistrar: realizada || environment.demoMode,
        });
      }
    }

    // Pendientes primero y, después, lo más reciente.
    return filas.sort(
      (a, b) =>
        Number(a.conclusion !== null) - Number(b.conclusion !== null) ||
        b.fecha.localeCompare(a.fecha),
    );
  });

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

  /** Evaluaciones con cita y sin resultado, indicando si la cita ya ocurrió. */
  private readonly sinResultado = computed(() => {
    const registrados = new Set(
      this.aptitudes().map((item) => item.applicationId),
    );

    return this.applicants
      .candidates()
      .filter(
        (candidato) =>
          candidato.status === 'Examen médico' && !registrados.has(candidato.id),
      )
      .flatMap((candidato) => {
        const cita = this.ultimaCita(candidato.id);

        return cita
          ? [
              {
                candidato,
                vencida:
                  new Date(`${cita.date}T${cita.time}:00`).getTime() <=
                  Date.now(),
              },
            ]
          : [];
      });
  });

  readonly indicadores = computed<IndicadorSalud[]>(() => [
    {
      titulo: 'Solicitudes pendientes',
      valor: this.solicitudes().length,
      icono: 'file',
    },
    {
      titulo: 'Exámenes programados',
      valor: this.sinResultado().filter((item) => !item.vencida).length,
      icono: 'calendar',
    },
    {
      titulo: 'Evaluaciones realizadas',
      valor: this.aptitudes().length,
      icono: 'medical',
    },
    {
      titulo: 'Resultados pendientes',
      valor: this.sinResultado().filter((item) => item.vencida).length,
      icono: 'clock',
    },
  ]);

  /** Solicitudes por programar y evaluaciones realizadas sin conclusión. */
  readonly trabajoPendiente = computed<TrabajoPendiente[]>(() => [
    ...this.solicitudes().map((solicitud) => ({
      id: solicitud.id,
      nombre: solicitud.nombre,
      puesto: solicitud.puesto,
      estado: solicitud.estado,
      ruta: '/salud-ocupacional/solicitudes',
    })),
    ...this.sinResultado()
      .filter((item) => item.vencida)
      .map(({ candidato }) => ({
        id: candidato.id,
        nombre: candidato.name,
        puesto: candidato.role,
        estado: candidato.status,
        ruta: '/salud-ocupacional/resultados',
      })),
  ]);

  async cargar(): Promise<void> {
    await this.applicants.load();
    await this.health.load();

    if (environment.demoMode) this.sembrarResultados();
  }

  async registrarAptitud(datos: RegistroAptitud): Promise<void> {
    if (!CONCLUSIONES.includes(datos.conclusion)) {
      throw new Error('Selecciona una conclusión de aptitud.');
    }

    const nota = datos.note?.trim();

    if (!environment.demoMode) {
      await this.api.request('/salud/aptitud', 'POST', {
        applicationId: datos.applicationId,
        conclusion: datos.conclusion,
        note: nota,
      });
      await this.cargar();
      return;
    }

    const candidato = this.applicants
      .candidates()
      .find((item) => item.id === datos.applicationId);

    if (!candidato) {
      throw new Error('No se encontró el postulante.');
    }

    if (candidato.status !== 'Examen médico') {
      throw new Error(
        'La evaluación debe estar programada antes de registrar la aptitud.',
      );
    }

    if (this.aptitudes().some((item) => item.applicationId === datos.applicationId)) {
      throw new Error('Este postulante ya tiene un resultado registrado.');
    }

    const items = [
      ...this.aptitudes(),
      {
        id: nextId(this.aptitudes()),
        applicationId: datos.applicationId,
        conclusion: datos.conclusion,
        ...(nota ? { note: nota } : {}),
        registeredAt: new Date().toISOString(),
      },
    ];

    this.store.write('fitness', items);
    this.aptitudes.set(items);

    try {
      await this.applicants.status(datos.applicationId, 'Evaluado');
    } catch {
      throw new Error(
        'El resultado se guardó, pero no se pudo actualizar el estado del postulante.',
      );
    }
  }

  private ultimaCita(applicationId: number) {
    return this.citas()
      .filter((cita) => cita.applicationId === applicationId)
      .sort((a, b) =>
        `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`),
      )[0];
  }

  /** Historial base: postulantes ya evaluados o contratados con resultado "Apto". */
  private sembrarResultados(): void {
    if (this.store.read<boolean>('fitness-examples-initialized', false)) return;

    const pendientes = this.applicants
      .candidates()
      .filter(
        (candidato) =>
          (candidato.status === 'Evaluado' ||
            candidato.status === 'Contratado') &&
          !this.aptitudes().some((item) => item.applicationId === candidato.id),
      );

    const dia = new Date();

    dia.setDate(dia.getDate() - 7);

    const citas = [...this.citas()];
    const aptitudes = [...this.aptitudes()];

    for (const candidato of pendientes) {
      if (!citas.some((cita) => cita.applicationId === candidato.id)) {
        citas.push({
          id: nextId(citas),
          applicationId: candidato.id,
          date: claveFecha(dia),
          time: '09:30',
          site: 'San Isidro',
          type: 'Examen pre ocupacional',
        });
      }

      aptitudes.push({
        id: nextId(aptitudes),
        applicationId: candidato.id,
        conclusion: 'Apto',
        registeredAt: dia.toISOString(),
      });
    }

    // Se guarda sin auditoría: es historial de ejemplo, no una acción del usuario.
    this.store.write('medical', citas, false);
    this.store.write('fitness', aptitudes, false);
    this.store.write('fitness-examples-initialized', true, false);

    this.citas.set(citas);
    this.aptitudes.set(aptitudes);
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
