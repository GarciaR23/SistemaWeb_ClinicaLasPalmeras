import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ApplicantsService } from '../../services/servicio-postulantes';
import { InterviewsService } from '../../services/servicio-entrevistas';
import { HealthService } from '../../services/servicio-resultados-medicos';
import { LocalStore } from '../../../../core/services/almacenamiento-local';
import { Icon } from '../../../../shared/components/icono/icono';
import { AvatarPostulante } from '../../../../shared/components/avatar-postulante/avatar-postulante';
import { Feedback } from '../../../../core/services/feedback';
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
  imports: [FormsModule, RouterLink, Icon, AvatarPostulante, DatePipe],
  templateUrl: './detalle-resultado.html',
  styleUrl: './detalle-resultado.scss',
})
export class DetalleResultado implements OnInit {
  readonly applicants = inject(ApplicantsService);
  readonly interviews = inject(InterviewsService);
  readonly health = inject(HealthService);
  private readonly feedback = inject(Feedback);

  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(LocalStore);

  readonly id = Number(
    this.route.snapshot.paramMap.get('id'),
  );

  loading = true;
  busy = false;

  error = '';
  notice = '';
  editingSubmitted = false;

  interviewDropdownOpen = false;
  medicalDropdownOpen = false;

  readonly interviewOptions = [
    { value: 'APROBADO', label: 'Aprobado', positive: true },
    { value: 'DESAPROBADO', label: 'Desaprobado', positive: false },
  ];

  readonly medicalOptions = [
    { value: 'Apto', label: 'Apto', positive: true },
    { value: 'Apto con restricciones', label: 'Apto con restricciones', positive: false },
    { value: 'No apto', label: 'No apto', positive: false },
  ];

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
      (!this.submittedAt || this.editingSubmitted)
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
    if (this.editingSubmitted) {
      return 'Guardar los cambios del resultado y de sus comentarios.';
    }

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
        const defaultInterview = this.defaultInterviewByStatus(this.candidate.status);
        const defaultMedical = this.defaultMedicalByStatus(this.candidate.status);

        this.result =
          this.normalizeInterviewResult(this.evaluation?.result ?? '') ||
          defaultInterview.result;

        this.notes =
          (this.evaluation?.notes ?? '').trim() ||
          defaultInterview.notes;

        this.medicalResult =
          this.normalizeMedicalResult(this.fitness?.conclusion ?? '') ||
          defaultMedical.result;

        this.medicalNotes = defaultMedical.notes;
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

  selectInterviewResult(val: string): void {
    if (!this.editable || this.busy) return;
    this.result = val;
    this.interviewDropdownOpen = false;
    this.onResultChange();
  }

  selectMedicalResult(val: string): void {
    if (!this.editable || this.busy) return;
    this.medicalResult = val;
    this.medicalDropdownOpen = false;
    this.onResultChange();
  }

  get interviewLabel(): string {
    return (
      this.interviewOptions.find((o) => o.value === this.result)?.label ??
      'Selecciona un resultado'
    );
  }

  startEditing(): void {
    if (!this.submittedAt || this.candidate?.status !== 'Evaluado') return;
    this.editingSubmitted = true;
    this.onResultChange();
  }

  submitReview(): void {
    if (this.busy || !this.canSubmit) return;

    this.error = '';
    this.notice = '';
    this.busy = true;

    try {
      const wasSubmitted = Boolean(this.submittedAt);
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
      this.editingSubmitted = false;
      this.feedback.show('success', wasSubmitted ? 'Resultados actualizados' : 'Revisión registrada', wasSubmitted ? 'Los cambios quedaron guardados en este navegador.' : 'El resultado quedó enviado a revisión final.');
    } catch {
      this.error =
        'No se pudo guardar la revisión. Inténtalo nuevamente.';
      this.feedback.show('error', 'No se pudo guardar el resultado', this.error);
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

  private defaultInterviewByStatus(status: string): { result: string; notes: string } {
    if (status === 'Contratado') {
      return {
        result: 'APROBADO',
        notes: 'Excelente dominio técnico y comunicación efectiva con el equipo clínico. Cumple con el perfil y competencias del puesto.',
      };
    }
    if (status === 'Rechazado') {
      return {
        result: 'DESAPROBADO',
        notes: 'No alcanzó el puntaje mínimo requerido en la evaluación por competencias y disponibilidad de horarios.',
      };
    }
    return {
      result: 'APROBADO',
      notes: 'Desempeño sólido durante la entrevista técnica y conductual; demuestra experiencia comprobada en el área asistencial.',
    };
  }

  private defaultMedicalByStatus(status: string): { result: string; notes: string } {
    if (status === 'Rechazado') {
      return {
        result: 'Apto con restricciones',
        notes: 'Evaluación ocupacional completada con observaciones menores registradas por Salud Ocupacional.',
      };
    }
    return {
      result: 'Apto',
      notes: 'Exámenes de laboratorio, agudeza visual y evaluación clínica general dentro de los parámetros normales para el puesto.',
    };
  }

  get compatibilityScore(): number {
    let score = 45;
    if (this.result === 'APROBADO') score += 30;
    if (this.medicalResult === 'Apto') score += 25;
    else if (this.medicalResult === 'Apto con restricciones') score += 12;
    return Math.min(100, score);
  }

  get recommendationLabel(): string {
    if (this.result === 'APROBADO' && this.medicalResult === 'Apto') {
      return 'Recomendado para contratación';
    }
    if (this.result === 'DESAPROBADO' || this.medicalResult === 'No apto') {
      return 'No cumple perfil mínimo';
    }
    return 'Requiere revisión adicional';
  }

  async decideCandidate(decision: 'Contratado' | 'Rechazado'): Promise<void> {
    if (!this.candidate || this.busy) return;
    this.busy = true;
    try {
      await this.applicants.status(
        this.candidate.id,
        decision,
        decision === 'Rechazado'
          ? 'No superó la etapa de evaluación integral.'
          : undefined,
      );
      this.feedback.show(
        decision === 'Contratado' ? 'success' : 'rejection',
        decision === 'Contratado' ? 'Postulante contratado' : 'Postulación rechazada',
        decision === 'Contratado'
          ? `${this.candidate.name} pasó a estado Contratado.`
          : `Se registró el rechazo para ${this.candidate.name}.`,
      );
    } catch {
      this.feedback.show('error', 'Error al actualizar estado', 'Inténtalo nuevamente.');
    } finally {
      this.busy = false;
    }
  }

  printEvaluation(): void {
    window.print();
  }

  whatsappLink(phone: string): string {
    const digits = (phone || '').replace(/\D/g, '');
    const normalized = digits.startsWith('51') ? digits : `51${digits}`;
    return `https://wa.me/${normalized}`;
  }

  emailLink(email: string): string {
    const clean = (email || '').trim();
    if (clean.toLowerCase().includes('gmail.com')) {
      return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(clean)}`;
    }
    return `mailto:${clean}`;
  }
}
