import { Component, inject } from '@angular/core';

import { DashboardService } from '../../services/servicio-dashboard';
import { Icon } from '../../../../shared/components/icono/icono';

@Component({
  selector: 'app-inicio-recursos-humanos',
  standalone: true,
  imports: [
    Icon,
  ],
  templateUrl: './inicio-recursos-humanos.html',
  styleUrl: './inicio-recursos-humanos.scss',
})
export class InicioRecursosHumanos {
  private readonly dashboardService = inject(DashboardService);

  readonly resumen = this.dashboardService.obtenerResumen();

  readonly cantidadMaxima = Math.max(
    1,
    ...this.resumen.etapas.map((etapa) => etapa.cantidad),
  );

  anchoBarra(cantidad: number): number {
    return (cantidad / this.cantidadMaxima) * 100;
  }
}