import { inject, Injectable, signal } from '@angular/core';
import { ApiClient } from '../../../core/services/cliente-api';
import { LocalStore, nextId, today } from '../../../core/services/almacenamiento-local';
import { environment } from '../../../../environments/environment';
import { Vacancy } from '../models/vacante';
import { DEMO_VACANCIES } from '../models/vacantes-demostracion';
@Injectable({ providedIn: 'root' })
export class VacanciesService {
  private store = inject(LocalStore);
  private api = inject(ApiClient);
  readonly vacancies = signal<Vacancy[]>(
    environment.demoMode ? this.store.read('vacancies', DEMO_VACANCIES) : [],
  );
  async load() {
    if (!environment.demoMode) {
      const state = await this.api.request<{ vacancies: Vacancy[] }>('/state');
      this.vacancies.set(state.vacancies);
    }
  }
  private save(items: Vacancy[]) {
    this.store.write('vacancies', items);
    this.vacancies.set(items);
  }
  async create(data: Omit<Vacancy, 'id' | 'published' | 'status'>) {
    if (!environment.demoMode) {
      await this.api.request('/vacantes', 'POST', data);
      await this.load();
      return;
    }
    this.save([
      { ...data, id: nextId(this.vacancies()), published: today(), status: 'Publicada' },
      ...this.vacancies(),
    ]);
  }
  async status(id: number, status: Vacancy['status']) {
    if (!environment.demoMode) {
      await this.api.request('/vacantes/' + id, 'PATCH', { status });
      await this.load();
      return;
    }
    this.save(this.vacancies().map((v) => (v.id === id ? { ...v, status } : v)));
  }
}
