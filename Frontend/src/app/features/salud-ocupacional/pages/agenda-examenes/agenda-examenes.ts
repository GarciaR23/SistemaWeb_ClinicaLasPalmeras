import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  claveFecha,
  iniciales,
} from '../../../../core/utils/formato';
import { Icon } from '../../../../shared/components/icono/icono';
import { Modal } from '../../../../shared/components/modal/modal';
import { ServicioSaludOcupacional } from '../../services/servicio-salud';

type Sede = ServicioSaludOcupacional['sedes'][number];

@Component({
  selector: 'app-agenda-examenes',
  standalone: true,
  imports: [FormsModule, RouterLink, Icon, Modal],
  templateUrl: './agenda-examenes.html',
  styleUrl: './agenda-examenes.scss',
})
export class AgendaExamenes implements OnInit {
  readonly servicio = inject(ServicioSaludOcupacional);

  /** Un color de icono por sede (mismas familias que Postulante). */
  readonly tonos = ['azul', 'celeste', 'verde'] as const;

  fecha = claveFecha(new Date());
  loading = true;
  error = '';

  /** Sede cuyo detalle se está viendo en la ventana emergente. */
  sedeSeleccionada: Sede | null = null;

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

  /** Horarios libres de una sede en la fecha seleccionada. */
  horarios(sede: string): string[] {
    return this.servicio.horariosDisponibles(sede, this.fecha);
  }

  /** Evaluaciones de la fecha seleccionada en una sede. */
  citasDeSede(sede: string) {
    return this.citas.filter((cita) => cita.sede === sede);
  }

  verSede(sede: Sede): void {
    this.sedeSeleccionada = sede;
  }

  cerrarSede(): void {
    this.sedeSeleccionada = null;
  }

  iniciales(nombre: string): string {
    return iniciales(nombre);
  }
}
