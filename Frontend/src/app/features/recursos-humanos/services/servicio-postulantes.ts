import { inject, Injectable, signal } from '@angular/core';

import { ApiClient } from '../../../core/services/cliente-api';
import {
  LocalStore,
  nextId,
  today,
} from '../../../core/services/almacenamiento-local';

import { environment } from '../../../../environments/environment';
import { Candidate, Status } from '../models/postulante';
import { DEMO_CANDIDATES } from '../models/postulantes-demostracion';
import { Notifications } from '../../../core/services/notificaciones';

@Injectable({
  providedIn: 'root',
})
export class ApplicantsService {
  private readonly store = inject(LocalStore);
  private readonly api = inject(ApiClient);
  private readonly notifications = inject(Notifications);

  readonly candidates = signal<Candidate[]>(
    environment.demoMode
      ? this.store.read<Candidate[]>('candidates', DEMO_CANDIDATES)
      : [],
  );

  async load(): Promise<void> {
    if (!environment.demoMode) {
      const state = await this.api.request<{
        candidates: Candidate[];
      }>('/state');

      this.candidates.set(state.candidates);
    }
  }

  private save(items: Candidate[]): void {
    this.store.write('candidates', items);
    this.candidates.set(items);
  }

  async create(
    data: Omit<Candidate, 'id' | 'date' | 'status'>,
  ): Promise<number> {
    if (!environment.demoMode) {
      const result = await this.api.request<{ id: number }>(
        '/postulantes',
        'POST',
        data,
      );

      await this.load();
      return result.id;
    }

    const id = nextId(this.candidates());

    this.save([
      {
        ...data,
        id,
        date: today(),
        status: 'En revisión',
      },
      ...this.candidates(),
    ]);

    this.notifications.add(
      data.email,
      'Postulación registrada',
      `Tu postulación a ${data.role} está en revisión.`,
    );

    return id;
  }

  async status(
    id: number,
    status: Status,
    rejectionReason?: string,
  ): Promise<void> {
    const candidate = this.candidates().find(
      (item) => item.id === id,
    );

    if (!candidate) {
      throw new Error('No se encontró el postulante.');
    }

    const reason = rejectionReason?.trim();

    if (status === 'Rechazado' && !reason) {
      throw new Error('Ingresa el motivo del rechazo.');
    }

    const previousStatus =
      candidate.status === 'Rechazado'
        ? candidate.statusBeforeRejection
        : candidate.status;

    if (!environment.demoMode) {
      await this.api.request(
        `/postulaciones/${id}/estado`,
        'PATCH',
        {
          status,
          ...(status === 'Rechazado'
            ? {
                rejectionReason: reason,
                statusBeforeRejection: previousStatus,
              }
            : {}),
        },
      );

      await this.load();
      return;
    }

    const updated: Candidate = {
      ...candidate,
      status,
    };

    if (status === 'Rechazado') {
      updated.rejectionReason = reason;
      updated.statusBeforeRejection = previousStatus;
    } else {
      delete updated.rejectionReason;
      delete updated.statusBeforeRejection;
    }

    this.save(
      this.candidates().map((item) =>
        item.id === id ? updated : item,
      ),
    );

    this.notifications.add(
      candidate.email,
      'Estado de postulación actualizado',
      `${candidate.role}: ${status}`,
    );
  }
}