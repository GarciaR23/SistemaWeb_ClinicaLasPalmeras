import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  claveFecha,
  iniciales,
} from '../../../../core/utils/formato';
import { Icon } from '../../../../shared/components/icono/icono';
import { ServicioSaludOcupacional } from '../../services/servicio-salud';

@Component({
  selector: 'app-agenda-examenes',
  standalone: true,
  imports: [FormsModule, Icon],
  templateUrl: './agenda-examenes.html',
  styleUrl: './agenda-examenes.scss',
})
export class AgendaExamenes implements OnInit {
  readonly servicio = inject(ServicioSaludOcupacional);

  fecha = claveFecha(new Date());
  loading = true;
  error = '';

  get titulo(): string {
    const texto = new Date(`${this.fecha}T00:00:00`).toLocaleDateString(
      'es-PE',
      { weekday: 'long', day: 'numeric', month: 'long' },
    );

    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  get citas() {
    return this.servicio.agendaDelDia(this.fecha);
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.servicio.cargar();
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'No se pudo cargar la agenda.';
    } finally {
      this.loading = false;
    }
  }

  cupos(sede: string): number {
    return this.servicio.cuposDisponibles(sede, this.fecha);
  }

  etiquetaCupos(sede: string): string {
    const total = this.cupos(sede);

    if (!total) return 'Sin cupos';

    return `${total} ${total === 1 ? 'cupo' : 'cupos'}`;
  }

  iniciales(nombre: string): string {
    return iniciales(nombre);
  }
}
