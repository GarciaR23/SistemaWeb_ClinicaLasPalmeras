import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VacanciesService } from '../../services/servicio-vacantes';
import { Icon } from '../../../../shared/components/icono/icono';
import { Modal } from '../../../../shared/components/modal/modal';
import { Vacancy } from '../../models/vacante';
import { Feedback } from '../../../../core/services/feedback';

@Component({
  selector: 'app-vacancies-page',
  styleUrl: './vacantes.scss',
  imports: [FormsModule, Icon, Modal],
  templateUrl: './vacantes.html',
})
export class VacanciesPage implements OnInit {
  service = inject(VacanciesService);
  private readonly feedback = inject(Feedback);

  query = '';
  open = false;
  busy = false;
  error = '';
  notice = '';
  requirements = 'Título profesional o técnico\nExperiencia relacionada';

  customImages: Record<string, string> = {};

  draft = {
    title: '',
    area: 'Enfermería',
    location: 'San Isidro',
    modality: 'Presencial',
    openings: 1,
    description: '',
    imageUrl: '',
  };

  readonly imagePresets = [
    {
      label: 'Enfermería',
      url: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=700&q=80',
    },
    {
      label: 'Medicina',
      url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=700&q=80',
    },
    {
      label: 'Laboratorio',
      url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=700&q=80',
    },
    {
      label: 'Psicología',
      url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=700&q=80',
    },
  ];

  get filtered() {
    return this.service
      .vacancies()
      .filter((v) =>
        (v.title + ' ' + v.area).toLowerCase().includes(this.query.toLowerCase()),
      );
  }

  get previewImage(): string {
    return (
      this.draft.imageUrl.trim() ||
      this.resolveRoleImage(this.draft.title, this.draft.area)
    );
  }

  vacancyImage(v: Vacancy): string {
    return (
      this.customImages[String(v.id)] ||
      this.customImages[v.title.toLowerCase()] ||
      this.resolveRoleImage(v.title, v.area)
    );
  }

  private resolveRoleImage(title: string, area: string): string {
    const text = `${title} ${area}`.toLowerCase();
    if (text.includes('enfermer')) {
      return 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=700&q=80';
    }
    if (text.includes('laboratorio') || text.includes('técnico')) {
      return 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=700&q=80';
    }
    if (text.includes('psic')) {
      return 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=700&q=80';
    }
    if (text.includes('médic') || text.includes('medic') || text.includes('internista')) {
      return 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=700&q=80';
    }
    return 'https://images.unsplash.com/photo-1576091160550-2173ff9e019b?auto=format&fit=crop&w=700&q=80';
  }

  onImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        this.draft.imageUrl = reader.result;
      }
    };
    reader.readAsDataURL(file);
  }

  async ngOnInit() {
    try {
      await this.service.load();
    } catch {
      this.error = 'No se pudieron cargar las vacantes.';
    }
  }

  async create() {
    this.busy = true;
    this.error = '';
    const customImg = this.draft.imageUrl.trim();
    const titleKey = this.draft.title.trim().toLowerCase();

    try {
      const { imageUrl: _unused, ...payload } = this.draft;
      await this.service.create({
        ...payload,
        requirements: this.requirements
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      if (customImg && titleKey) {
        this.customImages[titleKey] = customImg;
      }
      this.open = false;
      this.draft = { ...this.draft, title: '', description: '', imageUrl: '' };
      this.notice = 'Vacante publicada.';
      this.feedback.show(
        'success',
        'Vacante publicada',
        'La convocatoria ya está disponible para postulantes.',
      );
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'No se pudo guardar';
      this.feedback.show('error', 'No se pudo publicar la vacante', this.error);
    } finally {
      this.busy = false;
    }
  }

  async status(v: Vacancy, status: Vacancy['status']) {
    this.error = '';
    this.busy = true;
    try {
      await this.service.status(v.id, status);
      this.feedback.show(
        'success',
        `Vacante ${status.toLowerCase()}`,
        `${v.title} ahora figura como ${status.toLowerCase()}.`,
      );
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'No se pudo actualizar';
      this.feedback.show('error', 'No se pudo cambiar el estado', this.error);
    } finally {
      this.busy = false;
    }
  }
}
