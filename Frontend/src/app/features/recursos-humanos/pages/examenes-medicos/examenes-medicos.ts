import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { HealthService } from '../../services/servicio-resultados-medicos';
import { ApplicantsService } from '../../services/servicio-postulantes';
import { Badge } from '../../../../shared/components/badge/badge';
import { Icon } from '../../../../shared/components/icono/icono';
import { Modal } from '../../../../shared/components/modal/modal';

@Component({
  selector: 'app-examenes-medicos',
  standalone: true,
  imports: [FormsModule, Badge, Icon, Modal],
  templateUrl: './examenes-medicos.html',
  styleUrl: './examenes-medicos.scss',
})
export class ExamenesMedicos implements OnInit {
  readonly service = inject(HealthService);
  readonly applicants = inject(ApplicantsService);

  query = '';

  // Vacío para mostrar las evaluaciones al abrir la página.
  selectedDate = '';

  loading = true;
  open = false;
  busy = false;

  error = '';
  formError = '';
  notice = '';

  draft = this.emptyDraft();

  get minimumDate(): string {
    return this.dateKey(new Date());
  }

  get hasFilters(): boolean {
    return Boolean(this.query || this.selectedDate);
  }

  get capacityDate(): string {
    return this.selectedDate || this.minimumDate;
  }

  get capacityLabel(): string {
    return this.selectedDate
      ? this.formatDate(this.selectedDate)
      : 'hoy';
  }

  get rows() {
    const query = this.query.trim().toLocaleLowerCase('es');

    return this.service
      .appointments()
      .filter((appointment) => {
        const candidate = this.candidate(appointment.applicationId);

        const text = [
          candidate?.name,
          candidate?.role,
          appointment.site,
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase('es');

        return (
          (!this.selectedDate ||
            appointment.date === this.selectedDate) &&
          (!query || text.includes(query))
        );
      })
      .sort((first, second) =>
        `${first.date}T${first.time}`.localeCompare(
          `${second.date}T${second.time}`,
        ),
      );
  }

  get filteredFitness() {
    const query = this.query.trim().toLocaleLowerCase('es');

    return this.service.fitness().filter((item) => {
      const text = [
        this.name(item.applicationId),
        this.role(item.applicationId),
      ]
        .join(' ')
        .toLocaleLowerCase('es');

      return !query || text.includes(query);
    });
  }

  get eligibleCandidates() {
    const pendingIds = new Set(
      this.service
        .appointments()
        .filter(
          (appointment) =>
            new Date(
              `${appointment.date}T${appointment.time}:00`,
            ).getTime() > Date.now(),
        )
        .map((appointment) => appointment.applicationId),
    );

    return this.applicants.candidates().filter(
      (candidate) =>
        ['Entrevista', 'Solicitud médica'].includes(candidate.status) &&
        !pendingIds.has(candidate.id),
    );
  }

  get availableTimes(): string[] {
    return this.service.availableSlots(
      this.draft.site,
      this.draft.date,
    );
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.applicants.load();
      await this.service.load();
    } catch {
      this.error = 'No se pudo cargar toda la información médica.';
    } finally {
      this.loading = false;
    }
  }

  candidate(id: number) {
    return this.applicants
      .candidates()
      .find((item) => item.id === id);
  }

  name(id: number): string {
    return this.candidate(id)?.name ?? 'Postulante';
  }

  role(id: number): string {
    return this.candidate(id)?.role ?? 'Puesto sin registrar';
  }

  status(id: number): string {
    return this.candidate(id)?.status ?? '';
  }

  initials(id: number): string {
    return this.name(id)
      .replace(
        /^(?:(?:dr|dra|lic|tec|ing|mg|sr|sra)\.?\s+)+/i,
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

  slots(site: string): number {
    return this.service.availableSlots(
      site,
      this.capacityDate,
    ).length;
  }

  formatDate(value: string): string {
    const [year, month, day] = value.split('-').map(Number);

    return new Date(year, month - 1, day).toLocaleDateString(
      'es-PE',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      },
    );
  }

  clearFilters(): void {
    this.query = '';
    this.selectedDate = '';
  }

  openSchedule(): void {
    this.formError = '';
    this.notice = '';

    this.draft = {
      ...this.emptyDraft(),
      date:
        this.selectedDate && this.selectedDate >= this.minimumDate
          ? this.selectedDate
          : this.minimumDate,
    };

    this.open = true;
  }

  closeSchedule(): void {
    if (this.busy) return;

    this.open = false;
    this.formError = '';
  }

  resetTime(): void {
    this.draft.time = '';
    this.formError = '';
  }

  async create(form: NgForm): Promise<void> {
    if (this.busy) return;

    form.control.markAllAsTouched();

    if (form.invalid || !this.draft.applicationId) return;

    this.formError = '';

    if (!this.availableTimes.includes(this.draft.time)) {
      this.formError = 'Selecciona un horario disponible.';
      return;
    }

    this.busy = true;

    try {
      await this.service.schedule(
        Number(this.draft.applicationId),
        this.draft.date,
        this.draft.time,
        this.draft.site,
      );

      this.clearFilters();
      this.open = false;
      this.notice = 'Examen médico programado correctamente.';
      this.draft = this.emptyDraft();
    } catch (error) {
      this.formError =
        error instanceof Error
          ? error.message
          : 'No se pudo programar el examen.';
    } finally {
      this.busy = false;
    }
  }

  private emptyDraft() {
    return {
      applicationId: 0,
      date: this.dateKey(new Date()),
      time: '',
      site: '',
    };
  }

  private dateKey(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}