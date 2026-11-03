import { Component, inject, OnInit } from '@angular/core';

import { formatearFechaHora } from '../../../../core/utils/formato';
import { Icon } from '../../../../shared/components/icono/icono';
import { RegistroAuditoria } from '../../models/registro-auditoria';
import { ServicioAuditoria } from '../../services/servicio-auditoria';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [Icon],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.scss',
})
export class Auditoria implements OnInit {
  private readonly servicio = inject(ServicioAuditoria);

  registros: RegistroAuditoria[] = [];
  loading = true;
  error = '';

  async ngOnInit(): Promise<void> {
    try {
      this.registros = await this.servicio.listar();
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'No se pudo cargar la auditoría.';
    } finally {
      this.loading = false;
    }
  }

  fecha(registro: RegistroAuditoria): string {
    return formatearFechaHora(registro.marca) ?? (registro.fechaTexto || '—');
  }
}
