import { inject, Injectable, signal } from '@angular/core';

import { ApiClient } from '../../../core/services/cliente-api';
import { LocalStore } from '../../../core/services/almacenamiento-local';
import { Account } from '../../../core/services/modelos-sesion';
import { ServicioAutenticacion } from '../../autenticacion/services/servicio-autenticacion';
import { environment } from '../../../../environments/environment';
import { NuevoUsuario, ResultadoCreacion } from '../models/usuario';

@Injectable({
  providedIn: 'root',
})
export class ServicioUsuarios {
  private readonly api = inject(ApiClient);
  private readonly auth = inject(ServicioAutenticacion);
  private readonly store = inject(LocalStore);

  readonly usuarios = signal<Account[]>([]);

  async cargar(): Promise<void> {
    this.usuarios.set(
      environment.demoMode
        ? this.auth.listarCuentas()
        : await this.api.request<Account[]>('/usuarios'),
    );
  }

  async crear(datos: NuevoUsuario): Promise<ResultadoCreacion> {
    if (!environment.demoMode) {
      const account = await this.api.request<Account>(
        '/usuarios',
        'POST',
        datos,
      );

      await this.cargar();

      return { account };
    }

    const resultado = this.auth.crearCuentaTrabajador(
      datos.name,
      datos.role,
    );

    this.store.audit(
      `Creó la cuenta de ${resultado.account.name}`,
      'Seguridad',
    );

    await this.cargar();

    return resultado;
  }

  async cambiarEstado(usuario: Account, activo: boolean): Promise<void> {
    if (!environment.demoMode) {
      await this.api.request(`/usuarios/${usuario.id}`, 'PATCH', {
        active: activo,
      });

      await this.cargar();
      return;
    }

    this.auth.cambiarEstadoCuenta(usuario.email, activo);

    this.store.audit(
      `${activo ? 'Activó' : 'Desactivó'} la cuenta de ${usuario.name}`,
      'Seguridad',
    );

    await this.cargar();
  }
}
