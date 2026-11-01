import { Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Modal } from '../../../../shared/components/modal/modal';
import { InterviewsService } from '../../services/servicio-entrevistas';
@Component({
  selector: 'app-schedule-form',
  styleUrl: './programar-entrevista.scss',
  imports: [FormsModule, Modal],
  template: `<app-modal title="Programar entrevista" (close)="close.emit()"
    ><form #form="ngForm" class="page-stack" (ngSubmit)="form.valid && save()">
      <p>{{ name() }}</p>
      <div class="form-grid">
        <label class="field"
          >Fecha<input name="date" type="date" [min]="minDate" required [(ngModel)]="date" /></label
        ><label class="field"
          >Hora<input name="time" type="time" required [(ngModel)]="time" /></label
        ><label class="field"
          >Sala o enlace<input name="place" required [(ngModel)]="place"
        /></label>
      </div>
      @if (error) {
        <p class="form-error" role="alert">{{ error }}</p>
      }
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" (click)="close.emit()">Cancelar</button
        ><button class="btn btn-primary" [disabled]="busy || form.invalid">
          Confirmar programación
        </button>
      </div>
    </form></app-modal
  >`,
})
export class ScheduleForm {
  id = input.required<number>();
  name = input('');
  close = output();
  saved = output();
  interviews = inject(InterviewsService);
  date = '';
  time = '09:00';
  place = 'San Isidro';
  error = '';
  busy = false;
  minDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  async save() {
    if (this.busy) return;
    this.error = '';
    if (this.date < this.minDate) {
      this.error = 'Selecciona una fecha actual o futura.';
      return;
    }
    this.busy = true;
    try {
      await this.interviews.schedule(this.id(), this.date, this.time, this.place);
      this.saved.emit();
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'No se pudo programar';
    } finally {
      this.busy = false;
    }
  }
}
