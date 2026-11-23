import { inject, Injectable } from '@angular/core';

import { ApplicantsService } from './servicio-postulantes';
import { VacanciesService } from './servicio-vacantes';
import { InterviewsService } from './servicio-entrevistas';
import { ResumenDashboard } from '../models/resumen-dashboard';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly applicants = inject(ApplicantsService);
  private readonly vacancies = inject(VacanciesService);
  private readonly interviews = inject(InterviewsService);

  async cargar(): Promise<void> {
    await Promise.all([this.applicants.load(), this.vacancies.load(), this.interviews.load()]);
    this.interviews.cargarEjemplos();
  }

  obtenerResumen(): ResumenDashboard {
    const candidates = this.applicants.candidates();
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const weekEnd = new Date(`${today}T12:00:00`);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const finalWeekDate = `${weekEnd.getFullYear()}-${String(weekEnd.getMonth() + 1).padStart(2, '0')}-${String(weekEnd.getDate()).padStart(2, '0')}`;
    const appointments = this.interviews.appointments().filter((item) => item.date >= today && item.date <= finalWeekDate).sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
    const byStage = (statuses: string[]) => candidates.filter((candidate) => statuses.includes(candidate.status)).length;
    const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

    return {
      indicadores: [
        { titulo: 'Postulantes activos', cantidad: candidates.filter((item) => !['Contratado', 'Rechazado'].includes(item.status)).length, descripcion: 'En proceso de selección', icono: 'user', color: 'azul' },
        { titulo: 'Vacantes abiertas', cantidad: this.vacancies.vacancies().filter((item) => item.status === 'Publicada').length, descripcion: 'Convocatorias publicadas', icono: 'briefcase', color: 'amarillo' },
        { titulo: 'Entrevistas esta semana', cantidad: appointments.length, descripcion: `${appointments.filter((item) => item.date === today).length} para hoy`, icono: 'calendar', color: 'morado' },
        { titulo: 'Contrataciones', cantidad: byStage(['Contratado']), descripcion: 'Resultados finales', icono: 'check', color: 'verde' },
      ],
      etapas: [
        { nombre: 'En revisión', cantidad: byStage(['En revisión']) },
        { nombre: 'Preseleccionado', cantidad: byStage(['Preseleccionado']) },
        { nombre: 'Entrevista', cantidad: byStage(['Entrevista']) },
        { nombre: 'Examen médico', cantidad: byStage(['Solicitud médica', 'Examen médico']) },
        { nombre: 'Evaluado', cantidad: byStage(['Evaluado', 'Contratado']) },
      ],
      entrevistas: appointments.slice(0, 3).map((appointment) => {
        const candidate = candidates.find((item) => item.id === appointment.applicationId);
        return { id: appointment.applicationId, hora: appointment.time, nombre: candidate?.name ?? 'Postulante', puesto: candidate?.role ?? 'Puesto sin registrar', iniciales: initials(candidate?.name ?? 'P') };
      }),
      actividades: candidates.slice(0, 3).map((candidate, index) => ({
        id: candidate.id,
        descripcion: `${candidate.name} · ${candidate.status}`,
        tiempo: index === 0 ? 'Estado actual' : 'En proceso de selección',
        icono: candidate.status === 'Contratado' ? 'check' : candidate.status === 'Entrevista' ? 'calendar' : 'user',
      })),
    };
  }
}
