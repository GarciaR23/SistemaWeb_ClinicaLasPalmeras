import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { Session } from '../../../../core/services/sesion';
import {
  Account,
  ROLE_LABELS,
  UserRole,
} from '../../../../core/services/modelos-sesion';
import {
  formatearFechaHora,
  iniciales,
} from '../../../../core/utils/formato';
import { Icon } from '../../../../shared/components/icono/icono';
import { Modal } from '../../../../shared/components/modal/modal';
import { NuevoUsuario, ROLES_PRIVILEGIADOS } from '../../models/usuario';
import { ServicioUsuarios } from '../../services/servicio-usuarios';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [FormsModule, Icon, Modal],
  templateUrl: './gestion-usuarios.html',
  styleUrl: './gestion-usuarios.scss',
})
export class GestionUsuarios implements OnInit {
  private readonly servicio = inject(ServicioUsuarios);
  private readonly session = inject(Session);

  readonly roles = Object.entries(ROLE_LABELS) as [UserRole, string][];
  readonly rolesPrivilegiados = ROLES_PRIVILEGIADOS.map((valor) => ({
    valor,
    etiqueta: ROLE_LABELS[valor],
  }));

  search = '';
  roleFilter: UserRole | 'todos' = 'todos';

  loading = true;
  busyId: number | null = null;
  saving = false;
  error = '';
  notice = '';

  modalOpen = false;
  formError = '';
  draft: NuevoUsuario = { name: '', role: 'rrhh' };

  get filtrados(): Account[] {
    const texto = this.normalizar(this.search);

    return this.servicio.usuarios().filter(
      (usuario) =>
        (this.roleFilter === 'todos' || usuario.role === this.roleFilter) &&
        (!texto ||
          this.normalizar(`${usuario.name} ${usuario.email}`).includes(texto)),
    );
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.servicio.cargar();
    } catch (error) {
      this.error = this.mensaje(error, 'No se pudo cargar la lista de usuarios.');
    } finally {
      this.loading = false;
    }
  }

  etiquetaRol(role: UserRole): string {
    return ROLE_LABELS[role];
  }

  iniciales(nombre: string): string {
    return iniciales(nombre);
  }

  ultimoAcceso(usuario: Account): string {
    return formatearFechaHora(usuario.lastAccess) ?? '—';
  }

  esCuentaPropia(usuario: Account): boolean {
    return usuario.email === this.session.user()?.email;
  }

  openCreate(): void {
    this.draft = { name: '', role: 'rrhh' };
    this.formError = '';
    this.modalOpen = true;
  }

  closeCreate(): void {
    if (this.saving) return;

    this.modalOpen = false;
  }

  async create(form: NgForm): Promise<void> {
    if (this.saving) return;

    form.control.markAllAsTouched();
    this.formError = '';

    if (form.invalid) return;

    this.saving = true;

    try {
      const { account, temporaryPassword } = await this.servicio.crear({
        name: this.draft.name,
        role: this.draft.role,
      });

      this.modalOpen = false;
      this.error = '';
      this.notice = temporaryPassword
        ? `Cuenta creada para ${account.name}. Correo: ${account.email} · Contraseña temporal: ${temporaryPassword}`
        : `Cuenta creada para ${account.name}. Recibirá las indicaciones de acceso.`;
    } catch (error) {
      this.formError = this.mensaje(error, 'No se pudo crear la cuenta.');
    } finally {
      this.saving = false;
    }
  }

  async alternarEstado(usuario: Account): Promise<void> {
    if (this.busyId !== null || this.esCuentaPropia(usuario)) return;

    this.busyId = usuario.id;
    this.error = '';
    this.notice = '';

    try {
      await this.servicio.cambiarEstado(usuario, !usuario.active);
    } catch (error) {
      this.error = this.mensaje(error, 'No se pudo actualizar la cuenta.');
    } finally {
      this.busyId = null;
    }
  }

  private normalizar(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  private mensaje(error: unknown, alternativo: string): string {
    return error instanceof Error ? error.message : alternativo;
  }
}
