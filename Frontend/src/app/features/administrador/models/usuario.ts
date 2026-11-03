import { Account, UserRole } from '../../../core/services/modelos-sesion';

/** Roles que solo puede asignar el administrador (los postulantes se registran solos). */
export const ROLES_PRIVILEGIADOS: UserRole[] = ['rrhh', 'health', 'admin'];

export interface NuevoUsuario {
  name: string;
  role: UserRole;
}

export interface ResultadoCreacion {
  account: Account;
  /** Solo disponible en la demostración; el backend enviará la invitación por correo. */
  temporaryPassword?: string;
}
