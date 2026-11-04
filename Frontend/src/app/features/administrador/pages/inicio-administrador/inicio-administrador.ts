import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Icon } from '../../../../shared/components/icono/icono';
import { environment } from '../../../../../environments/environment';
import {
  AccesoRapido,
  ResumenAdministrador,
} from '../../models/resumen-administrador';
import { ServicioResumenAdministrador } from '../../services/servicio-resumen';

@Component({
  selector: 'app-inicio-administrador',
  standalone: true,
  imports: [RouterLink, Icon],
  templateUrl: './inicio-administrador.html',
  styleUrl: './inicio-administrador.scss',
})
export class InicioAdministrador implements OnInit {
  private readonly servicio = inject(ServicioResumenAdministrador);

  readonly origenServicios = environment.demoMode
    ? 'Servicios de la demostración'
    : 'Servicios de la plataforma';

  readonly accesos: AccesoRapido[] = [
    {
      titulo: 'Gestionar usuarios',
      descripcion: 'Cuentas, roles y activación',
      ruta: '/administrador/usuarios',
      icono: 'user',
    },
    {
      titulo: 'Revisar auditoría',
      descripcion: 'Actividad reciente del sistema',
      ruta: '/administrador/auditoria',
      icono: 'file',
    },
    {
      titulo: 'Configuración general',
      descripcion: 'Institución y accesibilidad',
      ruta: '/administrador/configuracion',
      icono: 'settings',
    },
  ];

  resumen: ResumenAdministrador | null = null;
  loading = true;
  error = '';

  async ngOnInit(): Promise<void> {
    try {
      this.resumen = await this.servicio.obtenerResumen();
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'No se pudo cargar el resumen.';
    } finally {
      this.loading = false;
    }
  }
}
