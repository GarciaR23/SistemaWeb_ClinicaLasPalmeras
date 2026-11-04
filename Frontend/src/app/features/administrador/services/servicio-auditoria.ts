import { inject, Injectable } from '@angular/core';

import { ApiClient } from '../../../core/services/cliente-api';
import {
  LocalAudit,
  LocalStore,
} from '../../../core/services/almacenamiento-local';
import { environment } from '../../../../environments/environment';
import { crearAuditoriaDemostracion } from '../models/auditoria-demostracion';
import { RegistroAuditoria } from '../models/registro-auditoria';

@Injectable({
  providedIn: 'root',
})
export class ServicioAuditoria {
  private readonly api = inject(ApiClient);
  private readonly store = inject(LocalStore);

  async listar(): Promise<RegistroAuditoria[]> {
    if (!environment.demoMode) {
      return this.api.request<RegistroAuditoria[]>('/auditoria');
    }

    // Acciones reales registradas por el portal + historial base de la demostración.
    const locales = this.store
      .read<LocalAudit[]>('audit', [])
      .map<RegistroAuditoria>((entrada) => ({
        id: entrada.id,
        responsable: entrada.name || entrada.email,
        accion: entrada.action,
        modulo: entrada.module || 'General',
        marca: entrada.timestamp ?? null,
        fechaTexto: entrada.createdAt,
      }));

    return [...locales, ...crearAuditoriaDemostracion()].sort(
      (a, b) => (b.marca ?? 0) - (a.marca ?? 0),
    );
  }
}
