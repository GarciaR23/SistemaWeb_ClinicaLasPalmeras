import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { EstadoVacio } from '../../components/estado-vacio/estado-vacio';
import { Icono } from '../../components/icono/icono';
import { TarjetaVacante } from '../../components/tarjeta-vacante/tarjeta-vacante';
import { Vacante } from '../../models/vacante';
import { ServicioPostulaciones } from '../../services/servicio-postulaciones';
import { ServicioVacantes } from '../../services/servicio-vacantes';
import { Modal } from '../../../../shared/components/modal/modal';

const normalizar = (t: string) => t.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

@Component({
  selector: 'app-vacantes',
  imports: [TarjetaVacante, EstadoVacio, Icono, Modal, DatePipe, FormsModule],
  templateUrl: './vacantes.html',
  styleUrl: './vacantes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Vacantes {
  private readonly servicioVacantes = inject(ServicioVacantes);
  private readonly servicioPostulaciones = inject(ServicioPostulaciones);

  protected readonly busqueda = signal('');
  protected readonly vacanteSeleccionada = signal<Vacante | null>(null);
  protected readonly formularioPostulacion = signal(false);
  protected readonly vacantePendiente = signal<Vacante | null>(null);
  protected readonly datosPostulacion = {
    nombre: '',
    correo: '',
    dni: '',
    telefono: '',
    experiencia: '',
    ubicacion: '',
  };
  protected readonly vacantes = computed(() => {
    const texto = normalizar(this.busqueda().trim());
    return this.servicioVacantes.lista().filter((v) => normalizar(`${v.titulo} ${v.area}`).includes(texto));
  });

  protected yaPostulo(id: number): boolean {
    return this.servicioPostulaciones.yaPostulo(id);
  }

  protected postular(vacante: Vacante): void {
    this.servicioPostulaciones.postular(vacante);
  }

  protected abrirFormulario(vacante: Vacante): void {
    if (this.yaPostulo(vacante.id)) return;
    this.vacantePendiente.set(vacante);
    this.formularioPostulacion.set(true);
  }

  protected verDetalle(vacante: Vacante): void {
    this.vacanteSeleccionada.set(vacante);
  }

  protected cerrarDetalle(): void {
    this.vacanteSeleccionada.set(null);
  }

  protected postularDesdeDetalle(): void {
    const vacante = this.vacanteSeleccionada();
    if (vacante && !this.yaPostulo(vacante.id)) {
      this.abrirFormulario(vacante);
      this.vacanteSeleccionada.set(null);
    }
  }

  protected enviarPostulacion(formulario: NgForm): void {
    if (formulario.invalid) {
      formulario.control.markAllAsTouched();
      return;
    }

    const vacante = this.vacantePendiente();
    if (vacante) this.postular(vacante);
    this.formularioPostulacion.set(false);
    this.vacantePendiente.set(null);
  }
}
