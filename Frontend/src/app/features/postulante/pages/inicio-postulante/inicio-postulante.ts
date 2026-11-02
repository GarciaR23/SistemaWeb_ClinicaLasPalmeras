import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icono, NombreIcono } from '../../components/icono/icono';
import { ETAPAS_POSTULACION } from '../../models/postulacion';
import { ServicioInicio } from '../../services/servicio-inicio';

interface TarjetaResumen { etiqueta: string; valor: number; icono: NombreIcono; ruta: string; }

@Component({
  selector: 'app-inicio-postulante',
  imports: [RouterLink, Icono],
  templateUrl: './inicio-postulante.html',
  styleUrl: './inicio-postulante.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InicioPostulante {
  private readonly servicio = inject(ServicioInicio);

  protected readonly nombre = 'Lucía'; // TODO: tomar de la sesión (core/services/sesion.ts)
  protected readonly etapas = ETAPAS_POSTULACION;
  protected readonly proceso = this.servicio.procesoActual;
  protected readonly recomendadas = this.servicio.recomendadas;

  protected tarjetas(): TarjetaResumen[] {
    const r = this.servicio.resumen();
    return [
      { etiqueta: 'Postulaciones activas', valor: r.postulacionesActivas, icono: 'documento', ruta: '/postulante/mis-postulaciones' },
      { etiqueta: 'Próximos eventos', valor: r.proximosEventos, icono: 'calendario', ruta: '/postulante/mis-entrevistas' },
      { etiqueta: 'Vacantes disponibles', valor: r.vacantesDisponibles, icono: 'maletin', ruta: '/postulante/vacantes' },
      { etiqueta: 'Notificaciones', valor: r.notificaciones, icono: 'campana', ruta: '/postulante/notificaciones' },
    ];
  }
}
