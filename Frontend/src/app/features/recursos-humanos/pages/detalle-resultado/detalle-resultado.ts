import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ApplicantsService } from '../../services/servicio-postulantes';
import { InterviewsService } from '../../services/servicio-entrevistas';
import { HealthService } from '../../services/servicio-resultados-medicos';
import { LocalStore } from '../../../../core/services/almacenamiento-local';
import { Icon } from '../../../../shared/components/icono/icono';
import { environment } from '../../../../../environments/environment';

interface FinalReview {
  interviewResult: string;
  interviewNotes: string;
  medicalConclusion: string;
  medicalNotes?: string;
  submittedAt: string;
}

@Component({
  selector: 'app-detalle-resultado',
  standalone: true,
  imports: [FormsModule, RouterLink, Icon],
  templateUrl: './detalle-resultado.html',
  styleUrl: './detalle-resultado.scss',
})
export class DetalleResultado implements OnInit {
  readonly applicants = inject(ApplicantsService);
  readonly interviews = inject(InterviewsService);
  readonly health = inject(HealthService);

  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(LocalStore);

  readonly id = Number(
    this.route.snapshot.paramMap.get('id'),
  );

  loading = true;
  busy = false;

  error = '';
  notice = '';

  result = '';
  notes = '';

  medicalResult = '';
  medicalNotes = '';

  submittedAt = '';

  get candidate() {
    return this.applicants
      .candidates()
      .find((item) => item.id === this.id);
  }

  get evaluation() {
    return this.interviews
      .evaluations()
      .find((item) => item.applicationId === this.id);
  }

  get fitness() {
    return this.health
      .fitness()
      .find((item) => item.applicationId === this.id);
  }

  get medicalConclusion(): string {
    return this.medicalResult.trim();
  }

  get initials(): string {
    return (this.candidate?.name ?? '')
      .replace(
        /^(?:(?:dr|dra|lic|tec|ing|mg)\.?\s+)+/i,
        '',
      )
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  get editable(): boolean {
    return (
      environment.demoMode &&
      this.candidate?.status === 'Evaluado' &&
      !this.submittedAt
    );
  }

  get hasInterviewResult(): boolean {
    return ['APROBADO', 'DESAPROBADO'].includes(
      this.result,
    );
  }

  get hasMedicalResult(): boolean {
    return Boolean(this.medicalConclusion);
  }

  get canSubmit(): boolean {
    return (
      this.editable &&
      this.hasInterviewResult &&
      this.hasMedicalResult
    );
  }

  get steps() {
    const hired = this.candidate?.status === 'Contratado';

    return [
      {
        label: 'Registrado',
        done: Boolean(this.candidate),
      },
      {
        label: 'Entrevista',
        done: hired || this.hasInterviewResult,
      },
      {
        label: 'Examen médico',
        done: hired || this.hasMedicalResult,
      },
      {
        label: 'Revisión final',
        done: hired || Boolean(this.submittedAt),
      },
    ];
  }

  get submitHint(): string {
    if (this.submittedAt) {
      return 'La revisión ya fue registrada.';
    }

    if (!environment.demoMode) {
      return 'El envío todavía no está conectado al backend.';
    }

    if (!this.hasInterviewResult) {
      return 'Selecciona el resultado de la entrevista.';
    }

    if (!this.hasMedicalResult) {
      return 'Selecciona el resultado del examen médico.';
    }

    return 'Registrar el envío a revisión final.';
  }

  async ngOnInit(): Promise<void> {
    try {
      if (!Number.isInteger(this.id) || this.id <= 0) {
        throw new Error(
          'El identificador del postulante no es válido.',
        );
      }

      await Promise.all([
        this.applicants.load(),
        this.interviews.load(),
        this.health.load(),
      ]);

      if (!this.candidate) {
        throw new Error('No se encontró al postulante.');
      }

      const savedReviews = environment.demoMode
        ? this.store.read<Record<string, FinalReview>>(
            'evaluation-final-reviews',
            {},
          )
        : {};

      const saved = savedReviews[String(this.id)];

      if (saved) {
        this.result = saved.interviewResult;
        this.notes = saved.interviewNotes;
        this.medicalResult = saved.medicalConclusion;
        this.medicalNotes = saved.medicalNotes ?? '';
        this.submittedAt = saved.submittedAt;
      } else {
        this.result = this.normalizeInterviewResult(
          this.evaluation?.result ?? '',
        );

        this.notes = this.evaluation?.notes ?? '';

        this.medicalResult = this.normalizeMedicalResult(
          this.fitness?.conclusion ?? '',
        );

        this.medicalNotes = '';
      }
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar los resultados.';
    } finally {
      this.loading = false;
    }
  }

  onResultChange(): void {
    this.error = '';
    this.notice = '';
  }

  submitReview(): void {
    if (this.busy || !this.canSubmit) return;

    this.error = '';
    this.notice = '';
    this.busy = true;

    try {
      const reviews = this.store.read<
        Record<string, FinalReview>
      >(
        'evaluation-final-reviews',
        {},
      );

      const review: FinalReview = {
        interviewResult: this.result,
        interviewNotes: this.notes.trim(),
        medicalConclusion: this.medicalConclusion,
        medicalNotes: this.medicalNotes.trim(),
        submittedAt: new Date().toISOString(),
      };

      this.store.write('evaluation-final-reviews', {
        ...reviews,
        [String(this.id)]: review,
      });

      this.notes = review.interviewNotes;
      this.medicalResult = review.medicalConclusion;
      this.medicalNotes = review.medicalNotes ?? '';
      this.submittedAt = review.submittedAt;

      this.notice =
        'Envío a revisión final registrado correctamente en este navegador.';
    } catch {
      this.error =
        'No se pudo guardar la revisión. Inténtalo nuevamente.';
    } finally {
      this.busy = false;
    }
  }

  private normalizeInterviewResult(value: string): string {
    const normalized = value.trim().toUpperCase();

    return ['APROBADO', 'DESAPROBADO'].includes(normalized)
      ? normalized
      : '';
  }

  private normalizeMedicalResult(value: string): string {
    const trimmed = value.trim();

    const options: Record<string, string> = {
      APTO: 'Apto',
      'APTO CON RESTRICCIONES': 'Apto con restricciones',
      'NO APTO': 'No apto',
    };

    return options[trimmed.toUpperCase()] ?? trimmed;
  }
}