import { inject, Injectable, signal } from '@angular/core';

import {
  LocalStore,
  nextId,
} from '../../../core/services/almacenamiento-local';
import { ApiClient } from '../../../core/services/cliente-api';
import { ApplicantsService } from './servicio-postulantes';
import { Appointment } from '../models/entrevista';
import { Fitness } from '../models/aptitud';
import { environment } from '../../../../environments/environment';

export interface MedicalSite {
  name: string;
  opening: string;
  closing: string;
  slots: string[];
}

@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly store = inject(LocalStore);
  private readonly api = inject(ApiClient);
  private readonly applicants = inject(ApplicantsService);

  // Horarios de ejemplo del frontend.
  readonly sites: MedicalSite[] = [
    {
      name: 'San Isidro',
      opening: '08:00',
      closing: '17:00',
      slots: ['08:00', '09:30', '11:00', '12:30', '14:00', '15:30'],
    },
    {
      name: 'Miraflores',
      opening: '09:00',
      closing: '16:00',
      slots: ['09:00', '11:00'],
    },
    {
      name: 'La Molina',
      opening: '08:30',
      closing: '17:30',
      slots: ['08:30', '10:00', '13:00', '15:00'],
    },
  ];

  readonly appointments = signal<Appointment[]>(
    environment.demoMode
      ? this.store.read<Appointment[]>('medical', [])
      : [],
  );

  readonly fitness = signal<Fitness[]>(
    environment.demoMode
      ? this.store.read<Fitness[]>('fitness', [])
      : [],
  );

  async load(): Promise<void> {
    if (environment.demoMode) {
      await this.applicants.load();
      this.initializeExamples();
      return;
    }

    const [appointments, fitness] = await Promise.all([
      this.api.request<Appointment[]>('/salud/citas'),
      this.api.request<Fitness[]>('/salud/aptitud'),
    ]);

    this.appointments.set(appointments);
    this.fitness.set(fitness);
  }

  availableSlots(site: string, date: string): string[] {
    const selectedSite = this.sites.find((item) => item.name === site);

    if (!selectedSite || !date) return [];

    return selectedSite.slots.filter((time) => {
      const occupied = this.appointments().some(
        (appointment) =>
          appointment.site === site &&
          appointment.date === date &&
          appointment.time === time,
      );

      const future =
        new Date(`${date}T${time}:00`).getTime() > Date.now();

      return !occupied && future;
    });
  }

  async schedule(
    applicationId: number,
    date: string,
    time: string,
    site: string,
  ): Promise<void> {
    if (!environment.demoMode) {
      throw new Error(
        'La programación de exámenes todavía no está conectada al backend.',
      );
    }

    const candidate = this.applicants
      .candidates()
      .find((item) => item.id === applicationId);

    if (!candidate) {
      throw new Error('Selecciona un postulante válido.');
    }

    if (!['Entrevista', 'Solicitud médica'].includes(candidate.status)) {
      throw new Error(
        'El postulante debe estar en Entrevista o Solicitud médica.',
      );
    }

    const hasPendingAppointment = this.appointments().some(
      (appointment) =>
        appointment.applicationId === applicationId &&
        this.isFuture(appointment),
    );

    if (hasPendingAppointment) {
      throw new Error(
        'Este postulante ya tiene una evaluación pendiente.',
      );
    }

    if (!this.availableSlots(site, date).includes(time)) {
      throw new Error(
        'El horario ya no está disponible. Selecciona otro.',
      );
    }

    const appointment: Appointment = {
      id: nextId(this.appointments()),
      applicationId,
      date,
      time,
      site,
    };

    const items = [...this.appointments(), appointment];

    this.store.write('medical', items);
    this.appointments.set(items);

    try {
      await this.applicants.status(applicationId, 'Examen médico');
    } catch {
      throw new Error(
        'La cita se guardó, pero no se pudo completar la actualización del estado. Revisa el perfil del postulante.',
      );
    }
  }

  private initializeExamples(): void {
    const initialized = this.store.read<boolean>(
      'medical-examples-initialized',
      false,
    );

    if (initialized) return;

    // Conserva cualquier cita que ya haya registrado el usuario.
    if (this.appointments().length > 0) {
      this.store.write('medical-examples-initialized', true);
      return;
    }

    const candidates = this.applicants.candidates();

    const examples = [
      {
        name: 'Sofía Reyes',
        site: 'San Isidro',
        time: '09:30',
        days: 1,
      },
      {
        name: 'Jorge Quispe',
        site: 'Miraflores',
        time: '11:00',
        days: 2,
      },
      {
        name: 'Carmen Flores',
        site: 'La Molina',
        time: '08:30',
        days: 3,
      },
    ];

    const items: Appointment[] = [];

    for (const example of examples) {
      const candidate = candidates.find(
        (item) =>
          item.name.includes(example.name) &&
          !['Contratado', 'Rechazado'].includes(item.status),
      );

      if (!candidate) continue;

      const date = new Date();
      date.setDate(date.getDate() + example.days);

      items.push({
        id: nextId(items),
        applicationId: candidate.id,
        date: this.dateKey(date),
        time: example.time,
        site: example.site,
      });
    }

    if (!items.length) return;

    this.store.write('medical', items);
    this.appointments.set(items);

    this.store.write('medical-examples-initialized', true);
  }

  private isFuture(appointment: Appointment): boolean {
    return (
      new Date(
        `${appointment.date}T${appointment.time}:00`,
      ).getTime() > Date.now()
    );
  }

  private dateKey(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}