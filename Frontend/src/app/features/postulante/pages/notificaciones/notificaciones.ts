import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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
  protected readonly filtro = signal<'todas' | 'no-leidas' | 'leidas'>('todas');

  protected readonly listaFiltrada = computed(() => {
    const l = this.servicio.lista();
    const f = this.filtro();
    if (f === 'no-leidas') return l.filter((n) => !n.leida);
    if (f === 'leidas') return l.filter((n) => n.leida);
    return l;
  });
}
