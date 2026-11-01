import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ApplicantsService } from '../../services/servicio-postulantes';
import { Badge } from '../../../../shared/components/badge/badge';
import { Icon } from '../../../../shared/components/icono/icono';

@Component({
  selector: 'app-results-page',
  standalone: true,
  imports: [RouterLink, FormsModule, Badge, Icon],
  templateUrl: './resultados.html',
  styleUrl: './resultados.scss',
})
export class ResultsPage implements OnInit {
  readonly service = inject(ApplicantsService);

  query = '';
  status = 'Todos';
  error = '';
  loading = true;

  get hasFilters(): boolean {
    return Boolean(this.query || this.status !== 'Todos');
  }

  get rows() {
    const query = this.query.trim().toLocaleLowerCase('es');

    return this.service.candidates().filter(
      (candidate) =>
        ['Evaluado', 'Contratado', 'Rechazado'].includes(candidate.status) &&
        (this.status === 'Todos' || candidate.status === this.status) &&
        `${candidate.name} ${candidate.role}`
          .toLocaleLowerCase('es')
          .includes(query),
    );
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.service.load();
    } catch {
      this.error = 'No se pudieron cargar los resultados.';
    } finally {
      this.loading = false;
    }
  }

  clearFilters(): void {
    this.query = '';
    this.status = 'Todos';
  }

  initials(name: string): string {
    return name
      .replace(/^(?:(?:dr|dra|lic|tec|ing|mg)\.?\s+)+/i, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  download(): void {
    if (!this.rows.length) return;

    const cell = (value: string): string => {
      const safe = /^[\s]*[=+@-]/.test(value)
        ? `'${value}`
        : value;

      return `"${safe.replaceAll('"', '""')}"`;
    };

    const csv = [
      ['Postulante', 'Puesto', 'Estado'],
      ...this.rows.map((candidate) => [
        candidate.name,
        candidate.role,
        candidate.status,
      ]),
    ]
      .map((row) => row.map(cell).join(','))
      .join('\r\n');

    const url = URL.createObjectURL(
      new Blob(['\ufeff' + csv], {
        type: 'text/csv;charset=utf-8',
      }),
    );

    const link = document.createElement('a');
    link.href = url;
    link.download = 'resultados-palmeras.csv';

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}