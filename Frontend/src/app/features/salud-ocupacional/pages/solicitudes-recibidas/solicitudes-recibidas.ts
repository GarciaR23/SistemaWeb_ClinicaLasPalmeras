import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import {
  claveFecha,
  fechaCorta,
  iniciales,
} from '../../../../core/utils/formato';
import { Badge } from '../../../../shared/components/badge/badge';
import { Icon } from '../../../../shared/components/icono/icono';
import { Modal } from '../../../../shared/components/modal/modal';
import {
  SolicitudExamen,
  TIPOS_EXAMEN,
} from '../../models/solicitud-examen';
import { ServicioSaludOcupacional } from '../../services/servicio-salud';

@Component({
  selector: 'app-solicitudes-recibidas',
  standalone: true,
  imports: [FormsModule, Badge, Icon, Modal],
  templateUrl: './solicitudes-recibidas.html',
  styleUrl: './solicitudes-recibidas.scss',
})
export class SolicitudesRecibidas implements OnInit {
  readonly servicio = inject(ServicioSaludOcupacional);

  readonly tipos = TIPOS_EXAMEN;
  readonly hoy = claveFecha(new Date());

  loading = true;
  saving = false;
  error = '';
  notice = '';

  seleccion: SolicitudExamen | null = null;
  formError = '';
  form = { sede: '', fecha: '', hora: '', tipo: TIPOS_EXAMEN[0] as string };

  get horarios(): string[] {
    return this.servicio.horariosDisponibles(this.form.sede, this.form.fecha);
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.servicio.cargar();
    } catch (error) {
      this.error = this.mensaje(error, 'No se pudieron cargar las solicitudes.');
    } finally {
      this.loading = false;
    }
  }

  iniciales(nombre: string): string {
    return iniciales(nombre);
  }

  abrir(solicitud: SolicitudExamen): void {
    const sede = this.servicio.sedes[0]?.name ?? '';

    this.seleccion = solicitud;
    this.formError = '';
    this.form = {
      sede,
      fecha: this.primerDiaDisponible(sede),
      hora: '',
      tipo: TIPOS_EXAMEN[0],
    };
    this.ajustarHora();
  }

  cerrar(): void {
    if (this.saving) return;

    this.seleccion = null;
  }

  cambioSede(): void {
    this.form.fecha = this.primerDiaDisponible(this.form.sede);
    this.ajustarHora();
  }

  ajustarHora(): void {
    this.form.hora = this.horarios[0] ?? '';
  }

  async confirmar(formulario: NgForm): Promise<void> {
    if (this.saving || !this.seleccion) return;

    formulario.control.markAllAsTouched();
    this.formError = '';

    if (formulario.invalid || !this.form.hora) {
      this.formError = 'Selecciona un horario disponible.';
      return;
    }

    this.saving = true;

    try {
      const solicitud = this.seleccion;

      await this.servicio.programar({
        applicationId: solicitud.id,
        ...this.form,
      });

      this.seleccion = null;
      this.error = '';
      this.notice =
        `Evaluación programada para ${solicitud.nombre}: ` +
        `${fechaCorta(this.form.fecha)} a las ${this.form.hora} en ${this.form.sede}.`;
    } catch (error) {
      this.formError = this.mensaje(error, 'No se pudo programar la evaluación.');
      this.ajustarHora();
    } finally {
      this.saving = false;
    }
  }

  /** Busca desde hoy el primer día de los próximos 30 con horarios libres. */
  private primerDiaDisponible(sede: string): string {
    const dia = new Date();

    for (let i = 0; i < 30; i++) {
      const clave = claveFecha(dia);

      if (this.servicio.horariosDisponibles(sede, clave).length) return clave;

      dia.setDate(dia.getDate() + 1);
    }

    return this.hoy;
  }

  private mensaje(error: unknown, alternativo: string): string {
    return error instanceof Error ? error.message : alternativo;
  }
}
