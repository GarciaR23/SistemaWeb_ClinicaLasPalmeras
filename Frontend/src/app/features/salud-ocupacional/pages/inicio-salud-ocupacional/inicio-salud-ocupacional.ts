import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { iniciales } from '../../../../core/utils/formato';
import { Badge } from '../../../../shared/components/badge/badge';
import { Icon } from '../../../../shared/components/icono/icono';
import { ServicioSaludOcupacional } from '../../services/servicio-salud';

@Component({
  selector: 'app-inicio-salud-ocupacional',
  standalone: true,
  imports: [RouterLink, Badge, Icon],
  templateUrl: './inicio-salud-ocupacional.html',
  styleUrl: './inicio-salud-ocupacional.scss',
})
export class InicioSaludOcupacional implements OnInit {
  readonly servicio = inject(ServicioSaludOcupacional);

  loading = true;
  error = '';

  async ngOnInit(): Promise<void> {
    try {
      await this.servicio.cargar();
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'No se pudo cargar el resumen.';
    } finally {
      this.loading = false;
    }
  }

  iniciales(nombre: string): string {
    return iniciales(nombre);
  }
}
