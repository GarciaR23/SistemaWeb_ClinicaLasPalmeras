import {
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Session } from '../../../../core/services/sesion';
import { Notifications } from '../../../../core/services/notificaciones';
import { ApplicantsService } from '../../services/servicio-postulantes';
import { InterviewsService } from '../../services/servicio-entrevistas';
import { ScheduleForm } from '../../components/programar-entrevista/programar-entrevista';
import { Icon } from '../../../../shared/components/icono/icono';

type AgendaFilter = 'all' | 'today' | 'tomorrow';

interface CalendarDay {
  key: string;
  day: number;
  currentMonth: boolean;
}

interface ReminderAppointment {
  id: number;
  applicationId: number;
  date: string;
  time: string;
  place?: string;
}

@Component({
  selector: 'app-interviews-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    ScheduleForm,
    Icon,
  ],
  templateUrl: './entrevistas.html',
  styleUrl: './entrevistas.scss',
})
export class InterviewsPage implements OnInit, OnDestroy {
  readonly service = inject(InterviewsService);
  readonly applicants = inject(ApplicantsService);
  readonly session = inject(Session);

  private readonly notifications = inject(Notifications);

  readonly weekdays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  readonly reminderMessage = signal('');

  private reminderTimer?: ReturnType<typeof setTimeout>;

  private readonly reminded = new Set<string>();

  private readonly initialDate = new Date();

  displayedMonth = new Date(
    this.initialDate.getFullYear(),
    this.initialDate.getMonth(),
    1,
  );

  query = '';
  date = '';
  filter: AgendaFilter = 'all';

  selected = 0;
  loading = true;

  error = '';
  notice = '';

  get isRrhh(): boolean {
    return this.session.role() === 'rrhh';
  }

  get monthLabel(): string {
    return this.displayedMonth.toLocaleDateString('es-PE', {
      month: 'long',
      year: 'numeric',
    });
  }

