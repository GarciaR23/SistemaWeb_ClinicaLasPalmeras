import { inject, Injectable, signal } from '@angular/core';

import {
  LocalStore,
  nextId,
} from '../../../core/services/almacenamiento-local';
import { ApiClient } from '../../../core/services/cliente-api';
import { ApplicantsService } from './servicio-postulantes';
import { environment } from '../../../../environments/environment';

import {
  Appointment,
  InterviewEvaluation,
} from '../models/entrevista';

@Injectable({ providedIn: 'root' })
export class InterviewsService {
  private readonly store = inject(LocalStore);
  private readonly api = inject(ApiClient);
  private readonly applicants = inject(ApplicantsService);

  readonly appointments = signal<Appointment[]>(
    environment.demoMode
      ? this.store.read<Appointment[]>('interviews', [])
      : [],
  );

  readonly evaluations = signal<InterviewEvaluation[]>(
    environment.demoMode
      ? this.store.read<InterviewEvaluation[]>('evaluations', [])
      : [],
  );

  async load(): Promise<void> {
    if (!environment.demoMode) {
      const [appointments, evaluations] = await Promise.all([
        this.api.request<Appointment[]>('/entrevistas'),
        this.api.request<InterviewEvaluation[]>(
          '/evaluaciones-entrevista',
        ),
      ]);

      this.appointments.set(appointments);
      this.evaluations.set(evaluations);
    }
  }

  cargarEjemplos(): void {
    if (!environment.demoMode) return;

    const initialized = this.store.read<boolean>(
      'interviews-demo-initialized',
      false,
    );

    if (initialized) return;

    // Conserva cualquier agenda existente.
    if (this.appointments().length > 0) {
      this.store.write('interviews-demo-initialized', true);
      return;
    }

    const candidates = this.applicants
      .candidates()
      .filter((candidate) =>
        ['Entrevista', 'Preseleccionado'].includes(candidate.status),
      )
      .slice(0, 3);

    if (!candidates.length) return;

    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    const times = ['09:00', '11:30', '15:00'];
    const places = [
      'Sala de entrevistas · San Isidro',
      'Oficina de RR. HH. · Miraflores',
      'Sala de reuniones · La Molina',
    ];

    const examples: Appointment[] = candidates.map(
      (candidate, index) => {
        const date = new Date(`${today}T12:00:00Z`);
        date.setUTCDate(date.getUTCDate() + index + 1);

        return {
          id: index + 1,
          applicationId: candidate.id,
          date: date.toISOString().slice(0, 10),
          time: times[index]!,
          place: places[index]!,
        };
      },
    );

    this.store.write('interviews', examples);
    this.appointments.set(examples);
    this.store.write('interviews-demo-initialized', true);
  }

  async schedule(
    applicationId: number,
    date: string,
    time: string,
    place: string,
  ): Promise<void> {
    const location = place.trim();

    if (!date || !time || !location) {
      throw new Error('Completa la fecha, hora y lugar.');
    }

    if (!environment.demoMode) {
      await this.api.request('/entrevistas', 'POST', {
        applicationId,
        date,
        time,
        place: location,
      });

      await this.load();
      await this.applicants.load();
      return;
    }

    const conflict = this.appointments().some(
      (appointment) =>
        appointment.date === date &&
        appointment.time === time &&
        appointment.place?.trim().toLowerCase() ===
          location.toLowerCase() &&
        appointment.applicationId !== applicationId,
    );

    if (conflict) {
      throw new Error(
        'Ese horario ya está reservado en esta sala.',
      );
    }

    const previous = this.appointments().find(
      (appointment) =>
        appointment.applicationId === applicationId,
    );

    const appointment: Appointment = {
      id: previous?.id ?? nextId(this.appointments()),
      applicationId,
      date,
      time,
      place: location,
    };

    const items = [
      ...this.appointments().filter(
        (item) => item.applicationId !== applicationId,
      ),
      appointment,
    ];

    this.store.write('interviews', items);
    this.appointments.set(items);

    await this.applicants.status(applicationId, 'Entrevista');
  }

  async evaluate(
    applicationId: number,
    result: string,
    score: number,
    notes: string,
  ): Promise<void> {
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      throw new Error('El puntaje debe estar entre 0 y 100.');
    }

    if (!environment.demoMode) {
      await this.api.request(
        `/postulaciones/${applicationId}/evaluacion-entrevista`,
        'POST',
        { result, score, notes },
      );

      await this.load();
      return;
    }

    const previous = this.evaluations().find(
      (evaluation) =>
        evaluation.applicationId === applicationId,
    );

    const items: InterviewEvaluation[] = [
      ...this.evaluations().filter(
        (evaluation) =>
          evaluation.applicationId !== applicationId,
      ),
      {
        id: previous?.id ?? nextId(this.evaluations()),
        applicationId,
        result,
        score,
        notes,
      },
    ];

    this.store.write('evaluations', items);
    this.evaluations.set(items);
  }
}