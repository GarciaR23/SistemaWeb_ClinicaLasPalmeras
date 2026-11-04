import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EstadoVacio } from '../../components/estado-vacio/estado-vacio';
import { Icono } from '../../components/icono/icono';
import { ServicioNotificaciones } from '../../services/servicio-notificaciones';

@Component({
  selector: 'app-notificaciones',
  imports: [DatePipe, EstadoVacio, Icono],
  templateUrl: './notificaciones.html',
  styleUrl: './notificaciones.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Notificaciones {
  protected readonly servicio = inject(ServicioNotificaciones);
}