  get agendaLabel(): string {
    if (!this.date) {
      return 'Todas las entrevistas registradas';
    }

    return this.parseDate(this.date).toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  get visibleAppointments() {
    const email = this.session.user()?.email;

    return this.service.appointments().filter((appointment) => {
      if (this.session.role() !== 'applicant') {
        return true;
      }

      return (
        this.candidate(appointment.applicationId)?.email === email
      );
    });
  }

  get appointmentDates(): Set<string> {
    return new Set(
      this.visibleAppointments.map((appointment) => appointment.date),
    );
  }

  get calendarDays(): CalendarDay[] {
    const year = this.displayedMonth.getFullYear();
    const month = this.displayedMonth.getMonth();

    const firstDay = new Date(year, month, 1);

    // La semana comienza el lunes.
    const offset = (firstDay.getDay() + 6) % 7;

    const daysInMonth = new Date(
      year,
      month + 1,
      0,
    ).getDate();

    const cellCount =
      Math.ceil((offset + daysInMonth) / 7) * 7;

    return Array.from({ length: cellCount }, (_, index) => {
      const value = new Date(
        year,
        month,
        index - offset + 1,
      );

      return {
        key: this.dateKey(value),
        day: value.getDate(),
        currentMonth: value.getMonth() === month,
      };
    });
  }

  get rows() {
    const query = this.query
      .trim()
      .toLocaleLowerCase('es');

    return this.visibleAppointments
      .filter((appointment) => {
        const candidate = this.candidate(
          appointment.applicationId,
        );

        const searchable = [
          candidate?.name,
          candidate?.role,
          appointment.place,
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase('es');

        return (
          (!this.date || appointment.date === this.date) &&
          (!query || searchable.includes(query))
        );
      })
      .sort((first, second) =>
        `${first.date}T${first.time}`.localeCompare(
          `${second.date}T${second.time}`,
        ),
      );
  }

  async ngOnInit(): Promise<void> {
    try {
      await Promise.all([
        this.applicants.load(),
        this.service.load(),
      ]);
    } catch {
      this.error =
        'No se pudo cargar toda la agenda de entrevistas.';
    } finally {
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.clearReminderTimer();
  }

  candidate(id: number) {
    return this.applicants
      .candidates()
      .find((candidate) => candidate.id === id);
  }

  name(id: number): string {
    return this.candidate(id)?.name ?? 'Postulante';
  }

  role(id: number): string {
    return this.candidate(id)?.role ?? 'Puesto sin registrar';
  }

  initials(id: number): string {
    const name = this.name(id)
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

  formatDate(value: string): string {
    return this.parseDate(value).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  isToday(value: string): boolean {
    return value === this.dateKey(new Date());
  }

  changeMonth(offset: number): void {
    this.displayedMonth = new Date(
      this.displayedMonth.getFullYear(),
      this.displayedMonth.getMonth() + offset,
      1,
    );
  }

  selectDay(day: CalendarDay): void {
    this.date = day.key;

    const today = new Date();
    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1);

    if (day.key === this.dateKey(today)) {
      this.filter = 'today';
    } else if (day.key === this.dateKey(tomorrow)) {
      this.filter = 'tomorrow';
    } else {
      this.filter = 'all';
    }

    const selectedDate = this.parseDate(day.key);

    this.displayedMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1,
    );
  }

  changeFilter(filter: AgendaFilter): void {
    this.filter = filter;

    if (filter === 'all') {
      this.date = '';
      return;
    }

    const target = new Date();

    if (filter === 'tomorrow') {
      target.setDate(target.getDate() + 1);
    }

    this.date = this.dateKey(target);

    this.displayedMonth = new Date(
      target.getFullYear(),
      target.getMonth(),
      1,
    );
  }

  clearFilters(): void {
    this.query = '';
    this.date = '';
    this.filter = 'all';
  }

  openSchedule(applicationId: number): void {
    if (!this.isRrhh) return;

    this.error = '';
    this.notice = '';
    this.selected = applicationId;
  }

  async onRescheduled(): Promise<void> {
    this.selected = 0;
    this.error = '';

    try {
      await Promise.all([
        this.service.load(),
        this.applicants.load(),
      ]);

      this.notice =
        'Entrevista actualizada correctamente.';
    } catch {
      this.error =
        'La entrevista se guardó, pero no se pudo actualizar la agenda.';
    }
  }

  reminderKey(
    appointment: Pick<
      ReminderAppointment,
      'id' | 'date' | 'time' | 'place'
    >,
  ): string {
    return [
      appointment.id,
      appointment.date,
      appointment.time,
      appointment.place ?? '',
    ].join('|');
  }

  wasReminded(
    appointment: Pick<
      ReminderAppointment,
      'id' | 'date' | 'time' | 'place'
    >,
  ): boolean {
    return this.reminded.has(
      this.reminderKey(appointment),
    );
  }

remind(appointment: ReminderAppointment): void {
  if (!this.isRrhh || this.wasReminded(appointment)) {
    return;
  }

  this.error = '';
  this.notice = '';

  const candidate = this.candidate(
    appointment.applicationId,
  );

  if (!candidate?.email) {
    this.error =
      'El postulante no tiene un correo registrado.';
    return;
  }

  try {
    const place = appointment.place
      ? ` Lugar o enlace: ${appointment.place}.`
      : '';

    this.notifications.add(
      candidate.email,
      'Recordatorio de entrevista',
      `Tu entrevista está programada para el ${
        this.formatDate(appointment.date)
      } a las ${appointment.time}.${place}`,
    );

    this.reminded.add(
      this.reminderKey(appointment),
    );

    this.showReminder(
      `Recordatorio registrado para ${candidate.name}`,
    );
  } catch {
    this.error =
      'No se pudo registrar el recordatorio.';
  }
}

  private showReminder(message: string): void {
    this.clearReminderTimer();

    this.reminderMessage.set(message);

    this.reminderTimer = setTimeout(() => {
      this.reminderMessage.set('');
      this.reminderTimer = undefined;
    }, 4000);
  }

  private clearReminderTimer(): void {
    if (this.reminderTimer !== undefined) {
      clearTimeout(this.reminderTimer);
      this.reminderTimer = undefined;
    }
  }

  private dateKey(value: Date): string {
    const year = value.getFullYear();

    const month = String(
      value.getMonth() + 1,
    ).padStart(2, '0');

    const day = String(
      value.getDate(),
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private parseDate(value: string): Date {
    const [year, month, day] = value
      .split('-')
      .map(Number);

    return new Date(year, month - 1, day);
  }
}