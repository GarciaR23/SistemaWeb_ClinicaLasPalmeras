import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
import { Feedback } from '../../../../core/services/feedback';
import { AvatarPostulante } from '../../../../shared/components/avatar-postulante/avatar-postulante';

@Component({
  selector: 'app-applicants-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    Icon,
    Badge,
    Modal,
    AvatarPostulante,
  ],
  templateUrl: './lista-postulantes.html',
  styleUrl: './lista-postulantes.scss',
})
export class ApplicantsPage implements OnInit {
  readonly service = inject(ApplicantsService);
  readonly vacancies = inject(VacanciesService);
  private readonly feedback = inject(Feedback);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);

  readonly experienceRanges = [
    'Sin experiencia',
    'Menos de 1 año',
    '1 a 2 años',
    '3 a 5 años',
    'Más de 5 años',
  ];

  readonly locationSuggestions = [
    'Miraflores, Lima',
    'San Isidro, Lima',
    'Santiago de Surco, Lima',
    'La Molina, Lima',
  ];

  readonly photoPresets = [
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=240&q=80',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=240&q=80',
    'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=240&q=80',
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=240&q=80',
  ];

  showMapPicker = false;

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
        this.coincideEstado(candidate.status)
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

      const estadoInicial = this.route.snapshot.queryParamMap.get('estado');
      if (estadoInicial && ['En revisión', 'Preseleccionado', 'Entrevista', 'Examen médico', 'Evaluado'].includes(estadoInicial)) {
        this.status = estadoInicial as Status;
      }

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
      experience: 'Sin experiencia',
      location: 'Miraflores, Lima',
      photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=240&q=80',
      vacancyId: 0,
    };
  }

  onNumericKeydown(event: KeyboardEvent): void {
    const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (event.ctrlKey || event.metaKey || allowed.includes(event.key)) return;
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onNumericInput(event: Event, field: 'dni' | 'phone', maxLen: number): void {
    const input = event.target as HTMLInputElement;
    const clean = input.value.replace(/\D/g, '').slice(0, maxLen);
    input.value = clean;
    this.draft[field] = clean;
  }

  onNameKeydown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      return;
    }
    if (event.key === ' ' && (!input.value.trim() || input.value.endsWith(' '))) {
      event.preventDefault();
    }
  }

  onNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const clean = input.value
      .replace(/[0-9]/g, '')
      .replace(/^\s+/, '')
      .replace(/\s{2,}/g, ' ');
    input.value = clean;
    this.draft.name = clean;
  }

  onEmailKeydown(event: KeyboardEvent): void {
    if (event.key === ' ') {
      event.preventDefault();
    }
  }

  onEmailInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const clean = input.value.replace(/\s+/g, '');
    input.value = clean;
    this.draft.email = clean;
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        this.draft.photoUrl = reader.result;
      }
    };
    reader.readAsDataURL(file);
  }

  get googleMapsEmbedUrl(): SafeResourceUrl {
    const query = encodeURIComponent(this.draft.location.trim() || 'Lima, Peru');
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://maps.google.com/maps?q=${query}&t=&z=14&ie=UTF8&iwloc=&output=embed`,
    );
  }

  get googleMapsExternalUrl(): string {
    const query = encodeURIComponent(this.draft.location.trim() || 'Lima, Peru');
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
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

  private coincideEstado(actual: Status): boolean {
    if (this.status === 'Todos') return true;
    if (this.status === 'Examen médico') return actual === 'Examen médico' || actual === 'Solicitud médica';
    if (this.status === 'Evaluado') return actual === 'Evaluado' || actual === 'Contratado';
    return actual === this.status;
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
      this.feedback.show('success', 'Postulante registrado', 'El perfil ya está disponible en la lista de selección.');
    } catch (error) {
      this.formError =
        error instanceof Error
          ? error.message
          : 'No se pudo guardar.';
      this.feedback.show('error', 'No se pudo registrar el perfil', this.formError);
    } finally {
      this.busy = false;
    }
  }
}
