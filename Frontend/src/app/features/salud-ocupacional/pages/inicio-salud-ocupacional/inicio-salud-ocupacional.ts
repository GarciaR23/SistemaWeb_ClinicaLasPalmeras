import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Session } from '../../../../core/services/sesion';
import { iniciales, primerNombre } from '../../../../core/utils/formato';
import { Badge } from '../../../../shared/components/badge/badge';
import { Icon } from '../../../../shared/components/icono/icono';
import { ServicioSaludOcupacional } from '../../services/servicio-salud';

/** Foto del banner (opcional): public/images/salud-ocupacional/banner-salud.jpg */
const FOTO_BANNER = 'images/salud-ocupacional/banner-salud.jpg';
const ILUSTRACION_BANNER = 'images/salud-ocupacional/evaluacion-ocupacional.svg';

@Component({
  selector: 'app-inicio-salud-ocupacional',
  standalone: true,
  imports: [RouterLink, Badge, Icon],
  templateUrl: './inicio-salud-ocupacional.html',
  styleUrl: './inicio-salud-ocupacional.scss',
})
export class InicioSaludOcupacional implements OnInit {
  readonly servicio = inject(ServicioSaludOcupacional);
  private readonly session = inject(Session);

  /** «Bienvenido, Dr. Paredes.»: título y apellido de la cuenta en sesión. */
  readonly saludo = this.crearSaludo(this.session.user()?.name ?? '');

  /** Usa la foto si existe; si no, la ilustración incluida. */
  imagen = FOTO_BANNER;

  usarIlustracion(): void {
    if (this.imagen !== ILUSTRACION_BANNER) this.imagen = ILUSTRACION_BANNER;
  }

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

  private crearSaludo(nombre: string): string {
    const partes = nombre.trim().split(/\s+/).filter(Boolean);
    const titulo = /^(dr|dra)\.?$/i.exec(partes[0] ?? '');
    const bienvenida = titulo && /^dra/i.test(titulo[0]) ? 'Bienvenida' : 'Bienvenido';

    if (titulo && partes.length > 1) {
      return `${bienvenida}, ${partes[0]} ${partes[partes.length - 1]}.`;
    }

    const primero = primerNombre(nombre);

    return primero ? `${bienvenida}, ${primero}.` : `${bienvenida}.`;
  }
}
