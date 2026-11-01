import { Component, input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `
    <span [class]="tone">
      {{ status() }}
    </span>
  `,
  styleUrl: './badge.scss',
})
export class Badge {
  readonly status = input<string>('');

  private readonly tones: Record<string, string> = {
    'En revisión': 'badge-review',
    Preseleccionado: 'badge-preselected',
    Entrevista: 'badge-interview',
    'Solicitud médica': 'badge-request',
    'Examen médico': 'badge-exam',
    Evaluado: 'badge-evaluated',
    Contratado: 'badge-hired',
    Rechazado: 'badge-rejected',
  };

  get tone(): string {
    const color = this.tones[this.status()] ?? 'badge-default';

    return `badge ${color}`;
  }
}