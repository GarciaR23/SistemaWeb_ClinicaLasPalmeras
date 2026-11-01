import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ApplicantsService } from '../../services/servicio-postulantes';
import { InterviewsService } from '../../services/servicio-entrevistas';
import { HealthService } from '../../services/servicio-resultados-medicos';

import { ScheduleForm } from '../../components/programar-entrevista/programar-entrevista';
import { Badge } from '../../../../shared/components/badge/badge';
import { Modal } from '../../../../shared/components/modal/modal';
import { Icon } from '../../../../shared/components/icono/icono';

import {
  CandidateDocument,
  Status,
} from '../../models/postulante';

type DetailModal =
  | ''
  | 'preselect'
  | 'reject'
  | 'hire'
  | 'evaluate'
  | 'schedule';

@Component({
  selector: 'app-candidate-page',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    ScheduleForm,
    Badge,
    Modal,
    Icon,
  ],
  templateUrl: './detalle-postulante.html',
  styleUrl: './detalle-postulante.scss',
})
export class CandidatePage implements OnInit {
  readonly service = inject(ApplicantsService);
  readonly interviews = inject(InterviewsService);
  readonly health = inject(HealthService);

  private readonly route = inject(ActivatedRoute);
  readonly id = Number(this.route.snapshot.paramMap.get('id'));

  readonly stages = [
    'Registrado',
    'Preselección',
    'Entrevista',
    'Examen médico',
    'Revisión final',
  ];

  private readonly phases: Record<
    Exclude<Status, 'Rechazado'>,
    number
  > = {
    'En revisión': 1,
    Preseleccionado: 2,
    Entrevista: 3,
    'Solicitud médica': 3,
    'Examen médico': 4,
    Evaluado: 4,
    Contratado: 5,
  };

  modal: DetailModal = '';
  loading = true;
  busy = false;

  error = '';
  notice = '';
  reason = '';
  result = 'APROBADO';
  score: number | null = 80;
  notes = '';

  get candidate() {
    return this.service.candidates().find(
      (item) => item.id === this.id,
    );
  }

  get evaluation() {
    return this.interviews.evaluations().find(
      (item) => item.applicationId === this.id,
    );
  }

  get fitness() {
    return this.health.fitness().find(
      (item) => item.applicationId === this.id,
    );
  }

  get initials(): string {
    const name = (this.candidate?.name ?? '')
      .replace(
        /^(?:(?:dr|dra|lic|tec|ing|mg|sr|sra)\.?\s+)+/i,
        '',
      )
      .trim();

    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  get reachedPhase(): number {
    const candidate = this.candidate;

    if (!candidate) return 0;

    const status =
      candidate.status === 'Rechazado'
        ? candidate.statusBeforeRejection
        : candidate.status;

    return status ? this.phases[status] : 0;
  }

  get rejectionPhaseUnknown(): boolean {
    return (
      this.candidate?.status === 'Rechazado' &&
      !this.candidate.statusBeforeRejection
    );
  }

  documentDescription(document: CandidateDocument): string {
    if (!document.sizeBytes) {
      return 'Documento adjunto';
    }

    const size = document.sizeBytes / (1024 * 1024);
    return `Documento adjunto · ${size.toFixed(1)} MB`;
  }

  async ngOnInit(): Promise<void> {
    try {
      await Promise.all([
        this.service.load(),
        this.interviews.load(),
        this.health.load(),
      ]);
    } catch {
      this.error =
        'No se pudo cargar toda la información del perfil.';
    } finally {
      this.loading = false;
    }
  }

  openModal(modal: DetailModal): void {
    if (this.busy) return;

    this.error = '';
    this.notice = '';

    if (modal === 'reject') {
      this.reason = '';
    }

    if (modal === 'evaluate') {
      const evaluation = this.evaluation;

      this.result = evaluation?.result ?? 'APROBADO';
      this.score = evaluation?.score ?? 80;
      this.notes = evaluation?.notes ?? '';
    }

    this.modal = modal;
  }

  closeModal(): void {
    if (!this.busy) {
      this.modal = '';
    }
  }

  async update(status: Status): Promise<void> {
    if (this.busy) return;

    this.error = '';

    if (status === 'Rechazado' && !this.reason.trim()) {
      this.error = 'Ingresa el motivo del rechazo.';
      return;
    }

    this.busy = true;

    try {
      await this.service.status(
        this.id,
        status,
        status === 'Rechazado'
          ? this.reason.trim()
          : undefined,
      );

      this.modal = '';
      this.notice = 'Estado actualizado correctamente.';
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar.';
    } finally {
      this.busy = false;
    }
  }

  async evaluate(): Promise<void> {
    if (this.busy) return;

    this.error = '';

    if (
      this.score === null ||
      !Number.isFinite(this.score) ||
      this.score < 0 ||
      this.score > 100
    ) {
      this.error = 'Ingresa un puntaje entre 0 y 100.';
      return;
    }

    this.busy = true;

    try {
      await this.interviews.evaluate(
        this.id,
        this.result,
        this.score,
        this.notes.trim(),
      );

      this.modal = '';
      this.notice = 'Evaluación laboral guardada.';
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'No se pudo guardar.';
    } finally {
      this.busy = false;
    }
  }
}