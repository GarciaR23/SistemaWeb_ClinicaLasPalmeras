import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';

import { ApplicantsService } from '../../services/servicio-postulantes';
import { VacanciesService } from '../../services/servicio-vacantes';
import { Status } from '../../models/postulante';

import { Icon } from '../../../../shared/components/icono/icono';
import { Badge } from '../../../../shared/components/badge/badge';
import { Modal } from '../../../../shared/components/modal/modal';

@Component({
  selector: 'app-applicants-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    Icon,
    Badge,
    Modal,
  ],
  templateUrl: './lista-postulantes.html',
  styleUrl: './lista-postulantes.scss',
})
export class ApplicantsPage implements OnInit {
  readonly service = inject(ApplicantsService);
  readonly vacancies = inject(VacanciesService);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  search = '';
  position = 'Todos';
  status = 'Todos';

  page = 1;
  readonly pageSize = 6;

  open = false;
  loading = true;
  busy = false;

  error = '';
  formError = '';
  notice = '';

  draft = this.empty();

  readonly statuses: Status[] = [
    'En revisión',
    'Preseleccionado',
    'Entrevista',
    'Solicitud médica',
    'Examen médico',
    'Evaluado',
    'Contratado',
    'Rechazado',
  ];

  get positions() {
    return [
      ...new Set(
        this.service.candidates().map(
          (candidate) => candidate.role,
        ),
      ),
    ];
  }

  get publishedVacancies() {
    return this.vacancies
      .vacancies()
      .filter((vacancy) => vacancy.status === 'Publicada');
  }

  get filtered() {
    const query = this.search.trim().toLowerCase();

    return this.service.candidates().filter((candidate) => {
      const text = [
        candidate.name,
        candidate.email,
        candidate.dni,
      ]
        .join(' ')
        .toLowerCase();

      return (
        (!query || text.includes(query)) &&
        (
          this.position === 'Todos' ||
          candidate.role === this.position
        ) &&
        (
          this.status === 'Todos' ||
          candidate.status === this.status
        )
      );
    });
  }

  get pages(): number {
    return Math.max(
      1,
      Math.ceil(this.filtered.length / this.pageSize),
    );
  }

  get currentPage(): number {
    return Math.min(this.page, this.pages);
  }

  get rows() {
    const start = (this.currentPage - 1) * this.pageSize;

    return this.filtered.slice(
      start,
      start + this.pageSize,
    );
  }

  async ngOnInit(): Promise<void> {
    try {
      await Promise.all([
        this.service.load(),
        this.vacancies.load(),
      ]);

      if (
        this.route.snapshot.queryParamMap.get('nuevo') === '1'
      ) {
        this.openCreate();

        // Retira el parámetro para que una recarga
        // no vuelva a abrir automáticamente el formulario.
        await this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { nuevo: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    } catch {
      this.error = 'No se pudieron cargar los postulantes.';
    } finally {
      this.loading = false;
    }
  }

  empty() {
    return {
      name: '',
      email: '',
      phone: '',
      dni: '',
      experience: '',
      location: '',
      vacancyId: 0,
    };
  }

  openCreate(): void {
    this.draft = this.empty();
    this.formError = '';
    this.notice = '';
    this.open = true;
  }

  closeCreate(): void {
    if (!this.busy) {
      this.open = false;
    }
  }

  changePage(page: number): void {
    this.page = Math.max(
      1,
      Math.min(page, this.pages),
    );
  }

  async create(form: NgForm): Promise<void> {
    if (this.busy) return;

    this.formError = '';

    if (form.invalid) {
      form.control.markAllAsTouched();
      this.formError = 'Revisa los campos obligatorios.';
      return;
    }

    if (this.draft.name.trim().length < 3) {
      this.formError =
        'Ingresa un nombre de al menos 3 caracteres.';
      return;
    }

    const vacancy = this.publishedVacancies.find(
      (item) => item.id === Number(this.draft.vacancyId),
    );

    if (!vacancy) {
      this.formError = 'Selecciona una vacante publicada.';
      return;
    }

    this.busy = true;

    try {
      await this.service.create({
        ...this.draft,
        name: this.draft.name.trim(),
        email: this.draft.email.trim().toLowerCase(),
        phone: this.draft.phone.trim(),
        dni: this.draft.dni.trim(),
        experience: this.draft.experience.trim(),
        location: this.draft.location.trim(),
        vacancyId: vacancy.id,
        role: vacancy.title,
      });

      this.open = false;
      this.draft = this.empty();

      this.search = '';
      this.position = 'Todos';
      this.status = 'Todos';
      this.page = 1;

      this.notice = 'Postulante registrado correctamente.';
    } catch (error) {
      this.formError =
        error instanceof Error
          ? error.message
          : 'No se pudo guardar.';
    } finally {
      this.busy = false;
    }
  }
}