import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VacanciesService } from '../../services/servicio-vacantes';
import { Icon } from '../../../../shared/components/icono/icono';
import { Modal } from '../../../../shared/components/modal/modal';
import { Vacancy } from '../../models/vacante';
@Component({
  selector: 'app-vacancies-page',
  styleUrl: './vacantes.scss',
  imports: [FormsModule, Icon, Modal],
  templateUrl: './vacantes.html',
})
export class VacanciesPage implements OnInit {
  service = inject(VacanciesService);
  query = '';
  open = false;
  busy = false;
  error = '';
  notice = '';
  requirements = 'Título profesional o técnico\nExperiencia relacionada';
  draft = {
    title: '',
    area: 'Enfermería',
    location: 'San Isidro',
    modality: 'Presencial',
    openings: 1,
    description: '',
  };
  get filtered() {
    return this.service
      .vacancies()
      .filter((v) => (v.title + ' ' + v.area).toLowerCase().includes(this.query.toLowerCase()));
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
    try {
      await this.service.create({
        ...this.draft,
        requirements: this.requirements
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      this.open = false;
      this.draft = { ...this.draft, title: '', description: '' };
      this.notice = 'Vacante publicada.';
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'No se pudo guardar';
    } finally {
      this.busy = false;
    }
  }
  async status(v: Vacancy, status: Vacancy['status']) {
    this.error = '';
    this.busy = true;
    try {
      await this.service.status(v.id, status);
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'No se pudo actualizar';
    } finally {
      this.busy = false;
    }
  }
}
