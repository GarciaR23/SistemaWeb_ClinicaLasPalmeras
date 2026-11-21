import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import {
  claveFecha,
  fechaCorta,
  iniciales,
} from '../../../../core/utils/formato';
import { Icon } from '../../../../shared/components/icono/icono';
import { Modal } from '../../../../shared/components/modal/modal';
import {
  ESTADOS_SOLICITUD,
  EstadoSolicitud,
  SolicitudVista,
  TIPOS_EXAMEN,
} from '../../models/solicitud-examen';
import { ServicioSaludOcupacional } from '../../services/servicio-salud';

type FiltroEstado = EstadoSolicitud | 'todas';

@Component({
  selector: 'app-solicitudes-recibidas',
  standalone: true,
  imports: [FormsModule, Icon, Modal],
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

  busqueda = '';
  estadoFiltro: FiltroEstado = 'todas';

  /** Solicitud que se está programando. */
  seleccion: SolicitudVista | null = null;
  /** Solicitud cuyo detalle se está viendo. */
  detalle: SolicitudVista | null = null;

  formError = '';
  form = { sede: '', fecha: '', hora: '', tipo: TIPOS_EXAMEN[0] as string };

  get horarios(): string[] {
    return this.servicio.horariosDisponibles(this.form.sede, this.form.fecha);
  }

  /** Contadores por estado; también sirven como filtro. */
  get contadores(): { clave: FiltroEstado; etiqueta: string; total: number; tono: string }[] {
    const todas = this.servicio.solicitudesVista();
    const por = (estado: EstadoSolicitud) =>
      todas.filter((solicitud) => solicitud.estado === estado).length;

    return [
      { clave: 'todas', etiqueta: 'Todas', total: todas.length, tono: 'azul' },
      ...ESTADOS_SOLICITUD.map((estado) => ({
        clave: estado as FiltroEstado,
        etiqueta: estado === 'Pendiente' ? 'Pendientes' : estado === 'Programada' ? 'Programadas' : 'Realizadas',
        total: por(estado),
        tono: this.tono(estado),
      })),
    ];
  }

  get filtradas(): SolicitudVista[] {
    const texto = this.normalizar(this.busqueda);

    return this.servicio.solicitudesVista().filter(
      (solicitud) =>
        (this.estadoFiltro === 'todas' || solicitud.estado === this.estadoFiltro) &&
        (!texto ||
          this.normalizar(
            `${solicitud.nombre} ${solicitud.puesto} ${solicitud.dni} ${solicitud.tipo}`,
          ).includes(texto)),
    );
  }

  get hayFiltros(): boolean {
    return this.estadoFiltro !== 'todas' || !!this.busqueda.trim();
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

  /** Color de la etiqueta de cada estado (mismas familias que Postulante). */
  tono(estado: EstadoSolicitud): string {
    if (estado === 'Pendiente') return 'ambar';

    return estado === 'Programada' ? 'celeste' : 'verde';
  }

  filtrarPor(clave: FiltroEstado): void {
    this.estadoFiltro = clave;
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.estadoFiltro = 'todas';
  }

  verDetalle(solicitud: SolicitudVista): void {
    this.detalle = solicitud;
  }

  cerrarDetalle(): void {
    this.detalle = null;
  }

  programarDesdeDetalle(): void {
    const solicitud = this.detalle;

    this.detalle = null;

    if (solicitud) this.abrir(solicitud);
  }

  abrir(solicitud: SolicitudVista): void {
    if (solicitud.demostracion) return;

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

  private normalizar(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  private mensaje(error: unknown, alternativo: string): string {
    return error instanceof Error ? error.message : alternativo;
  }
}
