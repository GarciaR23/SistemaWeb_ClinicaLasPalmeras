import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icono, NombreIcono } from '../../components/icono/icono';
import { ETAPAS_POSTULACION } from '../../models/postulacion';
import { ServicioInicio } from '../../services/servicio-inicio';
import { Session } from '../../../../core/services/sesion';
import { primerNombre } from '../../../../core/utils/formato';

interface TarjetaResumen {
  etiqueta: string;
  valor: number;
  icono: NombreIcono;
  ruta: string;
}

@Component({
  selector: 'app-inicio-postulante',
  imports: [RouterLink, Icono],
  templateUrl: './inicio-postulante.html',
  styleUrl: './inicio-postulante.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InicioPostulante {
  private readonly servicio = inject(ServicioInicio);
  private readonly session = inject(Session);

  protected readonly nombre = computed(() => {
    const raw = this.session.user()?.name;
    return raw ? primerNombre(raw) : 'Lucía';
  });

  protected readonly etapas = ETAPAS_POSTULACION;
  protected readonly proceso = this.servicio.procesoActual;
  protected readonly recomendadas = this.servicio.recomendadas;

  protected tarjetas(): TarjetaResumen[] {
    const r = this.servicio.resumen();
    return [
      {
        etiqueta: 'Postulaciones activas',
        valor: r.postulacionesActivas,
        icono: 'documento',
        ruta: '/postulante/mis-postulaciones',
      },
      {
        etiqueta: 'Próximos eventos',
        valor: r.proximosEventos,
        icono: 'calendario',
        ruta: '/postulante/mis-entrevistas',
      },
      {
        etiqueta: 'Vacantes disponibles',
        valor: r.vacantesDisponibles,
        icono: 'maletin',
        ruta: '/postulante/vacantes',
      },
    ];
  }
}
